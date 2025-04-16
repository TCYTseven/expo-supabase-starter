import { View, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useSupabase } from "@/context/supabase-provider";
import { 
  DecisionTree, 
  generateDecisionTree, 
  continueDecisionTree, 
  navigateBack, 
  saveDecisionTree,
  getDecisionTree
} from "@/lib/decisionAIService";
import { getAdvisorPrompt } from "@/lib/advisorService";

export default function Decide() {
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [decisionTree, setDecisionTree] = useState<DecisionTree | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  const { profile } = useUserProfile();
  const { user } = useSupabase();
  const params = useLocalSearchParams<{ treeId?: string; topic?: string }>();

  useEffect(() => {
    // Check if we're continuing a specific tree
    if (params.treeId && user?.id) {
      loadSpecificTree(params.treeId);
    } 
    // Check if we're starting a new decision based on a topic
    else if (params.topic) {
      setDecision(params.topic);
    }
  }, [params.treeId, params.topic, user?.id]);

  const loadSpecificTree = async (treeId: string) => {
    setIsLoadingTree(true);
    try {
      const tree = await getDecisionTree(treeId);
      if (tree) {
        setDecisionTree(tree);
        setDecision(tree.topic || "");
        setContext(tree.context || "");
      } else {
        setError("Couldn't find the requested decision tree");
      }
    } catch (err: any) {
      console.error("Error loading specific tree:", err);
      setError(err.message || "Failed to load the decision tree");
    } finally {
      setIsLoadingTree(false);
    }
  };

  const handleStartDecision = async () => {
    if (!decision.trim() || !user?.id) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Get the advisor prompt if the user has a custom advisor
      let advisorPrompt;
      if (profile?.advisor && profile.custom_advisors) {
        try {
          // Parse custom advisors to find the current one
          const currentAdvisor = profile.advisor;
          const customAdvisors = typeof profile.custom_advisors === 'string' 
            ? JSON.parse(profile.custom_advisors) 
            : profile.custom_advisors;

          if (Array.isArray(customAdvisors)) {
            const selectedAdvisor = customAdvisors.find((a: any) => 
              a.id === currentAdvisor || a.name === currentAdvisor
            );
            
            if (selectedAdvisor) {
              advisorPrompt = getAdvisorPrompt(selectedAdvisor);
            }
          }
        } catch (err) {
          console.warn('Error parsing custom advisors:', err);
        }
      }

      // Generate the decision tree
      const newTree = await generateDecisionTree(
        decision, 
        context, 
        user.id,
        profile?.personality_type,
        advisorPrompt
      );

      setDecisionTree(newTree);
      
      // Automatically save the tree after generation
      await saveDecisionTree(newTree);
    } catch (err: any) {
      console.error('Error generating decision tree:', err);
      setError(err.message || 'Failed to generate the decision tree. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOptionSelect = async (optionId: string) => {
    if (!decisionTree) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Continue the decision tree with the selected option
      const updatedTree = await continueDecisionTree(decisionTree, optionId);
      setDecisionTree(updatedTree);
      
      // Automatically save the updated tree
      await saveDecisionTree(updatedTree);
    } catch (err: any) {
      console.error('Error continuing decision tree:', err);
      setError(err.message || 'Failed to process your selection. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoBack = () => {
    if (!decisionTree) return;
    
    // Navigate back to the previous node
    const updatedTree = navigateBack(decisionTree);
    if (updatedTree !== decisionTree) {
      setDecisionTree(updatedTree);
      
      // Save the updated tree position
      saveDecisionTree(updatedTree).catch(err => {
        console.error('Error saving tree after going back:', err);
      });
    }
  };

  const handleSaveTree = async () => {
    if (!decisionTree) return;
    
    try {
      await saveDecisionTree(decisionTree);
    } catch (err) {
      console.error('Error saving decision tree:', err);
      setError('Failed to save your decision tree.');
    }
  };

  const handleNewDecision = () => {
    setDecisionTree(null);
    setDecision("");
    setContext("");
    setError(null);
  };

  // Get the current node from the decision tree
  const currentNode = decisionTree?.nodes[decisionTree.currentNodeId];

  // Show loading indicator while fetching a specific tree
  if (isLoadingTree) {
    return (
      <View className="flex-1 bg-[#0e0e12] items-center justify-center">
        <ActivityIndicator size="large" color="#6e3abd" />
        <Text className="text-white mt-4">Loading your decision...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0e0e12]">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold text-white">Decide</H1>
          
          {decisionTree ? (
            <View className="flex-row">
              <Button
                variant="ghost"
                size="icon"
                onPress={handleNewDecision}
              >
                <Ionicons name="add-outline" size={24} color="white" />
              </Button>
            </View>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.back()}
              className="text-white"
            >
              <Text className="text-white">✕</Text>
            </Button>
          )}
        </View>

        {error && (
          <Card className="p-4 bg-[#331111] border-[#662222] mb-4">
            <Text className="text-[#ff9999]">{error}</Text>
          </Card>
        )}

        {!decisionTree ? (
          <Card className="p-4 bg-[#1a1a22] border-[#3a3a45]">
            <View className="space-y-6">
              <View className="space-y-3">
                <Text className="font-medium text-white">What decision do you need help with?</Text>
                <TextInput
                  className="border border-[#3a3a45] rounded-lg p-4 text-white bg-[#252530]"
                  placeholder="e.g., Should I change careers?"
                  placeholderTextColor="#6c6c7c"
                  value={decision}
                  onChangeText={setDecision}
                  multiline
                />
              </View>

              <View className="items-center space-y-3">
                <TouchableOpacity 
                  className="w-16 h-16 rounded-full bg-[#6e3abd] items-center justify-center"
                  onPress={() => {/* Handle voice input */}}
                >
                  <Ionicons name="mic" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-[#9b9ba7]">Speak your question</Text>
              </View>

              <View className="space-y-3">
                <Text className="font-medium text-white">Context (Optional)</Text>
                <TextInput
                  className="border border-[#3a3a45] rounded-lg p-4 text-white bg-[#252530]"
                  placeholder="Add any relevant details that might help..."
                  placeholderTextColor="#6c6c7c"
                  value={context}
                  onChangeText={setContext}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <Button
                className="w-full bg-[#6e3abd]"
                onPress={handleStartDecision}
                disabled={!decision.trim() || isProcessing}
              >
                <Text className="text-white">{isProcessing ? "Processing..." : "Start Decision Process"}</Text>
              </Button>
            </View>
          </Card>
        ) : (
          <View className="space-y-4">
            <Card className="p-4 bg-[#1a1a22] border-[#3a3a45]">
              <View className="space-y-3">
                <Text className="font-medium text-white">Your Decision</Text>
                <View className="bg-[#252530] p-3 rounded-lg">
                  <Text className="text-white">{decisionTree.topic}</Text>
                  {decisionTree.context && (
                    <Text className="text-[#9b9ba7] mt-2">{decisionTree.context}</Text>
                  )}
                </View>
              </View>
            </Card>
            
            {isProcessing ? (
              <Card className="p-8 bg-[#1a1a22] border-[#3a3a45] items-center">
                <ActivityIndicator size="large" color="#6e3abd" />
                <Text className="text-white mt-4">Thinking...</Text>
              </Card>
            ) : currentNode ? (
              <Card className="p-4 bg-[#1a1a22] border-[#3a3a45]">
                <View className="space-y-4">
                  <View className="space-y-2">
                    <Text className="font-medium text-white text-lg">{currentNode.title}</Text>
                    <Text className="text-[#d8d8e0]">{currentNode.content}</Text>
                  </View>
                  
                  <View className="space-y-2 mt-4">
                    <Text className="font-medium text-white">Options:</Text>
                    {currentNode.options.map((option) => (
                      <Button
                        key={option.id}
                        variant="outline"
                        className="w-full border-[#3a3a45] mb-2"
                        onPress={() => handleOptionSelect(option.id)}
                      >
                        <Text className="text-white">{option.text}</Text>
                      </Button>
                    ))}
                  </View>
                  
                  <View className="flex-row justify-between mt-4">
                    <Button
                      variant="outline"
                      className="flex-1 mr-2 border-[#3a3a45]"
                      onPress={handleGoBack}
                      disabled={!currentNode.parentId}
                    >
                      <Ionicons name="arrow-back" size={20} color={
                        currentNode.parentId ? "white" : "#6c6c7c"
                      } />
                      <Text className={currentNode.parentId ? "text-white" : "text-[#6c6c7c]"}>Back</Text>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="flex-1 ml-2 border-[#3a3a45]"
                      onPress={handleSaveTree}
                    >
                      <Ionicons name="bookmark-outline" size={20} color="white" />
                      <Text className="text-white">Save</Text>
                    </Button>
                  </View>
                </View>
              </Card>
            ) : (
              <Card className="p-4 bg-[#1a1a22] border-[#3a3a45]">
                <Text className="text-white text-center">Something went wrong. Please try again.</Text>
              </Card>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
} 