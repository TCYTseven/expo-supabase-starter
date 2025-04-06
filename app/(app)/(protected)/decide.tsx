import { View, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function Decide() {
  const [decision, setDecision] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [flowchartGenerated, setFlowchartGenerated] = useState(false);
  const [flowchartNodes, setFlowchartNodes] = useState<any[]>([]);

  const handleStartDecision = () => {
    if (!decision.trim()) return;
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setFlowchartGenerated(true);
      
      // Sample flowchart data
      setFlowchartNodes([
        {
          id: 1,
          question: "Should I pursue a career change?",
          options: ["Yes", "No", "Not sure"]
        },
        {
          id: 2,
          question: "Are you financially prepared for a transition period?",
          options: ["Yes", "No", "Partially"]
        }
      ]);
    }, 2000);
  };

  const handleOptionSelect = (nodeId: number, option: string) => {
    // Handle the user's selection and expand the flowchart
    // For demo purposes, just add another node
    setFlowchartNodes([
      ...flowchartNodes,
      {
        id: flowchartNodes.length + 1,
        question: `You selected ${option}. What's your timeline for making this change?`,
        options: ["Immediate", "Within 6 months", "Long-term (1+ year)", "Custom"]
      }
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-[#0e0e12]">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold text-white">Decide</H1>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
            className="text-white"
          >
            <Text className="text-white">✕</Text>
          </Button>
        </View>

        {!flowchartGenerated ? (
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
                <TouchableOpacity className="border border-dashed border-[#3a3a45] rounded-lg p-4 items-center bg-[#252530]">
                  <Ionicons name="document-attach" size={24} color="#9b9ba7" />
                  <Text className="text-[#9b9ba7] mt-2">Upload screenshots or documents</Text>
                  <Muted className="text-[#6c6c7c]">Max file size: 5MB</Muted>
                </TouchableOpacity>
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
                  <Text className="text-white">{decision}</Text>
                </View>
                
                <Button
                  variant="outline"
                  className="border-[#3a3a45]"
                  onPress={() => setFlowchartGenerated(false)}
                >
                  <Text className="text-white">Edit Question</Text>
                </Button>
              </View>
            </Card>
            
            {flowchartNodes.map((node, index) => (
              <Card key={node.id} className="p-4 bg-[#1a1a22] border-[#3a3a45]">
                <View className="space-y-4">
                  <View className="space-y-2">
                    {index > 0 && (
                      <View className="items-center my-2">
                        <View className="h-10 w-0.5 bg-[#6e3abd]" />
                      </View>
                    )}
                    <Text className="font-medium text-white text-lg">{node.question}</Text>
                  </View>
                  
                  <View className="space-y-2">
                    {node.options.map((option: string, optIndex: number) => (
                      <Button
                        key={optIndex}
                        variant="outline"
                        className="w-full border-[#3a3a45] mb-2"
                        onPress={() => handleOptionSelect(node.id, option)}
                      >
                        <Text className="text-white">{option}</Text>
                      </Button>
                    ))}
                    
                    {node.options.includes("Custom") && (
                      <TextInput
                        className="border border-[#3a3a45] rounded-lg p-3 text-white bg-[#252530] mt-2"
                        placeholder="Enter your custom response..."
                        placeholderTextColor="#6c6c7c"
                      />
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
} 