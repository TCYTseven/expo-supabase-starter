import { AzureOpenAI } from "openai";
import { supabase } from "@/config/supabase";

// Simple UUID generator that works in React Native
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Types for decision tree data
export interface DecisionNode {
  id: string;
  title: string;
  content: string;
  options: { id: string; text: string }[];
  parentId: string | null;
  parentOption?: string;
  isFinal?: boolean; // Whether this is a final decision node
}

export interface DecisionTree {
  id: string;
  title: string;
  topic: string;
  context: string;
  currentNodeId: string;
  nodes: Record<string, DecisionNode>;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generates a new decision tree based on the topic and context
 */
export async function generateDecisionTree(
  topic: string, 
  context: string = "",
  userId: string,
  personalityType?: string,
  advisorPrompt?: string
): Promise<DecisionTree> {
  try {
    // Initialize Azure OpenAI client
    const endpoint = process.env.EXPO_PUBLIC_DECISION_AI_ENDPOINT;
    const apiKey = process.env.EXPO_PUBLIC_DECISION_AI_API_KEY;
    const apiVersion = process.env.EXPO_PUBLIC_DECISION_AI_API_VERSION || "2024-04-01-preview";
    const deploymentName = process.env.EXPO_PUBLIC_DECISION_AI_DEPLOYMENT || "smart8ai";
    const modelName = process.env.EXPO_PUBLIC_DECISION_AI_MODEL || "gpt-4.1-mini";

    // Create client options
    const clientOptions = { 
      endpoint, 
      apiKey, 
      deployment: deploymentName, 
      apiVersion 
    };

    const client = new AzureOpenAI(clientOptions);

    // Build prompt with context and advisor prompt if available
    let systemPrompt = `You are an AI decision-making assistant that helps users make decisions by creating structured decision trees. 
Your goal is to help the user think through their decision methodically and consider important factors.`;

    if (personalityType && personalityType !== "NONE") {
      systemPrompt += `\nThe user's personality type is ${personalityType}. Tailor your advice to match this personality.`;
    }
    
    if (advisorPrompt) {
      systemPrompt += `\n${advisorPrompt}`;
    }

    // Call Azure OpenAI to generate the decision tree
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { 
          role: "system", 
          content: systemPrompt
        },
        {
          role: "user",
          content: `I need help making a decision about: ${topic}. ${context ? `Additional context: ${context}` : ""}`
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Check if response is valid
    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error("Invalid response from Azure OpenAI");
    }

    // Parse the response content
    const content = response.choices[0].message.content?.trim() || "";
    
    // Create a unique ID for the tree and root node
    const treeId = generateUUID();
    const rootNodeId = generateUUID();
    
    // Parse the AI response to extract node content and options
    const { title, nodeContent, options } = parseAIResponse(content, topic);

    // Create the root node
    const rootNode: DecisionNode = {
      id: rootNodeId,
      title,
      content: nodeContent,
      options: options.map((optText: string) => ({
        id: generateUUID(),
        text: optText
      })),
      parentId: null
    };

    // Create the decision tree structure
    const decisionTree: DecisionTree = {
      id: treeId,
      title,
      topic,
      context,
      currentNodeId: rootNodeId,
      nodes: {
        [rootNodeId]: rootNode
      },
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return decisionTree;
  } catch (error) {
    console.error("Error generating decision tree:", error);
    throw error;
  }
}

/**
 * Parses the AI response to extract a structured format for the node
 */
function parseAIResponse(content: string, fallbackTitle: string): { 
  title: string; 
  nodeContent: string; 
  options: string[] 
} {
  // Look for patterns in the content to extract title, content, and options
  const lines = content.split('\n').filter(line => line.trim());
  
  // Try to find title (could be first line, or line starting with # or "Title:")
  let title = fallbackTitle;
  let startContentIndex = 0;
  
  if (lines.length > 0) {
    if (lines[0].startsWith('# ')) {
      title = lines[0].replace(/^# /, '');
      startContentIndex = 1;
    } else if (lines[0].match(/^Title:?\s/i)) {
      title = lines[0].replace(/^Title:?\s/i, '');
      startContentIndex = 1;
    } else if (!lines[0].match(/^[-*•]/)) {
      // If first line doesn't look like a list item, use it as title
      title = lines[0];
      startContentIndex = 1;
    }
  }
  
  // Extract options - look for lines starting with -, *, •, or numbered lists
  let optionsStartIndex = -1;
  const options: string[] = [];
  
  for (let i = startContentIndex; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^[-*•]\s/) || line.match(/^\d+\.\s/)) {
      if (optionsStartIndex === -1) optionsStartIndex = i;
      
      // Extract the option text without the bullet or number
      const optionText = line.replace(/^[-*•]\s/, '').replace(/^\d+\.\s/, '');
      options.push(optionText);
    }
  }
  
  // Extract the content between title and options
  let nodeContent = '';
  if (optionsStartIndex > startContentIndex) {
    nodeContent = lines.slice(startContentIndex, optionsStartIndex).join('\n').trim();
  } else if (options.length === 0) {
    // If no options were found, all remaining lines are content
    nodeContent = lines.slice(startContentIndex).join('\n').trim();
    
    // Generate some default options
    options.push('Tell me more', 'Explore alternatives', 'Consider other factors');
  }
  
  return {
    title,
    nodeContent,
    options
  };
}

/**
 * Continues the decision tree by generating a child node
 */
export async function continueDecisionTree(
  tree: DecisionTree,
  optionId: string
): Promise<DecisionTree> {
  try {
    const { currentNodeId, nodes } = tree;
    const currentNode = nodes[currentNodeId];
    
    if (!currentNode) {
      throw new Error('Current node not found');
    }
    
    const selectedOption = currentNode.options.find(option => option.id === optionId);
    
    if (!selectedOption) {
      throw new Error('Selected option not found');
    }
    
    // Check if this path has already been explored
    const existingNodeId = Object.keys(nodes).find(nodeId => {
      const node = nodes[nodeId];
      return node.parentId === currentNodeId && node.parentOption === optionId;
    });
    
    if (existingNodeId) {
      // Path already explored, just navigate to it
      return {
        ...tree,
        currentNodeId: existingNodeId,
        updatedAt: new Date().toISOString()
      };
    }

    // Initialize Azure OpenAI client
    const endpoint = process.env.EXPO_PUBLIC_DECISION_AI_ENDPOINT;
    const apiKey = process.env.EXPO_PUBLIC_DECISION_AI_API_KEY;
    const apiVersion = process.env.EXPO_PUBLIC_DECISION_AI_API_VERSION || "2024-04-01-preview";
    const deploymentName = process.env.EXPO_PUBLIC_DECISION_AI_DEPLOYMENT || "smart8ai";
    const modelName = process.env.EXPO_PUBLIC_DECISION_AI_MODEL || "gpt-4.1-mini";

    // Create client options
    const clientOptions = { 
      endpoint, 
      apiKey, 
      deployment: deploymentName, 
      apiVersion 
    };

    const client = new AzureOpenAI(clientOptions);

    // Build history prompt to maintain context
    let history = `We're discussing a decision about: ${tree.topic}\n`;
    if (tree.context) {
      history += `Context: ${tree.context}\n\n`;
    }
    
    // Add the current node and selected option
    history += `Previous point: ${currentNode.title}\n${currentNode.content}\n\n`;
    history += `Selected option: ${selectedOption.text}\n\n`;
    
    // Call Azure OpenAI to generate the next node
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { 
          role: "system", 
          content: "You are an AI decision-making assistant. Continue the decision tree based on the user's selection. Provide a title, detailed explanation, and 2-4 options for the next step."
        },
        {
          role: "user",
          content: history + "Based on this selection, what's the next step in making this decision? Provide a title, explanation, and 2-4 possible options."
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Check if response is valid
    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error("Invalid response from Azure OpenAI");
    }

    // Parse the response
    const content = response.choices[0].message.content?.trim() || "";
    const { title, nodeContent, options } = parseAIResponse(content, `Next step for "${selectedOption.text}"`);
    
    // Create a new node
    const newNodeId = generateUUID();
    const newNode: DecisionNode = {
      id: newNodeId,
      title,
      content: nodeContent,
      options: options.map((optText: string) => ({
        id: generateUUID(),
        text: optText
      })),
      parentId: currentNodeId,
      parentOption: optionId
    };
    
    // Update the tree
    return {
      ...tree,
      currentNodeId: newNodeId,
      nodes: {
        ...nodes,
        [newNodeId]: newNode
      },
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error continuing decision tree:", error);
    throw error;
  }
}

/**
 * Saves a decision tree to the database
 */
export async function saveDecisionTree(tree: DecisionTree): Promise<void> {
  try {
    const { error } = await supabase
      .from('decision_trees')
      .upsert({
        id: tree.id,
        user_id: tree.userId,
        title: tree.title,
        topic: tree.topic,
        context: tree.context,
        current_node_id: tree.currentNodeId,
        data: tree,
        created_at: tree.createdAt,
        updated_at: tree.updatedAt
      });
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error saving decision tree:", error);
    throw error;
  }
}

/**
 * Gets all decision trees for a user
 */
export async function getUserDecisionTrees(userId: string, limit?: number): Promise<DecisionTree[]> {
  try {
    let query = supabase
      .from('decision_trees')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
      
    // Apply limit if provided
    if (limit && typeof limit === 'number') {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
      
    if (error) {
      throw error;
    }
    
    // Convert database records to DecisionTree objects
    return data.map((record: any) => record.data as DecisionTree);
  } catch (error) {
    console.error("Error getting decision trees:", error);
    throw error;
  }
}

/**
 * Gets a specific decision tree
 */
export async function getDecisionTree(treeId: string): Promise<DecisionTree | null> {
  try {
    const { data, error } = await supabase
      .from('decision_trees')
      .select('*')
      .eq('id', treeId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No record found
        return null;
      }
      throw error;
    }
    
    return data.data as DecisionTree;
  } catch (error) {
    console.error("Error getting decision tree:", error);
    throw error;
  }
}

/**
 * Navigates to a previous node in the decision tree
 */
export function navigateBack(tree: DecisionTree): DecisionTree {
  const { currentNodeId, nodes } = tree;
  const currentNode = nodes[currentNodeId];
  
  if (!currentNode || !currentNode.parentId) {
    // Already at root or no parent
    return tree;
  }
  
  return {
    ...tree,
    currentNodeId: currentNode.parentId,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Deletes a decision tree
 */
export async function deleteDecisionTree(treeId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('decision_trees')
      .delete()
      .eq('id', treeId);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting decision tree:", error);
    throw error;
  }
}

/**
 * Generates a summary with emoji for a decision tree
 */
export async function summarizeDecisionTree(tree: DecisionTree): Promise<string> {
  try {
    // Initialize Azure OpenAI client
    const endpoint = process.env.EXPO_PUBLIC_DECISION_AI_ENDPOINT;
    const apiKey = process.env.EXPO_PUBLIC_DECISION_AI_API_KEY;
    const apiVersion = process.env.EXPO_PUBLIC_DECISION_AI_API_VERSION || "2024-04-01-preview";
    const deploymentName = process.env.EXPO_PUBLIC_DECISION_AI_DEPLOYMENT || "smart8ai";
    const modelName = process.env.EXPO_PUBLIC_DECISION_AI_MODEL || "gpt-4.1-mini";

    // Create client options
    const clientOptions = { 
      endpoint, 
      apiKey, 
      deployment: deploymentName, 
      apiVersion 
    };

    const client = new AzureOpenAI(clientOptions);
    
    // Build the content to summarize - get the decision topic and context
    let decisionContent = `Decision topic: ${tree.topic}`;
    if (tree.context) {
      decisionContent += `\nContext: ${tree.context}`;
    }
    
    // Get the key nodes (first node + current node if different)
    const rootNodeId = Object.keys(tree.nodes).find(id => tree.nodes[id].parentId === null) || '';
    const rootNode = tree.nodes[rootNodeId];
    const currentNode = tree.nodes[tree.currentNodeId];
    
    if (rootNode) {
      decisionContent += `\nInitial consideration: ${rootNode.title}\n${rootNode.content}`;
    }
    
    if (currentNode && currentNode.id !== rootNodeId) {
      decisionContent += `\nCurrent consideration: ${currentNode.title}\n${currentNode.content}`;
    }

    // Call Azure OpenAI to generate the summary
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that creates very concise summaries. Summarize the decision in one short sentence and include one relevant emoji at the beginning."
        },
        {
          role: "user",
          content: `Summarize this decision process in one short sentence with an emoji at the beginning:\n${decisionContent}`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    // Check if response is valid
    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error("Invalid response from Azure OpenAI");
    }

    // Return the summary
    return response.choices[0].message.content?.trim() || `${tree.title}`;
  } catch (error) {
    console.error("Error summarizing decision tree:", error);
    // Return a fallback summary if there's an error
    return `📝 ${tree.title}`;
  }
}

/**
 * Checks if a decision tree should be concluded based on depth and context
 */
export function shouldConcludeDecision(tree: DecisionTree): boolean {
  // Get the number of nodes in the decision path
  const nodeCount = Object.keys(tree.nodes).length;
  
  // Always conclude if we've reached the maximum of 10 nodes
  if (nodeCount >= 10) {
    return true;
  }
  
  // If we've gone through at least 3 steps, consider concluding based on context
  if (nodeCount >= 3) {
    // Get the current node
    const currentNode = tree.nodes[tree.currentNodeId];
    
    // Check if the options look like conclusions
    // Common conclusion patterns include options containing "yes", "no", "definitely", etc.
    if (currentNode && currentNode.options.length > 0) {
      const conclusionPatterns = [
        /yes/i, /no/i, /definitely/i, /certainly/i, /probably/i, 
        /recommend/i, /suggest/i, /advise/i, /final/i, /decide/i, /conclusion/i
      ];
      
      // Check if multiple options have conclusion patterns
      const conclusionOptionCount = currentNode.options.filter(option => 
        conclusionPatterns.some(pattern => pattern.test(option.text))
      ).length;
      
      // If more than half the options look like conclusions, suggest concluding
      if (conclusionOptionCount >= Math.ceil(currentNode.options.length / 2)) {
        return true;
      }
      
      // As we get deeper in the tree, increase likelihood of concluding
      // At 5 nodes, 30% chance; at 7 nodes, 60% chance; at 9 nodes, 90% chance
      if (nodeCount >= 5) {
        const conclusionProbability = (nodeCount - 4) * 0.15; // 15% increase per node after 4
        return Math.random() < conclusionProbability;
      }
    }
  }
  
  return false;
}

/**
 * Generates a final decision and reflection
 */
export async function generateFinalDecision(tree: DecisionTree): Promise<{
  decision: string;
  reflection: string;
  updatedTree: DecisionTree;
}> {
  try {
    // Initialize Azure OpenAI client
    const endpoint = process.env.EXPO_PUBLIC_DECISION_AI_ENDPOINT;
    const apiKey = process.env.EXPO_PUBLIC_DECISION_AI_API_KEY;
    const apiVersion = process.env.EXPO_PUBLIC_DECISION_AI_API_VERSION || "2024-04-01-preview";
    const deploymentName = process.env.EXPO_PUBLIC_DECISION_AI_DEPLOYMENT || "smart8ai";
    const modelName = process.env.EXPO_PUBLIC_DECISION_AI_MODEL || "gpt-4.1-mini";

    // Create client options
    const clientOptions = { 
      endpoint, 
      apiKey, 
      deployment: deploymentName, 
      apiVersion 
    };

    const client = new AzureOpenAI(clientOptions);
    
    // Prepare context from the entire decision path
    let decisionContext = `Decision topic: ${tree.topic}\n`;
    if (tree.context) {
      decisionContext += `Initial context: ${tree.context}\n\n`;
    }
    
    // Extract the decision path by following parent relationships
    const decisionPath: DecisionNode[] = [];
    let currentNodeId = tree.currentNodeId;
    
    while (currentNodeId) {
      const node = tree.nodes[currentNodeId];
      if (!node) break;
      
      decisionPath.unshift(node); // Add to front of array to maintain order
      currentNodeId = node.parentId || '';
    }
    
    // Add the decision path to context
    decisionPath.forEach((node, index) => {
      decisionContext += `Step ${index + 1}: ${node.title}\n${node.content}\n`;
      
      // If not the last node, add the selected option
      if (index < decisionPath.length - 1) {
        const nextNode = decisionPath[index + 1];
        const selectedOption = node.options.find(opt => 
          nextNode.parentOption === opt.id
        );
        
        if (selectedOption) {
          decisionContext += `Selected: ${selectedOption.text}\n\n`;
        }
      }
    });
    
    // Call Azure OpenAI to generate the final decision
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { 
          role: "system", 
          content: "You are a thoughtful decision assistant. Based on the decision steps and context provided, generate a final decision recommendation and a reflection that explains the reasoning, considerations, and potential outcomes."
        },
        {
          role: "user",
          content: `${decisionContext}\n\nBased on this decision process, please provide:\n1. A clear final decision recommendation (1-2 sentences)\n2. A thoughtful reflection on this decision, including key factors considered and potential implications (3-5 sentences)`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    // Check if response is valid
    if (!response || !response.choices || response.choices.length === 0) {
      throw new Error("Invalid response from Azure OpenAI");
    }

    // Parse the response
    const content = response.choices[0].message.content?.trim() || "";
    
    // Extract decision and reflection from the response
    let decision = "Based on the considerations, a decision has been reached.";
    let reflection = content;
    
    // Try to separate decision from reflection based on format
    const decisionMatch = content.match(/(?:1\.\s*|decision:?\s*)(.*?)(?:\n\n|\n2\.|\nreflection:)/is);
    const reflectionMatch = content.match(/(?:2\.\s*|reflection:?\s*)(.*)/is);
    
    if (decisionMatch && decisionMatch[1]) {
      decision = decisionMatch[1].trim();
    }
    
    if (reflectionMatch && reflectionMatch[1]) {
      reflection = reflectionMatch[1].trim();
    }
    
    // Mark the current node as final
    const updatedNodes = { ...tree.nodes };
    updatedNodes[tree.currentNodeId] = {
      ...updatedNodes[tree.currentNodeId],
      isFinal: true
    };
    
    // Create updated tree
    const updatedTree: DecisionTree = {
      ...tree,
      nodes: updatedNodes,
      updatedAt: new Date().toISOString()
    };
    
    // Save the updated tree
    await saveDecisionTree(updatedTree);
    
    return {
      decision,
      reflection,
      updatedTree
    };
  } catch (error) {
    console.error("Error generating final decision:", error);
    throw error;
  }
} 