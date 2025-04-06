import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { theme } from "@/lib/theme";
import { useSupabase } from "@/context/supabase-provider";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { getAdvisorPrompt } from "@/lib/advisorService";
import { supabase } from "@/config/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ViewCustomAdvisors() {
  const { profile, loading, error } = useUserProfile();
  const [customAdvisor, setCustomAdvisor] = useState<any>(null);
  const [advisorPrompt, setAdvisorPrompt] = useState<string | null>(null);
  
  useEffect(() => {
    if (profile?.custom_advisors && profile.custom_advisors !== "Not Set") {
      try {
        // Parse custom advisor data
        let data;
        if (typeof profile.custom_advisors === 'string') {
          data = JSON.parse(profile.custom_advisors);
        } else {
          data = profile.custom_advisors;
        }
        
        setCustomAdvisor(data.raw || data);
        setAdvisorPrompt(getAdvisorPrompt(profile.custom_advisors));
      } catch (e) {
        console.error("Error parsing advisor data:", e);
        setAdvisorPrompt("Error loading advisor data");
      }
    }
  }, [profile]);

  // Render stat bars for sliders
  const renderStatBar = (label: string, value: number) => (
    <View className="mb-2">
      <View className="flex-row justify-between">
        <Text className="text-xs">{label}</Text>
        <Text className="text-xs">{value}/10</Text>
      </View>
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
        <View 
          className="h-full bg-primary rounded-full" 
          style={{ width: `${(value / 10) * 100}%` }} 
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4">Loading your custom advisor...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold">Your Custom Advisor</H1>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
          >
            <Text>✕</Text>
          </Button>
        </View>

        {customAdvisor ? (
          <>
            <Card className="p-6">
              <View className="space-y-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold mb-2">{customAdvisor.name || "Custom Advisor"}</Text>
                </View>

                {advisorPrompt && (
                  <View className="mt-3 bg-primary/10 p-4 rounded-lg">
                    <Text className="font-medium mb-2">Advisor Prompt:</Text>
                    <Text className="italic">{advisorPrompt}</Text>
                    <Muted className="text-xs mt-2">This prompt will be used when you ask for advice</Muted>
                  </View>
                )}

                {customAdvisor.sliders && (
                  <View className="mt-4">
                    <Text className="font-medium mb-2">Personality Stats</Text>
                    {renderStatBar("Directness", customAdvisor.sliders.directness)}
                    {renderStatBar("Optimism", customAdvisor.sliders.optimism)}
                    {renderStatBar("Creativity", customAdvisor.sliders.creativity)}
                    {renderStatBar("Detail", customAdvisor.sliders.detail)}
                  </View>
                )}

                {customAdvisor.communicationTraits && customAdvisor.communicationTraits.length > 0 && (
                  <View className="mt-4">
                    <Text className="font-medium mb-2">Communication Style</Text>
                    <View className="flex-row flex-wrap">
                      {customAdvisor.communicationTraits.map((trait: string, index: number) => (
                        <View key={index} className="bg-primary/10 px-2 py-1 rounded m-1">
                          <Text className="text-xs">{trait}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {customAdvisor.personalityTraits && customAdvisor.personalityTraits.length > 0 && (
                  <View className="mt-4">
                    <Text className="font-medium mb-2">Personality Traits</Text>
                    <View className="flex-row flex-wrap">
                      {customAdvisor.personalityTraits.map((trait: string, index: number) => (
                        <View key={index} className="bg-primary/10 px-2 py-1 rounded m-1">
                          <Text className="text-xs">{trait}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {customAdvisor.background && (
                  <View className="mt-4">
                    <Text className="font-medium mb-2">Background</Text>
                    <Text>{customAdvisor.background}</Text>
                  </View>
                )}

                {customAdvisor.expertise && (
                  <View className="mt-4">
                    <Text className="font-medium mb-2">Areas of Expertise</Text>
                    <Text>{customAdvisor.expertise}</Text>
                  </View>
                )}

                {customAdvisor.tone && (
                  <View className="mt-4">
                    <Text className="font-medium mb-2">Tone and Voice</Text>
                    <Text>{customAdvisor.tone}</Text>
                  </View>
                )}
              </View>
            </Card>

            <View className="flex-row justify-center mt-6">
              <Button
                variant="default"
                onPress={() => router.push("/(app)/(protected)/personality-result" as any)}
              >
                <Text>Change Advisor</Text>
              </Button>
            </View>
          </>
        ) : (
          <View className="items-center justify-center py-10">
            <Ionicons name="person" size={60} color={theme.colors.text.muted} />
            <Text className="text-xl font-medium mt-4">No Custom Advisor</Text>
            <Muted className="text-center mt-2">You haven't created a custom advisor yet.</Muted>
            <Button 
              className="mt-6"
              onPress={() => router.push("/(app)/(protected)/build-advisor" as any)}
            >
              <Text>Build New Advisor</Text>
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
} 