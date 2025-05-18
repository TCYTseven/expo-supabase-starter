import { View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { theme } from "@/lib/theme";
import { useSupabase } from "@/context/supabase-provider";
import { useUserProfile, CustomAdvisor } from "@/lib/hooks/useUserProfile";
import { getAdvisorPrompt } from "@/lib/advisorService";
import { supabase } from "@/config/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === 'ios';

export default function ViewCustomAdvisors() {
  const { profile, loading, error, getCustomAdvisors, deleteCustomAdvisor } = useUserProfile();
  const [advisors, setAdvisors] = useState<CustomAdvisor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translationX] = useState(useSharedValue(0));
  const panRef = useRef(null);
  
  useEffect(() => {
    if (!loading && profile) {
      const customAdvisors = getCustomAdvisors();
      setAdvisors(customAdvisors);
    }
  }, [profile, loading]);

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

  const handleGestureEvent = (event: any) => {
    const { translationX: x } = event.nativeEvent;
    translationX.value = x;
  };

  const handleGestureEnd = (event: any) => {
    const { translationX: x } = event.nativeEvent;
    
    // If swiped far enough, navigate to next/previous advisor
    if (x < -100 && currentIndex < advisors.length - 1) {
      // Swiped left - go to next advisor
      setCurrentIndex(currentIndex + 1);
    } else if (x > 100 && currentIndex > 0) {
      // Swiped right - go to previous advisor
      setCurrentIndex(currentIndex - 1);
    }
    
    // Reset position
    translationX.value = withSpring(0);
  };

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translationX.value }]
    };
  });

  const handleDeleteAdvisor = async () => {
    if (advisors.length <= 0 || currentIndex >= advisors.length) return;
    
    const advisorToDelete = advisors[currentIndex];
    
    try {
      await deleteCustomAdvisor(advisorToDelete.id);
      
      const remainingAdvisors = getCustomAdvisors();
      setAdvisors(remainingAdvisors);
      
      if (currentIndex >= remainingAdvisors.length) {
        setCurrentIndex(Math.max(0, remainingAdvisors.length - 1));
      }
    } catch (err) {
      console.error("Error deleting advisor:", err);
      alert("Failed to delete advisor. Please try again.");
    }
  };

  const renderPaginationDots = () => {
    return (
      <View className="flex-row justify-center my-4">
        {advisors.map((_, index) => (
          <View 
            key={index} 
            className={`h-2 w-2 mx-1 rounded-full ${
              index === currentIndex ? 'bg-primary' : 'bg-gray-300'
            }`} 
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
        />
        <ActivityIndicator size="large" color={theme.colors.primary.DEFAULT} />
        <Text className="mt-4 text-text">Loading your custom advisors...</Text>
      </View>
    );
  }

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
        <View className="flex-row justify-between items-center">
          <View>
            <H1 className="text-2xl font-bold text-text">Your Custom Advisors</H1>
            <Muted>Browse your created advisors</Muted>
          </View>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
          >
            <Text>✕</Text>
          </Button>
        </View>

        {advisors.length > 0 ? (
          <>
            <View className="flex-row justify-between items-center">
              <Text className="text-lg">
                Advisor {currentIndex + 1} of {advisors.length}
              </Text>
              
              <TouchableOpacity 
                className="bg-red-100 p-2 rounded-full"
                onPress={handleDeleteAdvisor}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.destructive.DEFAULT} />
              </TouchableOpacity>
            </View>
            
            {renderPaginationDots()}
            
            <GestureHandlerRootView style={{ flex: 1 }}>
              <PanGestureHandler
                ref={panRef}
                onGestureEvent={handleGestureEvent}
                onEnded={handleGestureEnd}
              >
                <Animated.View style={cardStyle}>
                  <Card className="p-6">
                    {currentIndex < advisors.length && (
                      <View className="space-y-4">
                        <View className="items-center">
                          <Text className="text-2xl font-bold mb-2">
                            {advisors[currentIndex].raw?.name || "Custom Advisor"}
                          </Text>
                        </View>

                        {advisors[currentIndex].prompt && (
                          <View className="mt-3 bg-primary/10 p-4 rounded-lg">
                            <Text className="font-medium mb-2">Advisor Prompt:</Text>
                            <Text className="italic">{advisors[currentIndex].prompt}</Text>
                            <Muted className="text-xs mt-2">This prompt will be used when you ask for advice</Muted>
                          </View>
                        )}

                        {advisors[currentIndex].raw?.sliders && (
                          <View className="mt-4">
                            <Text className="font-medium mb-2">Personality Stats</Text>
                            {renderStatBar("Directness", advisors[currentIndex].raw.sliders.directness)}
                            {renderStatBar("Optimism", advisors[currentIndex].raw.sliders.optimism)}
                            {renderStatBar("Creativity", advisors[currentIndex].raw.sliders.creativity)}
                            {renderStatBar("Detail", advisors[currentIndex].raw.sliders.detail)}
                          </View>
                        )}

                        {advisors[currentIndex].raw?.communicationTraits && 
                         advisors[currentIndex].raw.communicationTraits.length > 0 && (
                          <View className="mt-4">
                            <Text className="font-medium mb-2">Communication Style</Text>
                            <View className="flex-row flex-wrap">
                              {advisors[currentIndex].raw.communicationTraits.map((trait: string, index: number) => (
                                <View key={index} className="bg-primary/10 px-2 py-1 rounded m-1">
                                  <Text className="text-xs">{trait}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}

                        {advisors[currentIndex].raw?.personalityTraits && 
                         advisors[currentIndex].raw.personalityTraits.length > 0 && (
                          <View className="mt-4">
                            <Text className="font-medium mb-2">Personality Traits</Text>
                            <View className="flex-row flex-wrap">
                              {advisors[currentIndex].raw.personalityTraits.map((trait: string, index: number) => (
                                <View key={index} className="bg-primary/10 px-2 py-1 rounded m-1">
                                  <Text className="text-xs">{trait}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}

                        {advisors[currentIndex].raw?.background && (
                          <View className="mt-4">
                            <Text className="font-medium mb-2">Background</Text>
                            <Text>{advisors[currentIndex].raw.background}</Text>
                          </View>
                        )}

                        {advisors[currentIndex].raw?.expertise && (
                          <View className="mt-4">
                            <Text className="font-medium mb-2">Areas of Expertise</Text>
                            <Text>{advisors[currentIndex].raw.expertise}</Text>
                          </View>
                        )}

                        {advisors[currentIndex].raw?.tone && (
                          <View className="mt-4">
                            <Text className="font-medium mb-2">Tone and Voice</Text>
                            <Text>{advisors[currentIndex].raw.tone}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </Card>
                </Animated.View>
              </PanGestureHandler>
            </GestureHandlerRootView>
            
            <View className="flex-row justify-between mt-4">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              >
                <Ionicons name="chevron-back" size={20} color={
                  currentIndex === 0 ? theme.colors.text.muted : theme.colors.primary.DEFAULT
                } />
                <Text>Previous</Text>
              </Button>
              
              <Button
                variant="outline"
                disabled={currentIndex === advisors.length - 1}
                onPress={() => setCurrentIndex(Math.min(advisors.length - 1, currentIndex + 1))}
              >
                <Text>Next</Text>
                <Ionicons name="chevron-forward" size={20} color={
                  currentIndex === advisors.length - 1 ? theme.colors.text.muted : theme.colors.primary.DEFAULT
                } />
              </Button>
            </View>

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
            <Text className="text-xl font-medium mt-4">No Custom Advisors</Text>
            <Muted className="text-center mt-2">You haven't created any custom advisors yet.</Muted>
            <Button 
              className="mt-6"
              onPress={() => router.push("/(app)/(protected)/build-advisor" as any)}
            >
              <Text>Build New Advisor</Text>
            </Button>
          </View>
        )}
        
        {advisors.length > 0 && (
          <Button 
            variant="outline"
            className="mt-2"
            onPress={() => router.push("/(app)/(protected)/build-advisor" as any)}
          >
            <Ionicons name="add-circle-outline" size={20} className="mr-2" color={theme.colors.primary.DEFAULT} />
            <Text>Create Another Advisor</Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
} 