import { View, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";

// Mock data for a specific decision
const mockDecision = {
  id: 1,
  title: "Career Change",
  date: "2024-03-26",
  status: "Completed",
  summary: "Decided to transition into software development",
  insights: [
    "Current job satisfaction was moderate",
    "Financial impact would be positive",
    "Transferable skills identified in target field",
  ],
  recommendation: "Proceed with career change to software development",
  nextSteps: [
    "Research target companies and roles",
    "Update resume and LinkedIn profile",
    "Start networking in target industry",
    "Consider relevant courses or certifications",
  ],
  personalityType: "INTJ",
  advisor: "Rocky Balboa",
};

export default function DecisionView() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold">Decision Details</H1>
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
              <Text className="text-2xl mb-2">🎯</Text>
              <H2 className="text-xl text-center">{mockDecision.title}</H2>
              <Muted>{mockDecision.date}</Muted>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Summary</Text>
              <Muted>{mockDecision.summary}</Muted>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Key Insights</Text>
              {mockDecision.insights.map((insight, index) => (
                <Text key={index}>• {insight}</Text>
              ))}
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Recommendation</Text>
              <Muted>{mockDecision.recommendation}</Muted>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Next Steps</Text>
              {mockDecision.nextSteps.map((step, index) => (
                <Text key={index}>{index + 1}. {step}</Text>
              ))}
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Decision Profile</Text>
              <View className="flex-row justify-between">
                <Muted>Personality Type:</Muted>
                <Text>{mockDecision.personalityType}</Text>
              </View>
              <View className="flex-row justify-between">
                <Muted>Advisor:</Muted>
                <Text>{mockDecision.advisor}</Text>
              </View>
            </View>

            <Button
              variant="outline"
              className="w-full"
              onPress={() => router.push("/(app)/(protected)/new-decision")}
            >
              <Text>Start Similar Decision</Text>
            </Button>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
} 