import { supabase } from '@/config/supabase';
import { nanoid } from 'nanoid';

export interface Option {
  id: string;
  text: string;
}

export interface DecisionNode {
  id: string;
  title: string;
  content: string;
  options: Option[];
  parentId: string | null;
  parentOption?: string;
}

export interface FlowchartData {
  id: string;
  topic: string;
  context: string;
  currentNodeId: string;
  nodes: Record<string, DecisionNode>;
}

export async function generateDecisionFlowchart(
  topic: string,
  context: string,
  advisorId?: string
): Promise<FlowchartData> {
  try {
    const flowchartId = nanoid();
    const rootNodeId = nanoid();

    let prompt = `Create a decision flowchart about "${topic}". Context: ${context}.`;
    
    if (advisorId) {
      // If an advisorId is provided, we'll use the specific advisor's prompt
      const { data: advisor, error } = await supabase
        .from('custom_advisors')
        .select('prompt')
        .eq('id', advisorId)
        .single();
      
      if (error) {
        throw new Error(`Error fetching advisor: ${error.message}`);
      }
      
      if (advisor?.prompt) {
        prompt = `${advisor.prompt} Create a decision flowchart about "${topic}". Context: ${context}.`;
      }
    }

    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'gpt-4', // or whatever model you're using
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.response || '';

    // Parse the response to extract node content and options
    const { title, nodeContent, options } = parseInitialNode(content);

    // Create the initial node
    const rootNode: DecisionNode = {
      id: rootNodeId,
      title,
      content: nodeContent,
      options: options.map(optionText => ({
        id: nanoid(),
        text: optionText
      })),
      parentId: null
    };

    // Create the flowchart structure
    const flowchart: FlowchartData = {
      id: flowchartId,
      topic,
      context,
      currentNodeId: rootNodeId,
      nodes: {
        [rootNodeId]: rootNode
      }
    };

    return flowchart;
  } catch (error) {
    console.error('Error generating decision flowchart:', error);
    throw error;
  }
}

// Helper function to parse the initial AI response into a structured node
function parseInitialNode(content: string): { title: string; nodeContent: string; options: string[] } {
  // This is a simplified parser. You may need a more sophisticated one
  // depending on how structured your AI responses are.
  const lines = content.split('\n').filter(line => line.trim());
  
  // Assuming the first line is the title
  const title = lines[0]?.replace(/^#\s*/, '') || 'Decision Flowchart';
  
  // Look for options (assuming they start with "- " or "* ")
  const options: string[] = [];
  let nodeContent = '';
  
  let inContent = true;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^[\-\*]\s/) || line.match(/^\d+\.\s/)) {
      // This is an option
      inContent = false;
      options.push(line.replace(/^[\-\*\d+\.]\s/, ''));
    } else if (inContent) {
      // This is part of the node content
      nodeContent += line + '\n';
    }
  }
  
  // If no options were found, create some default ones
  if (options.length === 0) {
    options.push('Learn more', 'Explore alternatives', 'Start over');
  }
  
  return { title, nodeContent: nodeContent.trim(), options };
}

export async function navigateToNode(flowchart: FlowchartData, optionId: string): Promise<FlowchartData> {
  const { currentNodeId, nodes, topic, context } = flowchart;
  const currentNode = nodes[currentNodeId];
  
  if (!currentNode) {
    throw new Error('Current node not found in flowchart');
  }
  
  const selectedOption = currentNode.options.find(option => option.id === optionId);
  
  if (!selectedOption) {
    throw new Error('Selected option not found in current node');
  }
  
  // Check if this path has already been explored
  const existingNodeId = Object.keys(nodes).find(nodeId => {
    const node = nodes[nodeId];
    return node.parentId === currentNodeId && node.parentOption === optionId;
  });
  
  if (existingNodeId) {
    // Path already explored, just navigate to the existing node
    return {
      ...flowchart,
      currentNodeId: existingNodeId
    };
  }
  
  // Generate a new node based on the selected option
  try {
    const newNodeId = nanoid();
    
    const prompt = `
      We are creating a decision flowchart about "${topic}". 
      Context: ${context}
      
      Previous decision: "${currentNode.content}"
      
      User selected the option: "${selectedOption.text}"
      
      Based on this selection, generate the next step in the decision process.
      Include a title, detailed explanation, and 2-4 possible options to continue.
    `;
    
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'gpt-4', // or whatever model you're using
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.response || '';

    // Parse the response
    const { title, nodeContent, options } = parseInitialNode(content);

    // Create the new node
    const newNode: DecisionNode = {
      id: newNodeId,
      title,
      content: nodeContent,
      options: options.map(optionText => ({
        id: nanoid(),
        text: optionText
      })),
      parentId: currentNodeId,
      parentOption: optionId
    };

    // Update the flowchart
    return {
      ...flowchart,
      currentNodeId: newNodeId,
      nodes: {
        ...nodes,
        [newNodeId]: newNode
      }
    };
  } catch (error) {
    console.error('Error navigating to node:', error);
    throw error;
  }
}

export function goBack(flowchart: FlowchartData): FlowchartData {
  const { currentNodeId, nodes } = flowchart;
  const currentNode = nodes[currentNodeId];
  
  if (!currentNode || !currentNode.parentId) {
    // Already at root or node not found
    return flowchart;
  }
  
  // Navigate to parent node
  return {
    ...flowchart,
    currentNodeId: currentNode.parentId
  };
}

export async function regenerateNode(flowchart: FlowchartData, nodeId: string): Promise<FlowchartData> {
  const { nodes, topic, context } = flowchart;
  const node = nodes[nodeId];
  
  if (!node) {
    throw new Error('Node not found in flowchart');
  }
  
  try {
    let prompt;
    
    if (node.parentId) {
      // This is a child node, regenerate based on parent
      const parentNode = nodes[node.parentId];
      const selectedOption = parentNode.options.find(option => option.id === node.parentOption);
      
      prompt = `
        We are creating a decision flowchart about "${topic}". 
        Context: ${context}
        
        Previous decision: "${parentNode.content}"
        
        User selected the option: "${selectedOption?.text || 'Unknown option'}"
        
        Based on this selection, generate the next step in the decision process.
        Include a title, detailed explanation, and 2-4 possible options to continue.
      `;
    } else {
      // This is the root node
      prompt = `Create a decision flowchart about "${topic}". Context: ${context}.`;
    }
    
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: 'gpt-4', // or whatever model you're using
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.response || '';

    // Parse the response
    const { title, nodeContent, options } = parseInitialNode(content);

    // Update the node
    const updatedNode: DecisionNode = {
      ...node,
      title,
      content: nodeContent,
      options: options.map(optionText => ({
        id: nanoid(),
        text: optionText
      }))
    };

    // Update the flowchart
    return {
      ...flowchart,
      nodes: {
        ...nodes,
        [nodeId]: updatedNode
      }
    };
  } catch (error) {
    console.error('Error regenerating node:', error);
    throw error;
  }
}

export async function saveFlowchart(flowchart: FlowchartData, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('flowcharts')
      .upsert({
        id: flowchart.id,
        user_id: userId,
        topic: flowchart.topic,
        context: flowchart.context,
        data: flowchart
      });
      
    if (error) {
      throw new Error(`Error saving flowchart: ${error.message}`);
    }
  } catch (error) {
    console.error('Error saving flowchart:', error);
    throw error;
  }
} 