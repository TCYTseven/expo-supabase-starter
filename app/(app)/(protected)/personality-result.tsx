import { View, ScrollView, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useState, useEffect } from "react";

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
  "ISFJ": {
    name: "The Defender",
    description: "Very dedicated and warm protectors, always ready to defend their loved ones.",
    adviceStyle: "Practical and supportive",
  },
  "ISTJ": {
    name: "The Inspector",
    description: "Practical and fact-minded individuals, whose reliability cannot be doubted.",
    adviceStyle: "Detailed and methodical",
  },
  "ENFJ": {
    name: "The Protagonist",
    description: "Charismatic and inspiring leaders, able to mesmerize their listeners.",
    adviceStyle: "Encouraging and empathetic",
  },
  "ENFP": {
    name: "The Campaigner",
    description: "Enthusiastic, creative and sociable free spirits, who can always find a reason to smile.",
    adviceStyle: "Optimistic and visionary",
  },
  // Add more personality types as needed
};

const advisors = [
  { 
    id: "rocky", 
    name: "Rocky Balboa", 
    style: "Motivational",
    description: "Tough, inspirational approach with a focus on perseverance"
  },
  { 
    id: "iroh", 
    name: "Uncle Iroh", 
    style: "Wise & Patient",
    description: "Calm, philosophical guidance with deep insights"
  },
  { 
    id: "goggins", 
    name: "David Goggins", 
    style: "Tough Love",
    description: "Brutally honest feedback with a focus on mental toughness"
  },
  { 
    id: "assistant", 
    name: "Assistant", 
    style: "Balanced",
    description: "Neutral, data-driven advice balancing multiple perspectives"
  },
];

export default function PersonalityResult() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { profile, loading, error, updateAdvisor } = useUserProfile();
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Use the passed type or fall back to the stored profile type
  const personalityType = type || (profile?.personality_type !== "Not Set" ? profile?.personality_type : "INTJ");
  
  // Get type information, fallback to INTJ if type not found
  const typeInfo = personalityTypes[personalityType as keyof typeof personalityTypes] || personalityTypes.INTJ;
  
  // Initialize selected advisor from profile when loaded
  useEffect(() => {
    if (profile && profile.advisor) {
      setSelectedAdvisor(profile.advisor);
    }
  }, [profile]);

  const handleSelectAdvisor = async (advisorId: string) => {
    try {
      setSaving(true);
      setSelectedAdvisor(advisorId);
      await updateAdvisor(advisorId);
      setSaving(false);
      
      // Navigate back to the main screen
      router.push("/(app)/(protected)");
    } catch (error) {
      console.error("Failed to update advisor:", error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4">Loading profile...</Text>
      </View>
    );
  }

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
                {advisors.map((advisor) => (
                  <Button
                    key={advisor.id}
                    variant={selectedAdvisor === advisor.id ? "default" : "outline"}
                    className="w-full"
                    onPress={() => handleSelectAdvisor(advisor.id)}
                    disabled={saving}
                  >
                    <View className="flex-row justify-between items-center w-full">
                      <Text>{advisor.name} - {advisor.style}</Text>
                      {selectedAdvisor === advisor.id && (
                        <Text className="ml-2">✓</Text>
                      )}
                    </View>
                  </Button>
                ))}
              </View>
              
              {saving && (
                <View className="items-center py-2">
                  <ActivityIndicator size="small" />
                  <Muted className="mt-2">Saving your selection...</Muted>
                </View>
              )}
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
} 