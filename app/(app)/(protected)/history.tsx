import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";

// Mock data for past decisions
const pastDecisions = [
  {
    id: 1,
    title: "Career Change",
    date: "2024-03-26",
    status: "Completed",
    summary: "Decided to transition into software development",
  },
  {
    id: 2,
    title: "Moving to New City",
    date: "2024-03-20",
    status: "In Progress",
    summary: "Considering relocation for better opportunities",
  },
  {
    id: 3,
    title: "Investment Strategy",
    date: "2024-03-15",
    status: "Completed",
    summary: "Developed a diversified investment portfolio",
  },
];

export default function History() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold">Decision History</H1>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
          >
            <Text>✕</Text>
          </Button>
        </View>

        <View className="space-y-4">
          {pastDecisions.map((decision) => (
            <TouchableOpacity
              key={decision.id}
              onPress={() => router.push(`/(app)/(protected)/decision/${decision.id}`)}
            >
              <Card className="p-4">
                <View className="space-y-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="font-medium text-lg">{decision.title}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {decision.date}
                    </Text>
                  </View>
                  <View className="flex-row items-center space-x-2">
                    <View
                      className={`w-2 h-2 rounded-full ${
                        decision.status === "Completed"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <Text className="text-sm text-muted-foreground">
                      {decision.status}
                    </Text>
                  </View>
                  <Muted>{decision.summary}</Muted>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          className="w-full"
          onPress={() => router.push("/(app)/(protected)/new-decision")}
        >
          <Text>Start New Decision</Text>
        </Button>
      </View>
    </ScrollView>
  );
} 