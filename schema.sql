-- Create the decision_trees table for storing user decision trees
CREATE TABLE IF NOT EXISTS decision_trees (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  context TEXT,
  current_node_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_decision_trees_user_id ON decision_trees(user_id);
CREATE INDEX IF NOT EXISTS idx_decision_trees_updated_at ON decision_trees(updated_at);

-- Enable RLS (Row Level Security)
ALTER TABLE decision_trees ENABLE ROW LEVEL SECURITY;

-- Create policy to ensure users can only access their own trees
CREATE POLICY "Users can only access their own decision trees"
  ON decision_trees
  FOR ALL
  USING (auth.uid() = user_id);

-- Create a view for decision tree history (most recent decision trees per user)
CREATE OR REPLACE VIEW recent_decision_trees AS
  SELECT id, user_id, title, topic, created_at, updated_at
  FROM decision_trees
  ORDER BY updated_at DESC; 