import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { generateDecisionFlowchart, navigateToNode, goBack, regenerateNode, saveFlowchart, FlowchartData } from '@/lib/decisionService';

export default function DecisionMakerScreen() {
  const router = useRouter();
  const { profile: userProfile } = useUserProfile();
  const [topic, setTopic] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [flowchart, setFlowchart] = useState<FlowchartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateFlowchart = async () => {
    if (!topic.trim()) {
      setError('Please enter a decision topic');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const advisorId = userProfile?.advisor || undefined;
      const result = await generateDecisionFlowchart(topic, additionalContext, advisorId);
      setFlowchart(result);
    } catch (err) {
      setError('Failed to generate flowchart. Please try again.');
      console.error('Flowchart generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (optionId: string) => {
    if (!flowchart) return;
    
    setLoading(true);
    try {
      const updatedFlowchart = await navigateToNode(flowchart, optionId);
      setFlowchart(updatedFlowchart);
    } catch (err) {
      setError('Failed to navigate to the next step.');
      console.error('Navigation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = async () => {
    if (!flowchart) return;
    
    try {
      const updatedFlowchart = goBack(flowchart);
      setFlowchart(updatedFlowchart);
    } catch (err) {
      setError('Failed to go back to the previous step.');
      console.error('Go back error:', err);
    }
  };

  const handleRegenerateNode = async () => {
    if (!flowchart) return;
    
    setLoading(true);
    try {
      const nodeId = flowchart.currentNodeId;
      const updatedFlowchart = await regenerateNode(flowchart, nodeId);
      setFlowchart(updatedFlowchart);
    } catch (err) {
      setError('Failed to regenerate this step.');
      console.error('Regeneration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFlowchart = async () => {
    if (!flowchart || !userProfile?.id) return;
    
    try {
      await saveFlowchart(flowchart, userProfile.id);
      // Optional: Show success message
    } catch (err) {
      setError('Failed to save the flowchart.');
      console.error('Save error:', err);
    }
  };

  const currentNode = flowchart && flowchart.currentNodeId ? flowchart.nodes[flowchart.currentNodeId] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Decision Maker</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!flowchart ? (
        <View style={styles.inputSection}>
          <Text style={styles.label}>What decision are you trying to make?</Text>
          <TextInput
            placeholder="E.g., Should I change my job?"
            value={topic}
            onChangeText={setTopic}
            style={styles.input}
          />
          
          <Text style={styles.label}>Additional context (optional)</Text>
          <TextInput
            placeholder="Share any relevant details about your situation"
            value={additionalContext}
            onChangeText={setAdditionalContext}
            multiline
            style={[styles.input, styles.textArea]}
          />
          
          <TouchableOpacity
            onPress={handleGenerateFlowchart}
            disabled={loading || !topic.trim()}
            style={[styles.button, { opacity: loading || !topic.trim() ? 0.5 : 1 }]}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Generating...' : 'Generate Decision Flowchart'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.flowchartContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#333" />
          ) : (
            <>
              <View style={styles.nodeContainer}>
                <Text style={styles.nodeTitle}>{currentNode?.title}</Text>
                <Text style={styles.nodeContent}>{currentNode?.content}</Text>
                
                {currentNode?.options && currentNode.options.length > 0 && (
                  <View style={styles.optionsContainer}>
                    <Text style={styles.optionsTitle}>Options:</Text>
                    {currentNode.options.map((option) => (
                      <TouchableOpacity
                        key={option.id}
                        onPress={() => handleOptionSelect(option.id)}
                        style={styles.optionButton}
                      >
                        <Text style={styles.optionText}>{option.text}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  onPress={handleGoBack}
                  style={[styles.actionButton, !currentNode?.parentId && { opacity: 0.5 }]}
                  disabled={!currentNode?.parentId}
                >
                  <Text style={styles.actionButtonText}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleRegenerateNode}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>Regenerate</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleSaveFlowchart}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffeeee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
  },
  flowchartContainer: {
    marginTop: 16,
  },
  nodeContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  nodeContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    alignItems: 'center',
  },
  optionText: {
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#333',
  },
}); 