# AI-Powered Decision Tree System

This document explains how the decision tree system works and how to use it in the app.

## Overview

The decision tree system uses Azure OpenAI (GPT-4.1-mini) to generate interactive decision trees that help users make decisions through a conversation-like interface. Each node in the tree represents a point in the decision-making process, with multiple options for the user to choose from.

## Database Schema

The system uses a Supabase database with the following structure:

- **Table**: `decision_trees`
  - `id` (UUID, Primary Key): Unique identifier for the tree
  - `user_id` (UUID): References the user who created the tree
  - `title` (TEXT): The title of the decision tree
  - `topic` (TEXT): The main decision topic/question
  - `context` (TEXT): Additional context provided by the user
  - `current_node_id` (TEXT): The ID of the currently active node
  - `data` (JSONB): Complete tree data including all nodes and options
  - `created_at` (TIMESTAMP): When the tree was created
  - `updated_at` (TIMESTAMP): When the tree was last updated

## AI Integration

The system uses Azure OpenAI to:

1. Generate the initial decision tree with a root node and options
2. Continue the conversation by generating child nodes when the user selects an option
3. Include personality type and custom advisor context in the prompts

## Key Features

- **Personalized Decision Trees**: Incorporates the user's personality type and custom advisor
- **Context Management**: Maintains conversation history for coherent decision progression
- **Persistence**: Automatically saves progress and allows resuming decisions later
- **History View**: Users can view and manage past decision trees

## User Flow

1. User enters a decision topic and optional context
2. System generates an initial node with options
3. User selects an option
4. System generates a follow-up node based on the selection
5. Process continues until the user reaches a conclusion

## Code Architecture

### Main Components:

1. **Service Layer**: `lib/decisionAIService.ts`
   - Handles AI communication and tree management
   - Manages database interactions

2. **UI Layer**: `app/(app)/(protected)/decide.tsx`
   - Provides the user interface for the decision tree
   - Handles user interactions and displays feedback

### Interfaces:

```typescript
interface DecisionNode {
  id: string;
  title: string;
  content: string;
  options: { id: string; text: string }[];
  parentId: string | null;
  parentOption?: string;
}

interface DecisionTree {
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
```

## Prompt Engineering

The system uses carefully designed prompts:

### System Prompt (Initial)
```
You are an AI decision-making assistant that helps users make decisions by creating structured decision trees. 
Your goal is to help the user think through their decision methodically and consider important factors.
```

### User Prompt (Initial)
```
I need help making a decision about: {topic}. Additional context: {context}
```

### System Prompt (Continuation)
```
You are an AI decision-making assistant. Continue the decision tree based on the user's selection. 
Provide a title, detailed explanation, and 2-4 options for the next step.
```

### User Prompt (Continuation)
```
We're discussing a decision about: {topic}
Context: {context}

Previous point: {currentNode.title}
{currentNode.content}

Selected option: {selectedOption.text}

Based on this selection, what's the next step in making this decision? 
Provide a title, explanation, and 2-4 possible options.
```

## Setup and Migration

To set up the system:

1. Create the database table using the migration:
   ```
   npm run migrate
   ```

2. Ensure the following environment variables are set:
   ```
   EXPO_PUBLIC_DECISION_AI_ENDPOINT=your_azure_endpoint
   EXPO_PUBLIC_DECISION_AI_API_KEY=your_api_key
   EXPO_PUBLIC_DECISION_AI_API_VERSION=2024-04-01-preview
   EXPO_PUBLIC_DECISION_AI_MODEL=gpt-4.1-mini
   EXPO_PUBLIC_DECISION_AI_DEPLOYMENT=your_deployment_name
   ```

## Future Improvements

Potential enhancements to consider:

1. Add more visualization options for the decision tree
2. Implement a feedback mechanism to improve AI responses
3. Add support for attachments and image analysis
4. Create a more sophisticated parser for AI responses
5. Add categorization and tagging for decision trees 