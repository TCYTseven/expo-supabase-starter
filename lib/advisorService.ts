import { AzureOpenAI } from "openai";
import { supabase } from "@/config/supabase";

// Define type for advisor data coming from the form
export type AdvisorFormData = {
  name: string;
  communicationTraits: string[];
  personalityTraits: string[];
  sliders: {
    directness: number;
    optimism: number;
    creativity: number;
    detail: number;
  };
  background?: string;
  expertise?: string;
  tone?: string;
};

/**
 * Updates the user's advisor profile with both raw data and AI-generated prompt
 */
export async function createCustomAdvisor(advisorData: AdvisorFormData, userId: string): Promise<{ success: boolean, advisorPrompt?: string, error?: any }> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // If userId is "preview", just generate the prompt but don't save to the database
    if (userId === "preview") {
      const advisorPrompt = await generateAdvisorPrompt(advisorData);
      return {
        success: true,
        advisorPrompt
      };
    }

    // Generate AI prompt
    const advisorPrompt = await generateAdvisorPrompt(advisorData);
    
    // Store both the raw data and the AI-generated prompt
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        custom_advisors: {
          raw: advisorData,
          prompt: advisorPrompt
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return { 
      success: true,
      advisorPrompt
    };
  } catch (error) {
    console.error("Error creating custom advisor:", error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Generates an advisor prompt based on form data using Azure OpenAI
 */
export async function generateAdvisorPrompt(advisorData: AdvisorFormData): Promise<string> {
  try {
    // Initialize Azure OpenAI client with the correct configuration
    const endpoint = process.env.EXPO_PUBLIC_AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.EXPO_PUBLIC_AZURE_OPENAI_API_KEY;
    const apiVersion = "2025-01-01-preview";
    const deployment = "advisorbuild4o";


    // Create options object for the client
    const options = { 
      endpoint, 
      apiKey, 
      deployment, 
      apiVersion 
    };

    const client = new AzureOpenAI(options);

    // Convert slider values to descriptive text for better prompt creation
    const directnessLevel = getSliderDescription("directness", advisorData.sliders.directness);
    const optimismLevel = getSliderDescription("optimism", advisorData.sliders.optimism);
    const creativityLevel = getSliderDescription("creativity", advisorData.sliders.creativity);
    const detailLevel = getSliderDescription("detail", advisorData.sliders.detail);

    // Create a detailed description of the advisor based on the form data
    const advisorDescription = `
      Name: ${advisorData.name}
      Communication Style: ${advisorData.communicationTraits.join(", ")}
      Personality Traits: ${advisorData.personalityTraits.join(", ")}
      Directness: ${directnessLevel}
      Optimism: ${optimismLevel}
      Approach: ${creativityLevel}
      Focus: ${detailLevel}
      ${advisorData.background ? `Background: ${advisorData.background}` : ""}
      ${advisorData.expertise ? `Areas of Expertise: ${advisorData.expertise}` : ""}
      ${advisorData.tone ? `Tone and Voice: ${advisorData.tone}` : ""}
    `;

    // Call Azure OpenAI to generate the prompt
    const response = await client.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: "You are a prompt engineer. Based on the following user-submitted information, create a 2-sentence prompt that captures the user's desired advisor persona, tone, and focus area. This prompt will later be prepended to any advice the user requests. The output should be specific, helpful, and easy to append to future prompts."
        },
        {
          role: "user",
          content: advisorDescription
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
      model: deployment
    });

    // Check if response is valid
    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error("Invalid response from Azure OpenAI");
    }

    // Return the generated prompt from the AI
    return response.choices[0].message.content?.trim() || 
      `I am ${advisorData.name}, your personal advisor. I will provide advice based on your needs.`;
    
  } catch (error) {
    console.error("Error generating advisor prompt:", error);
    // Return a fallback prompt if there's an error
    return `I am ${advisorData.name}, your personal advisor. I will provide advice based on your needs.`;
  }
}

/**
 * Converts slider values to descriptive text
 */
function getSliderDescription(sliderName: string, value: number): string {
  // Map 1-10 values to descriptive terms
  const sliderDescriptions: Record<string, Record<string, string>> = {
    directness: {
      low: "Very gentle and indirect",
      medium: "Balanced directness",
      high: "Very direct and straightforward"
    },
    optimism: {
      low: "Realistic and pragmatic",
      medium: "Balanced optimism",
      high: "Highly optimistic and positive"
    },
    creativity: {
      low: "Conventional and traditional",
      medium: "Balanced creativity",
      high: "Highly creative and innovative"
    },
    detail: {
      low: "Big picture focused",
      medium: "Balanced attention to detail",
      high: "Highly detail-oriented"
    }
  };

  // Determine which description to use based on value
  let level: string;
  if (value <= 3) {
    level = "low";
  } else if (value <= 7) {
    level = "medium";
  } else {
    level = "high";
  }

  return sliderDescriptions[sliderName][level];
}

/**
 * Extracts the advisor prompt from the custom_advisors field
 * Handles both the new format (with raw and prompt) and the old format
 */
export function getAdvisorPrompt(customAdvisorData: any): string {
  if (!customAdvisorData) {
    return "I am your personal advisor. How can I help you?";
  }

  // Handle if it's already in the right format
  if (typeof customAdvisorData === 'object' && customAdvisorData.prompt) {
    return customAdvisorData.prompt;
  }
  
  // Handle string value that needs parsing
  if (typeof customAdvisorData === 'string') {
    if (customAdvisorData === "Not Set") {
      return "I am your personal advisor. How can I help you?";
    }

    try {
      // Try to parse as JSON
      const parsedData = JSON.parse(customAdvisorData);
      
      if (parsedData.prompt) {
        return parsedData.prompt;
      }
      
      if (parsedData.name) {
        return `I am ${parsedData.name}, your personal advisor. I will provide advice based on your needs.`;
      }
      
      return "I am your personal advisor. How can I help you?";
    } catch (e) {
      // If not valid JSON, assume it's already a prompt string
      return customAdvisorData;
    }
  }
  
  // Fallback
  return "I am your personal advisor. How can I help you?";
} 