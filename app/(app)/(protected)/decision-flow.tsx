import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState } from "react";

// Mock data for the flowchart
const mockFlowchart = {
  nodes: [
    {
      id: 1,
      title: "Career Change Decision",
      advice: "Let's break this down into key factors to consider.",
      options: ["Continue", "Back"],
    },
    {
      id: 2,
      title: "Current Job Satisfaction",
      advice: "How satisfied are you with your current role?",
      options: ["Very Satisfied", "Somewhat Satisfied", "Not Satisfied"],
    },
    {
      id: 3,
      title: "Financial Impact",
      advice: "Consider the financial implications of changing careers.",
      options: ["Positive Impact", "Negative Impact", "Neutral"],
    },
  ],
  connections: [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
  ],
};

export default function DecisionFlow() {
  const [currentNode, setCurrentNode] = useState(0);
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);

  const handleOptionSelect = (option: string) => {
    // TODO: Handle option selection and update flowchart
    if (currentNode < mockFlowchart.nodes.length - 1) {
      setCurrentNode(currentNode + 1);
    } else {
      router.push("/(app)/(protected)/decision-summary");
    }
  };

  const handleFeedback = (value: "helpful" | "not-helpful") => {
    setFeedback(value);
    // TODO: Save feedback to improve future advice
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold">Decision Flow</H1>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
          >
            <Text>✕</Text>
          </Button>
        </View>

        <Card className="p-4">
          <View className="space-y-4">
            <View className="items-center">
              <Text className="text-2xl mb-2">Step {currentNode + 1}</Text>
              <H2 className="text-xl text-center">
                {mockFlowchart.nodes[currentNode].title}
              </H2>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Advice</Text>
              <Muted>{mockFlowchart.nodes[currentNode].advice}</Muted>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Options</Text>
              {mockFlowchart.nodes[currentNode].options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full"
                  onPress={() => handleOptionSelect(option)}
                >
                  <Text>{option}</Text>
                </Button>
              ))}
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Was this advice helpful?</Text>
              <View className="flex-row space-x-2">
                <Button
                  variant={feedback === "helpful" ? "default" : "outline"}
                  className="flex-1"
                  onPress={() => handleFeedback("helpful")}
                >
                  <Text>👍 Helpful</Text>
                </Button>
                <Button
                  variant={feedback === "not-helpful" ? "default" : "outline"}
                  className="flex-1"
                  onPress={() => handleFeedback("not-helpful")}
                >
                  <Text>👎 Not Helpful</Text>
                </Button>
              </View>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
} 