import { View, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Dimensions } from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useState, useEffect, useCallback } from "react";
import { getAdvisorPrompt } from "@/lib/advisorService";
import { supabase } from "@/config/supabase";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/lib/theme";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === 'ios';

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
  const { profile, loading, error, updateAdvisor, fetchProfile } = useUserProfile();
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [customAdvisors, setCustomAdvisors] = useState<any[]>([]);
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);
  
  // Consider any non-empty, non-"Not Set", non-"NONE" value as a valid personality type
  const hasPersonalityType = profile?.personality_type && 
                             profile.personality_type !== "NONE" && 
                             profile.personality_type !== "Not Set";
  
  // Use the passed type or fall back to the stored profile type
  const personalityType = type || (hasPersonalityType ? profile?.personality_type : null);
  
  // Get type information if available, or create a generic one if the type is valid but not in our predefined list
  const typeInfo = personalityType ? 
    (personalityTypes[personalityType as keyof typeof personalityTypes] || 
      // Fallback for valid personality types not in our list
      {
        name: "Your Type",
        description: "This personality type influences how you approach decisions and process information.",
        adviceStyle: "Balanced and personalized to your preferences"
      }
    ) : null;
  
  // Refresh data when screen is focused, but only if needed
  useFocusEffect(
    useCallback(() => {
      // Only refresh if we need to
      if (!profile || profile.advisor !== selectedAdvisor) {
        // Refresh profile data
        fetchProfile();
      }
    }, [fetchProfile, profile, selectedAdvisor])
  );
  
  // Initialize selected advisor from profile when loaded
  useEffect(() => {
    if (profile && profile.advisor) {
      setSelectedAdvisor(profile.advisor);
    }
  }, [profile]);

  // Fetch all custom advisors from the current user
  useEffect(() => {
    const fetchCustomAdvisors = async () => {
      try {
        setLoadingAdvisors(true);
        
        if (!profile) return;
        
        // Get custom advisors from the current user's profile
        const userAdvisors = [];
        
        if (profile.custom_advisors && profile.custom_advisors !== "Not Set") {
          try {
            let parsedAdvisors;
            
            if (typeof profile.custom_advisors === 'string') {
              parsedAdvisors = JSON.parse(profile.custom_advisors);
            } else {
              parsedAdvisors = profile.custom_advisors;
            }
            
            // Check if it's already an array of advisors
            if (Array.isArray(parsedAdvisors)) {
              // Process each custom advisor
              parsedAdvisors.forEach((advisor, index) => {
                const name = advisor.raw?.name || `Custom Advisor ${index+1}`;
                
                userAdvisors.push({
                  id: advisor.id || `custom_${index}`,
                  name: name,
                  style: "Custom",
                  description: advisor.prompt || "Custom advisor created by you",
                  stats: {
                    directness: advisor.raw?.sliders?.directness || 5,
                    optimism: advisor.raw?.sliders?.optimism || 5,
                    creativity: advisor.raw?.sliders?.creativity || 5,
                    detail: advisor.raw?.sliders?.detail || 5,
                  },
                  traits: [
                    ...(advisor.raw?.communicationTraits || []),
                    ...(advisor.raw?.personalityTraits || [])
                  ],
                  userId: profile.id
                });
              });
            } else {
              // Legacy format - just one advisor
              const name = parsedAdvisors.raw?.name || 'Custom Advisor';
              const prompt = parsedAdvisors.prompt || getAdvisorPrompt(profile.custom_advisors);
              
              userAdvisors.push({
                id: 'custom_legacy',
                name: name,
                style: "Custom",
                description: prompt,
                stats: {
                  directness: parsedAdvisors.raw?.sliders?.directness || 5,
                  optimism: parsedAdvisors.raw?.sliders?.optimism || 5,
                  creativity: parsedAdvisors.raw?.sliders?.creativity || 5,
                  detail: parsedAdvisors.raw?.sliders?.detail || 5,
                },
                traits: [
                  ...(parsedAdvisors.raw?.communicationTraits || []),
                  ...(parsedAdvisors.raw?.personalityTraits || [])
                ],
                userId: profile.id
              });
            }
          } catch (e) {
            console.error("Error parsing custom advisors:", e);
          }
        }
        
        setCustomAdvisors(userAdvisors);
      } catch (err) {
        console.error("Failed to fetch custom advisors:", err);
      } finally {
        setLoadingAdvisors(false);
      }
    };
    
    fetchCustomAdvisors();
  }, [profile]);

  const handleSelectAdvisor = async (advisorId: string) => {
    try {
      setSaving(true);
      
      // Immediately update the local state for responsive UI
      setSelectedAdvisor(advisorId);
      
      // Find the advisor name for better error messaging
      const advisor = allAdvisors.find(a => a.id === advisorId);
      const advisorName = advisor ? advisor.name : "selected advisor";
      
      try {
        await updateAdvisor(advisorId);
        // Navigate back on success
        router.back();
      } catch (error: any) {
        console.error("Failed to update advisor:", error);
        
        // Show an error, but keep the local selection
        if (error.message?.includes('Network request failed')) {
          alert(`Network error: Selection saved locally but may not sync. "${advisorName}" will be your advisor when connection returns.`);
          
          // We still navigate back since the UI will show the selected advisor
          router.back();
        } else {
          alert(`Error selecting advisor: ${error.message || 'Unknown error'}`);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleAdvisorDetails = (advisorId: string) => {
    if (expandedAdvisor === advisorId) {
      setExpandedAdvisor(null);
    } else {
      setExpandedAdvisor(advisorId);
    }
  };

  // Render stat bars
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
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
        />
        <ActivityIndicator size="large" color={theme.colors.primary.DEFAULT} />
        <Text className="mt-4 text-text">Loading profile...</Text>
      </View>
    );
  }

  // Combine built-in advisors with custom advisors
  const allAdvisors = [
    ...advisors,
    ...customAdvisors
  ];

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 80, paddingTop: isIOS ? 100 : 60 }}
    >
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
      />
      
      <View className="px-6 space-y-6 w-full max-w-lg mx-auto">
        <View className="items-start">
          <H1 className="text-2xl font-bold text-text">Choose Your Advisor</H1>
          <Muted>Select your perfect decision guide</Muted>
        </View>

        <Card className="p-6">
          <View className="space-y-4">
            <View className="items-center">
              <Text className="text-4xl font-bold mb-2">{personalityType || "NONE"}</Text>
              {typeInfo ? (
                <H2 className="text-xl text-center">{typeInfo.name}</H2>
              ) : (
                <H2 className="text-xl text-center text-muted">No personality type set</H2>
              )}
            </View>

            {typeInfo ? (
              <>
                <View className="space-y-2">
                  <Text className="font-medium">Description</Text>
                  <Muted>{typeInfo.description}</Muted>
                </View>

                <View className="space-y-2">
                  <Text className="font-medium">Advice Style</Text>
                  <Muted>{typeInfo.adviceStyle}</Muted>
                </View>
              </>
            ) : (
              <View className="space-y-2">
                <Text className="font-medium">Take the Personality Quiz</Text>
                <Muted>Your personality type will help tailor advice to your decision-making style.</Muted>
                <Button 
                  className="mt-4" 
                  onPress={() => router.push("/(app)/(protected)/personality")}
                >
                  <Text>Take Personality Quiz</Text>
                </Button>
              </View>
            )}
          </View>
        </Card>

        <View className="space-y-4">
          <H2 className="text-xl font-semibold">Available Advisors</H2>
          <Card className="p-4">
            <View className="space-y-4">
              <Text className="font-medium">Select a personality to guide your decisions:</Text>
              
              {loadingAdvisors && (
                <View className="items-center py-4">
                  <ActivityIndicator size="small" />
                  <Muted className="mt-2">Loading advisors...</Muted>
                </View>
              )}
              
              <View className="space-y-3">
                {allAdvisors.map((advisor) => (
                  <View key={advisor.id} className="border rounded-lg border-border overflow-hidden">
                    <TouchableOpacity 
                      className="p-4"
                      onPress={() => toggleAdvisorDetails(advisor.id)}
                    >
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="font-medium">{advisor.name}</Text>
                          <Muted>{advisor.style}</Muted>
                        </View>
                        <View className="flex-row items-center">
                          {(profile?.advisor === advisor.id || selectedAdvisor === advisor.id) && (
                            <View className="bg-primary/20 px-2 py-1 rounded mr-2">
                              <Text className="text-xs text-primary font-medium">Current</Text>
                            </View>
                          )}
                          <Ionicons 
                            name={expandedAdvisor === advisor.id ? "chevron-up" : "chevron-down"} 
                            size={16} 
                            color={theme.colors.text.muted} 
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                    
                    {expandedAdvisor === advisor.id && (
                      <View className="p-4 bg-muted/20 border-t border-border">
                        <View className="space-y-3">
                          <View>
                            <Text className="font-medium mb-1">Description</Text>
                            <Muted>{advisor.description}</Muted>
                          </View>
                          
                          {advisor.stats && (
                            <View>
                              <Text className="font-medium mb-2">Stats</Text>
                              {renderStatBar("Directness", advisor.stats.directness)}
                              {renderStatBar("Optimism", advisor.stats.optimism)}
                              {renderStatBar("Creativity", advisor.stats.creativity)}
                              {renderStatBar("Detail", advisor.stats.detail)}
                            </View>
                          )}
                          
                          {advisor.traits && advisor.traits.length > 0 && (
                            <View>
                              <Text className="font-medium mb-2">Traits</Text>
                              <View className="flex-row flex-wrap">
                                {advisor.traits.map((trait: string, index: number) => (
                                  <View key={index} className="bg-primary/10 px-2 py-1 rounded m-1">
                                    <Text className="text-xs">{trait}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                          
                          {/* Only show select button if this isn't the current advisor */}
                          {profile?.advisor !== advisor.id && (
                            <Button
                              variant="default"
                              className="mt-2"
                              onPress={() => handleSelectAdvisor(advisor.id)}
                              disabled={saving}
                            >
                              <Text>Select as Advisor</Text>
                            </Button>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
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