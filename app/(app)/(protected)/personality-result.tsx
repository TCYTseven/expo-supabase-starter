import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";

const personalityTypes = {
  "INTJ": {
    name: "The Architect",
    description: "Imaginative and strategic thinkers with a plan for everything.",
    adviceStyle: "Analytical and systematic",
  },
  "INTP": {
    name: "The Logician",
    description: "Innovative inventors with an unquenchable thirst for knowledge.",
    adviceStyle: "Logical and theoretical",
  },
  "ENTJ": {
    name: "The Commander",
    description: "Bold, imaginative and strong-willed leaders.",
    adviceStyle: "Direct and decisive",
  },
  "ENTP": {
    name: "The Debater",
    description: "Smart and curious thinkers who cannot resist an intellectual challenge.",
    adviceStyle: "Creative and adaptable",
  },
  // Add more personality types as needed
};

export default function PersonalityResult() {
  // TODO: Get actual personality type from quiz results
  const personalityType = "INTJ";
  const typeInfo = personalityTypes[personalityType as keyof typeof personalityTypes];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold">Your Personality Type</H1>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.push("/(app)/(protected)")}
          >
            <Text>✕</Text>
          </Button>
        </View>

        <Card className="p-6">
          <View className="space-y-4">
            <View className="items-center">
              <Text className="text-4xl font-bold mb-2">{personalityType}</Text>
              <H2 className="text-xl text-center">{typeInfo.name}</H2>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Description</Text>
              <Muted>{typeInfo.description}</Muted>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Advice Style</Text>
              <Muted>{typeInfo.adviceStyle}</Muted>
            </View>
          </View>
        </Card>

        <View className="space-y-4">
          <H2 className="text-xl font-semibold">Choose Your Advisor</H2>
          <Card className="p-4">
            <View className="space-y-4">
              <Text className="font-medium">Select a personality to guide your decisions:</Text>
              <View className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onPress={() => router.push("/(app)/(protected)/new-decision")}
                >
                  <Text>Rocky Balboa - Motivational</Text>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onPress={() => router.push("/(app)/(protected)/new-decision")}
                >
                  <Text>Uncle Iroh - Wise & Patient</Text>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onPress={() => router.push("/(app)/(protected)/new-decision")}
                >
                  <Text>David Goggins - Tough Love</Text>
                </Button>
              </View>
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
} 