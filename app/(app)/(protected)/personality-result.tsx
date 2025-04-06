import { View, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useState, useEffect } from "react";
import { getAdvisorPrompt } from "@/lib/advisorService";
import { supabase } from "@/config/supabase";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/lib/theme";

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
  const [customAdvisors, setCustomAdvisors] = useState<any[]>([]);
  const [expandedAdvisor, setExpandedAdvisor] = useState<string | null>(null);
  const [loadingAdvisors, setLoadingAdvisors] = useState(false);
  
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

  // Fetch all custom advisors from users in Supabase
  useEffect(() => {
    const fetchCustomAdvisors = async () => {
      try {
        setLoadingAdvisors(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, custom_advisors')
          .not('custom_advisors', 'eq', 'Not Set');
        
        if (error) throw error;
        
        // Process the data to extract advisor information
        const processedAdvisors = data
          .filter(item => item.custom_advisors)
          .map(item => {
            let advisorData;
            try {
              // Try to parse as JSON
              if (typeof item.custom_advisors === 'string') {
                advisorData = JSON.parse(item.custom_advisors);
              } else {
                advisorData = item.custom_advisors;
              }
              
              // Extract name and description
              const name = advisorData.raw?.name || 'Custom Advisor';
              const prompt = getAdvisorPrompt(item.custom_advisors);
              
              // Create advisor object with unique ID
              return {
                id: `custom_${item.id}`,
                name: name,
                style: "Custom",
                description: prompt,
                stats: {
                  directness: advisorData.raw?.sliders?.directness || 5,
                  optimism: advisorData.raw?.sliders?.optimism || 5,
                  creativity: advisorData.raw?.sliders?.creativity || 5,
                  detail: advisorData.raw?.sliders?.detail || 5,
                },
                traits: [
                  ...(advisorData.raw?.communicationTraits || []),
                  ...(advisorData.raw?.personalityTraits || [])
                ],
                userId: item.id // to identify who created it
              };
            } catch (e) {
              console.error("Error parsing advisor data:", e);
              return null;
            }
          })
          .filter(Boolean); // Remove any null entries
        
        setCustomAdvisors(processedAdvisors);
      } catch (err) {
        console.error("Failed to fetch custom advisors:", err);
      } finally {
        setLoadingAdvisors(false);
      }
    };
    
    fetchCustomAdvisors();
  }, []);

  const handleSelectAdvisor = async (advisorId: string) => {
    try {
      setSaving(true);
      setSelectedAdvisor(advisorId);
      await updateAdvisor(advisorId);
      setSaving(false);
      
      // Navigate back
      router.back();
    } catch (error) {
      console.error("Failed to update advisor:", error);
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
        <ActivityIndicator size="large" />
        <Text className="mt-4">Loading profile...</Text>
      </View>
    );
  }

  // Combine built-in advisors with custom advisors
  const allAdvisors = [
    ...advisors,
    ...customAdvisors
  ];

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold">Choose Your Advisor</H1>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
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
                          {profile?.advisor === advisor.id && (
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