import { View, ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator, Dimensions, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useSupabase } from "@/context/supabase-provider";
import { 
  DecisionTree, 
  generateDecisionTree, 
  continueDecisionTree, 
  navigateBack, 
  saveDecisionTree,
  getDecisionTree,
  shouldConcludeDecision,
  generateFinalDecision
} from "@/lib/decisionAIService";
import { getAdvisorPrompt } from "@/lib/advisorService";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/lib/theme";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === 'ios';

export default function Decide() {
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [decisionTree, setDecisionTree] = useState<DecisionTree | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [finalDecision, setFinalDecision] = useState<{ decision: string; reflection: string } | null>(null);
  const [shouldShowFinalScreen, setShouldShowFinalScreen] = useState(false);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, content: string} | null>(null);

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
        
        // Check if this is a tree with a final decision
        const currentNode = tree.nodes[tree.currentNodeId];
        if (currentNode?.isFinal) {
          setShouldShowFinalScreen(true);
          
          // We need to regenerate the final decision
          await handleGenerateFinalDecision(tree);
        }
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

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return;
      }
      
      const asset = result.assets[0];
      
      // Read file content for text files
      try {
        // Handle different file types
        if (asset.mimeType?.startsWith('image/')) {
          setAttachedFile({
            name: asset.name,
            content: `Image attached: ${asset.name}`
          });
        } else if (asset.mimeType === 'application/pdf') {
          setAttachedFile({
            name: asset.name,
            content: `PDF file attached: ${asset.name}`
          });
        } else {
          // For text files, read the content
          const content = await FileSystem.readAsStringAsync(asset.uri);
          
          setAttachedFile({
            name: asset.name,
            content
          });
          
          // If context is empty, add the file content there
          if (!context.trim()) {
            setContext(content.substring(0, 1000)); // Limit to 1000 chars
          }
        }
      } catch (error) {
        console.error('Error reading file:', error);
        setError('Could not read the selected file');
      }
    } catch (err) {
      console.error('Error picking document:', err);
      setError('Something went wrong when selecting the file');
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

      // If there's an attached file, add its content to the context
      let fullContext = context;
      if (attachedFile && attachedFile.content) {
        fullContext += fullContext ? '\n\n' : '';
        fullContext += `Attached file (${attachedFile.name}):\n${attachedFile.content}`;
      }

      // Generate the decision tree
      const newTree = await generateDecisionTree(
        decision, 
        fullContext, 
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
      
      // Check if we should conclude the decision
      if (shouldConcludeDecision(updatedTree)) {
        await handleGenerateFinalDecision(updatedTree);
      }
    } catch (err: any) {
      console.error('Error continuing decision tree:', err);
      setError(err.message || 'Failed to process your selection. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFinalDecision = async (tree: DecisionTree) => {
    setIsGeneratingFinal(true);
    try {
      const finalResult = await generateFinalDecision(tree);
      setFinalDecision({
        decision: finalResult.decision,
        reflection: finalResult.reflection
      });
      setDecisionTree(finalResult.updatedTree);
      setShouldShowFinalScreen(true);
    } catch (err: any) {
      console.error('Error generating final decision:', err);
      setError(err.message || 'Failed to generate final decision. Please try again.');
    } finally {
      setIsGeneratingFinal(false);
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
      
      // If we were showing the final screen, hide it
      if (shouldShowFinalScreen) {
        setShouldShowFinalScreen(false);
        setFinalDecision(null);
      }
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

  const handleConcludeNow = () => {
    if (!decisionTree) return;
    handleGenerateFinalDecision(decisionTree);
  };

  const handleNewDecision = () => {
    setDecisionTree(null);
    setDecision("");
    setContext("");
    setError(null);
    setFinalDecision(null);
    setShouldShowFinalScreen(false);
    setAttachedFile(null);
  };

  // Get the current node from the decision tree
  const currentNode = decisionTree?.nodes[decisionTree.currentNodeId];

  // Show loading indicator while fetching a specific tree
  if (isLoadingTree) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 250 }}
        />
        <View className="bg-primary/20 p-5 rounded-full">
          <ActivityIndicator size="large" color={theme.colors.primary.DEFAULT} />
        </View>
        <Text className="text-text mt-6 text-center text-lg font-medium">
          Loading your decision...
        </Text>
        <Text className="text-muted mt-2 text-center max-w-[80%]">
          We're preparing your decision tree with all its branches
        </Text>
      </View>
    );
  }

  // Final decision screen
  if (shouldShowFinalScreen && finalDecision && decisionTree) {
    return (
      <ScrollView 
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 100, paddingTop: isIOS ? 100 : 60 }}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 250 }}
        />
        
        <View className="px-6 space-y-8 w-full max-w-lg mx-auto">
          <View className="flex-row justify-between items-center">
            <View>
              <H1 className="text-2xl font-bold text-text">
                Decision
              </H1>
              <Muted>
                Your final recommendation
              </Muted>
            </View>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-primary/10"
              onPress={handleNewDecision}
            >
              <Ionicons name="add-outline" size={24} color={theme.colors.primary.DEFAULT} />
            </Button>
          </View>
          
          <Card className="bg-background-card border-none shadow-lg overflow-hidden">
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6 }}
            />
            <View className="p-5 space-y-3">
              <Text className="font-medium text-primary">Your Question</Text>
              <View className="bg-background-input p-4 rounded-xl">
                <Text className="text-text font-medium">{decisionTree.topic}</Text>
                {decisionTree.context && (
                  <Text className="text-muted mt-2">{decisionTree.context}</Text>
                )}
              </View>
            </View>
          </Card>
          
          <Card className="bg-background-card border-none shadow-lg overflow-hidden">
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6 }}
            />
            <View className="p-5 space-y-8">
              <View className="items-center">
                <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4">
                  <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
                    <Ionicons name="checkmark" size={32} color="white" />
                  </View>
                </View>
                
                <Text className="font-semibold text-primary text-lg mb-2">Decision Complete</Text>
                <View className="w-16 h-1 bg-primary/30 rounded-full mb-6" />
              </View>
              
              <View className="space-y-2 w-full">
                <Text className="font-medium text-white bg-primary/80 px-3 py-1 rounded-md text-sm inline-block">RECOMMENDATION</Text>
                <Text className="text-text text-xl font-medium leading-7 mt-2">{finalDecision.decision}</Text>
              </View>
              
              <View className="w-full h-px bg-border opacity-30 my-2" />
              
              <View className="space-y-2 w-full">
                <Text className="font-medium text-white bg-primary/80 px-3 py-1 rounded-md text-sm inline-block">REFLECTION</Text>
                <Text className="text-text leading-6 mt-2">{finalDecision.reflection}</Text>
              </View>
            </View>
          </Card>
          
          <View className="space-y-6 pt-4">
            <Button
              className="w-full p-4 bg-primary rounded-xl shadow-lg shadow-primary/20"
              onPress={() => router.push("/(app)/(protected)/history")}
            >
              <Text className="text-white font-semibold text-base">Save & Finish</Text>
            </Button>
            
            <View className="flex-row space-x-4">
              <Button
                variant="outline"
                className="flex-1 p-4 border-border/30 rounded-xl bg-background-card"
                onPress={handleGoBack}
              >
                <View className="flex-row items-center">
                  <Ionicons name="arrow-back" size={20} color={theme.colors.text.DEFAULT} style={{ marginRight: 8 }} />
                  <Text className="text-text">Back</Text>
                </View>
              </Button>
              
              <Button
                variant="outline"
                className="flex-1 p-4 border-border/30 rounded-xl bg-background-card"
                onPress={handleNewDecision}
              >
                <View className="flex-row items-center">
                  <Ionicons name="refresh" size={20} color={theme.colors.text.DEFAULT} style={{ marginRight: 8 }} />
                  <Text className="text-text">New</Text>
                </View>
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 100, paddingTop: isIOS ? 100 : 60 }}
    >
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 250 }}
      />
      
      <View className="px-6 space-y-8 w-full max-w-lg mx-auto">
        {!decisionTree ? (
          <View className="flex-row justify-between items-center">
            <View>
              <H1 className="text-2xl font-bold text-text">
                New Decision
              </H1>
              <Muted>
                Make your decision now
              </Muted>
            </View>
          </View>
        ) : (
          <View className="flex-row justify-between items-center">
            <View>
              <H1 className="text-2xl font-bold text-text">
                Your Decision
              </H1>
              <Muted>
                Consider your options
              </Muted>
            </View>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-primary/10"
              onPress={handleNewDecision}
            >
              <Ionicons name="add-outline" size={24} color={theme.colors.primary.DEFAULT} />
            </Button>
          </View>
        )}

        {error && (
          <Card className="bg-destructive/10 border-none shadow-lg overflow-hidden">
            <View className="p-4 flex-row items-center space-x-3">
              <View className="w-8 h-8 rounded-full bg-destructive/20 items-center justify-center">
                <Ionicons name="alert-circle" size={18} color={theme.colors.destructive.DEFAULT} />
              </View>
              <Text className="flex-1 text-destructive">{error}</Text>
            </View>
          </Card>
        )}

        {!decisionTree ? (
          <Card className="bg-background-card border-none shadow-lg overflow-hidden">
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6 }}
            />
            <View className="p-6 space-y-8">
              <View className="space-y-4">
                <Text className="font-semibold text-white bg-primary/80 px-3 py-1 rounded-md text-sm inline-block">
                  QUESTION
                </Text>
                <View className="border-2 border-primary/40 rounded-xl overflow-hidden">
                  <TextInput
                    className="p-4 text-text bg-background-input"
                    placeholder="e.g., Should I change careers?"
                    placeholderTextColor="rgba(148, 163, 184, 0.8)"
                    value={decision}
                    onChangeText={setDecision}
                    multiline
                    style={{ fontSize: 16, minHeight: 60 }}
                  />
                </View>
              </View>

              <View className="space-y-4 mt-6">
                <Text className="font-semibold text-white bg-primary/80 px-3 py-1 rounded-md text-sm inline-block">
                  CONTEXT (OPTIONAL)
                </Text>
                
                <View className="border-2 border-primary/40 rounded-xl overflow-hidden">
                  <TextInput
                    className="p-4 text-text bg-background-input"
                    placeholder="Add any relevant details that might help..."
                    placeholderTextColor="rgba(148, 163, 184, 0.8)"
                    value={context}
                    onChangeText={setContext}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    style={{ fontSize: 16, minHeight: 100 }}
                  />
                </View>
                
                {attachedFile && (
                  <View className="bg-primary/20 p-4 rounded-xl flex-row items-center justify-between mt-3">
                    <View className="flex-row items-center flex-1">
                      <View className="w-8 h-8 rounded-full bg-primary/30 items-center justify-center mr-3">
                        <Ionicons name="document-text" size={16} color={theme.colors.primary.DEFAULT} />
                      </View>
                      <View>
                        <Text className="text-text font-medium" numberOfLines={1}>File attached</Text>
                        <Text className="text-muted text-xs" numberOfLines={1}>{attachedFile.name}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setAttachedFile(null)}
                      className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center"
                    >
                      <Ionicons name="close" size={18} color={theme.colors.primary.DEFAULT} />
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity 
                  className="flex-row items-center bg-primary/30 rounded-xl p-2.5 mt-2"
                  onPress={handlePickDocument}
                  activeOpacity={0.7}
                >
                  <View className="w-7 h-7 rounded-full bg-primary/20 items-center justify-center mr-2">
                    <Ionicons name="document-attach" size={14} color="white" />
                  </View>
                  <Text className="text-text font-medium text-sm">Upload a file or photo</Text>
                </TouchableOpacity>
              </View>

              <View className="pt-8">
                <TouchableOpacity
                  className={`w-full py-5 rounded-xl shadow-lg ${isProcessing ? 'bg-primary/70' : 'bg-primary'} shadow-primary/30 overflow-hidden`}
                  onPress={handleStartDecision}
                  disabled={!decision.trim() || isProcessing}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.15)', 'transparent']}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 30 }}
                  />
                  {isProcessing ? (
                    <View className="flex-row items-center justify-center space-x-3">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-semibold">Processing...</Text>
                    </View>
                  ) : (
                    <Text className="text-white font-semibold text-base text-center">Start Decision Process</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ) : (
          <View className="space-y-6">
            <Card className="bg-background-card border-none shadow-lg overflow-hidden">
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'transparent']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6 }}
              />
              <View className="p-4">
                <Text className="text-text text-base font-medium">{decisionTree.topic}</Text>
                {decisionTree.context && (
                  <Text className="text-muted text-sm mt-1">{decisionTree.context}</Text>
                )}
              </View>
            </Card>
            
            {isProcessing || isGeneratingFinal ? (
              <Card className="bg-background-card border-none shadow-lg overflow-hidden">
                <View className="p-8 items-center justify-center">
                  <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
                    <ActivityIndicator size="large" color={theme.colors.primary.DEFAULT} />
                  </View>
                  <Text className="text-text text-center text-lg font-medium mb-1">
                    {isGeneratingFinal ? "Finalizing Decision" : "Processing"}
                  </Text>
                  <Text className="text-muted text-center">
                    {isGeneratingFinal 
                      ? "Analyzing your choices and crafting recommendations..." 
                      : "Thinking through the next steps..."}
                  </Text>
                </View>
              </Card>
            ) : currentNode ? (
              <>
                <Card className="bg-background-card border-none shadow-lg overflow-hidden">
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'transparent']}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6 }}
                  />
                  <View className="p-6 space-y-4">
                    <Text className="text-primary font-medium text-lg">
                      {currentNode.title}
                    </Text>
                    
                    <Text className="text-text leading-6 text-base">
                      {currentNode.content.length > 300 
                        ? currentNode.content.substring(0, 300) + "..." 
                        : currentNode.content}
                    </Text>
                    
                    <View className="space-y-3 mt-2">
                      {currentNode.options.map((option) => (
                        <TouchableOpacity
                          key={option.id}
                          className={`p-4 border border-primary/30 rounded-lg ${isProcessing ? 'opacity-50' : ''} active:bg-primary/10`}
                          onPress={() => handleOptionSelect(option.id)}
                          disabled={isProcessing}
                        >
                          <Text className="text-text font-medium">{option.text}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </Card>

                <View className="flex-row space-x-4 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1 p-3 border-border/30 rounded-xl"
                    onPress={handleGoBack}
                    disabled={!currentNode.parentId || isProcessing}
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="arrow-back" size={20} color={!currentNode.parentId || isProcessing ? theme.colors.text.muted : theme.colors.text.DEFAULT} style={{ marginRight: 8 }} />
                      <Text className={!currentNode.parentId || isProcessing ? "text-muted" : "text-text"}>Back</Text>
                    </View>
                  </Button>
                  
                  {Object.keys(decisionTree.nodes).length >= 3 && (
                    <Button
                      variant="outline"
                      className="flex-1 p-3 border-border/30 rounded-xl"
                      onPress={handleConcludeNow}
                      disabled={isProcessing}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={20} color={isProcessing ? theme.colors.text.muted : theme.colors.primary.DEFAULT} style={{ marginRight: 8 }} />
                        <Text className={isProcessing ? "text-muted" : "text-primary"}>Conclude</Text>
                      </View>
                    </Button>
                  )}
                </View>
              </>
            ) : (
              <Card className="p-5 bg-background-card border-none shadow-lg">
                <View className="items-center p-4">
                  <Ionicons name="alert-circle-outline" size={48} color={theme.colors.text.muted} />
                  <Text className="text-text text-center mt-4">
                    Something went wrong with your decision tree.
                  </Text>
                  <Button
                    className="mt-6 bg-primary/30 px-5 py-3 rounded-xl"
                    onPress={handleNewDecision}
                  >
                    <Text className="text-text font-medium">Start Over</Text>
                  </Button>
                </View>
              </Card>
            )}
          </View>
        )}
        
        {!decisionTree && (
          <TouchableOpacity 
            className="flex-row items-center justify-center mx-auto bg-primary/20 rounded-xl p-3 px-4 mb-12 mt-4"
            activeOpacity={0.7}
          >
            <Ionicons name="mic" size={18} color={theme.colors.text.DEFAULT} style={{ marginRight: 6 }} />
            <Text className="text-text">Tap to speak your question</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
} 