import { View, ScrollView, TouchableOpacity, TextInput, FlatList, Animated, Platform, Dimensions } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState, useRef, useCallback, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/lib/theme";
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { useSupabase } from "@/context/supabase-provider";
import { createCustomAdvisor, getAdvisorPrompt } from "@/lib/advisorService";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === 'ios';

type AdvisorTrait = {
  label: string;
  value: string;
  selected: boolean;
};

type Step = {
  title: string;
  description: string;
  type: "traits" | "sliders" | "freeform" | "summary";
};

export default function BuildAdvisor() {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { addCustomAdvisor } = useUserProfile();
  const { user } = useSupabase();
  
  // State to store the generated prompt preview
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  
  // Values for each step
  const [communicationTraits, setCommunicationTraits] = useState<AdvisorTrait[]>([
    { label: "Blunt & Direct", value: "blunt", selected: false },
    { label: "Kind & Gentle", value: "kind", selected: false },
    { label: "Analytical & Logical", value: "analytical", selected: false },
    { label: "Encouraging & Supportive", value: "encouraging", selected: false },
    { label: "Challenging & Pushing", value: "challenging", selected: false },
    { label: "Wise & Philosophical", value: "wise", selected: false },
  ]);
  
  const [personalityTraits, setPersonalityTraits] = useState<AdvisorTrait[]>([
    { label: "Serious & Focused", value: "serious", selected: false },
    { label: "Humorous & Light-hearted", value: "humorous", selected: false },
    { label: "Practical & Grounded", value: "practical", selected: false },
    { label: "Creative & Visionary", value: "creative", selected: false },
    { label: "Detail-oriented & Precise", value: "detail", selected: false },
    { label: "Big-picture & Strategic", value: "strategic", selected: false },
  ]);
  
  // Use animated values for sliders
  const directnessAnim = useRef(new Animated.Value(5)).current;
  const optimismAnim = useRef(new Animated.Value(5)).current;
  const creativityAnim = useRef(new Animated.Value(5)).current;
  const detailAnim = useRef(new Animated.Value(5)).current;
  
  const [sliders, setSliders] = useState({
    directness: 5,
    optimism: 5,
    creativity: 5,
    detail: 5,
  });
  
  const [freeForm, setFreeForm] = useState({
    advisorName: "",
    background: "",
    expertise: "",
  });
  
  const [errors, setErrors] = useState({
    advisorName: false
  });
  
  const steps: Step[] = [
    {
      title: "Communication Style",
      description: "How should your advisor communicate with you? Select all that apply.",
      type: "traits",
    },
    {
      title: "Personality Traits",
      description: "What kind of personality would you prefer? Select all that apply.",
      type: "traits",
    },
    {
      title: "Fine-tune Your Advisor",
      description: "Adjust these sliders to fine-tune your advisor's approach.",
      type: "sliders",
    },
    {
      title: "Additional Details",
      description: "Tell us more about your ideal advisor.",
      type: "freeform",
    },
    {
      title: "Your Custom Advisor",
      description: "Review and confirm your custom advisor.",
      type: "summary",
    },
  ];

  const handleTraitToggle = (step: number, index: number) => {
    if (step === 0) {
      const newTraits = [...communicationTraits];
      newTraits[index].selected = !newTraits[index].selected;
      setCommunicationTraits(newTraits);
    } else if (step === 1) {
      const newTraits = [...personalityTraits];
      newTraits[index].selected = !newTraits[index].selected;
      setPersonalityTraits(newTraits);
    }
  };

  const handleSliderChange = (name: keyof typeof sliders, value: number) => {
    setSliders(prev => ({ ...prev, [name]: value }));
    
    // Update animated value
    switch (name) {
      case 'directness':
        directnessAnim.setValue(value);
        break;
      case 'optimism':
        optimismAnim.setValue(value);
        break;
      case 'creativity':
        creativityAnim.setValue(value);
        break;
      case 'detail':
        detailAnim.setValue(value);
        break;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Validate form if on Additional Details step
      if (currentStep === 3) {
        if (!freeForm.advisorName.trim()) {
          setErrors({ ...errors, advisorName: true });
          return;
        }
      }
      
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // Save advisor settings and return to settings
      // Create a JSON representation of the advisor to save
      const advisorData = {
        name: freeForm.advisorName,
        communicationTraits: communicationTraits.filter(t => t.selected).map(t => t.value),
        personalityTraits: personalityTraits.filter(t => t.selected).map(t => t.value),
        sliders,
        background: freeForm.background,
        expertise: freeForm.expertise,
      };
      
      // Use the advisor service to generate the prompt
      createCustomAdvisor(advisorData, user?.id || '')
        .then(result => {
          if (result.success && result.advisorPrompt) {
            console.log('Advisor prompt generated:', result.advisorPrompt);
            
            // Now use the addCustomAdvisor method to add this to the user's list
            addCustomAdvisor(advisorData, result.advisorPrompt)
              .then(() => {
                // Navigate to the view custom advisors page
                router.replace("/(app)/(protected)/view-custom-advisors" as any);
              })
              .catch(err => {
                console.error('Error adding custom advisor:', err);
                alert('Failed to save your advisor. Please try again.');
              });
          } else {
            console.error('Error creating advisor:', result.error);
            alert('Failed to generate advisor. Please try again.');
          }
        })
        .catch(err => {
          console.error("Error calling advisor service:", err);
          alert('Failed to create your advisor. Please try again.');
        });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  // Render a trait selection button
  const renderTraitButton = (trait: AdvisorTrait, index: number, stepIndex: number) => (
    <TouchableOpacity
      key={trait.value}
      className={`border rounded-lg p-3 mb-3 ${trait.selected ? 'bg-primary/20 border-primary' : 'border-border'}`}
      onPress={() => handleTraitToggle(stepIndex, index)}
    >
      <View className="flex-row justify-between items-center">
        <Text className="font-medium">{trait.label}</Text>
        {trait.selected && (
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary.DEFAULT} />
        )}
      </View>
    </TouchableOpacity>
  );

  // Render a custom draggable slider component
  const renderSlider = (label: string, name: keyof typeof sliders, min: string, max: string, animValue: Animated.Value) => {
    const sliderWidth = 270;
    
    return (
      <View className="mb-8" key={name}>
        <Text className="font-medium mb-2">{label}</Text>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm text-gray-500">{min}</Text>
          <Text className="text-sm text-gray-500">{max}</Text>
        </View>
        
        {/* Simple slider implementation */}
        <View className="items-center">
          {/* Slider track with value indicator */}
          <View className="relative w-full" style={{ width: sliderWidth }}>
            {/* Background track */}
            <View className="h-2 bg-gray-200 rounded-full" />
            
            {/* Colored portion of track */}
            <View 
              className="h-2 bg-primary rounded-full absolute top-0 left-0" 
              style={{ 
                width: `${((sliders[name] - 1) / 8) * 100}%` 
              }} 
            />
            
            {/* Thumb */}
            <View 
              className="absolute top-[-10px] bg-primary rounded-full w-6 h-6"
              style={{
                left: `${((sliders[name] - 1) / 8) * 100}%`,
                marginLeft: -12, // Offset half the width of the thumb
              }}
            />
          </View>
          
          {/* Individual value buttons */}
          <View className="flex-row justify-between w-full mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(value => (
              <TouchableOpacity
                key={value}
                onPress={() => handleSliderChange(name, value)}
                className="items-center justify-center"
                style={{ width: sliderWidth / 9 }}
              >
                <View 
                  className={`w-7 h-7 rounded-full items-center justify-center
                    ${value === sliders[name] ? 'bg-primary/20' : ''}`}
                >
                  <Text 
                    className={value === sliders[name] 
                      ? "text-primary font-semibold" 
                      : "text-gray-400"}
                  >
                    {value}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Touch area over the entire slider */}
          <TouchableOpacity
            activeOpacity={1}
            className="absolute top-0 left-0"
            style={{ width: sliderWidth, height: 40 }}
            onPress={(event) => {
              const { locationX } = event.nativeEvent;
              // Calculate value based on touch position
              // Map touch position (0 to sliderWidth) to value (1 to 9)
              const valueRange = 8; // 9-1
              const touchPercent = Math.max(0, Math.min(1, locationX / sliderWidth));
              const newValue = Math.round(1 + touchPercent * valueRange);
              handleSliderChange(name, newValue);
            }}
          />
        </View>
      </View>
    );
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.type) {
      case "traits":
        const traits = currentStep === 0 ? communicationTraits : personalityTraits;
        return (
          <View className="space-y-2">
            {traits.map((trait, index) => renderTraitButton(trait, index, currentStep))}
          </View>
        );
        
      case "sliders":
        return (
          <View className="space-y-2">
            {renderSlider("Directness", "directness", "Gentle", "Direct", directnessAnim)}
            {renderSlider("Optimism", "optimism", "Realistic", "Optimistic", optimismAnim)}
            {renderSlider("Approach", "creativity", "Conventional", "Creative", creativityAnim)}
          </View>
        );
        
      case "freeform":
        return (
          <View className="space-y-4">
            <View className="space-y-2">
              <View className="flex-row">
                <Text className="font-medium">Name Your Advisor</Text>
                <Text className="text-red-500"> *</Text>
              </View>
              <TextInput
                className={`border rounded-lg p-3 ${errors.advisorName ? 'border-red-500' : 'border-border'} text-text`}
                placeholder="Give your advisor a name"
                placeholderTextColor={theme.colors.text.muted}
                value={freeForm.advisorName}
                onChangeText={(text) => {
                  setFreeForm({...freeForm, advisorName: text});
                  if (text.trim()) {
                    setErrors({...errors, advisorName: false});
                  }
                }}
              />
              {errors.advisorName && (
                <Text className="text-red-500 text-sm">Please name your advisor</Text>
              )}
            </View>
            
            <View className="space-y-2">
              <Text className="font-medium">Background (optional)</Text>
              <TextInput
                className="border border-border rounded-lg p-3 text-text"
                placeholder="What kind of background should your advisor have?"
                placeholderTextColor={theme.colors.text.muted}
                value={freeForm.background}
                onChangeText={(text) => setFreeForm({...freeForm, background: text})}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View className="space-y-2">
              <Text className="font-medium">Areas of Expertise (optional)</Text>
              <TextInput
                className="border border-border rounded-lg p-3 text-text"
                placeholder="Any specific areas of expertise?"
                placeholderTextColor={theme.colors.text.muted}
                value={freeForm.expertise}
                onChangeText={(text) => setFreeForm({...freeForm, expertise: text})}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        );
        
      case "summary":
        // Build a summary of the advisor
        const selectedCommunicationTraits = communicationTraits.filter(t => t.selected).map(t => t.label);
        const selectedPersonalityTraits = personalityTraits.filter(t => t.selected).map(t => t.label);
        
        return (
          <View className="space-y-4">
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4">
                <Ionicons name="person" size={40} color={theme.colors.primary.DEFAULT} />
              </View>
              <H2 className="text-xl text-center mb-2">{freeForm.advisorName}</H2>
              <Muted className="text-center">This advisor will be tailored to your preferences</Muted>
            </View>
            
            {/* Generated prompt preview - make sure it doesn't overflow */}
            {generatedPrompt && (
              <View className="bg-primary/10 rounded-lg p-4 my-4">
                <Text className="font-medium mb-2">AI-Generated Prompt:</Text>
                <Text className="italic" numberOfLines={6} ellipsizeMode="tail">{generatedPrompt}</Text>
                <Muted className="text-xs mt-2">This prompt will be used when you ask for advice</Muted>
              </View>
            )}
            
            <View className="space-y-2 mt-4 pb-4">
              <Text className="font-medium">Communication Style</Text>
              <View className="flex-row flex-wrap">
                {selectedCommunicationTraits.length > 0 ? 
                  selectedCommunicationTraits.map((trait, i) => (
                    <View key={i} className="bg-primary/10 rounded-full px-3 py-1 mr-2 mb-2">
                      <Text className="text-sm">{trait}</Text>
                    </View>
                  )) : 
                  <Muted>No specific communication style selected</Muted>
                }
              </View>
            </View>
            
            <View className="space-y-2">
              <Text className="font-medium">Personality</Text>
              <View className="flex-row flex-wrap">
                {selectedPersonalityTraits.length > 0 ? 
                  selectedPersonalityTraits.map((trait, i) => (
                    <View key={i} className="bg-primary/10 rounded-full px-3 py-1 mr-2 mb-2">
                      <Text className="text-sm">{trait}</Text>
                    </View>
                  )) : 
                  <Muted>No specific personality traits selected</Muted>
                }
              </View>
            </View>
            
            {freeForm.background ? (
              <View className="space-y-2">
                <Text className="font-medium">Background</Text>
                <Muted>{freeForm.background}</Muted>
              </View>
            ) : null}
            
            {freeForm.expertise ? (
              <View className="space-y-2">
                <Text className="font-medium">Expertise</Text>
                <Muted>{freeForm.expertise}</Muted>
              </View>
            ) : null}
          </View>
        );
    }
  };

  // Generate preview prompt when reaching the final step
  useEffect(() => {
    if (currentStep === steps.length - 1) {
      const advisorData = {
        name: freeForm.advisorName,
        communicationTraits: communicationTraits.filter(t => t.selected).map(t => t.value),
        personalityTraits: personalityTraits.filter(t => t.selected).map(t => t.value),
        sliders,
        background: freeForm.background,
        expertise: freeForm.expertise,
      };
      
      // Try to generate a preview prompt
      createCustomAdvisor(advisorData, "preview")
        .then(result => {
          if (result.success && result.advisorPrompt) {
            setGeneratedPrompt(result.advisorPrompt);
          }
        })
        .catch(err => {
          console.error("Error generating preview prompt:", err);
          // Use a fallback prompt if generation fails
          setGeneratedPrompt(`I am ${advisorData.name}, your personal advisor. I will provide advice based on your needs.`);
        });
    }
  }, [currentStep]);

  return (
    <View className="flex-1 bg-background">
      <ScrollView 
        ref={scrollViewRef} 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120, paddingTop: isIOS ? 100 : 60 }}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
        />
        
        <View className="px-6 space-y-6 w-full max-w-lg mx-auto">
          <View className="flex-row justify-between items-center">
            <View>
              <H1 className="text-2xl font-bold text-text">Build Your Advisor</H1>
              <Muted>Create your perfect advisor</Muted>
            </View>
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.back()}
            >
              <Text>✕</Text>
            </Button>
          </View>
          
          {/* Progress indicators */}
          <View className="flex-row justify-between mb-4">
            {steps.map((_, index) => (
              <View 
                key={index}
                className={`h-1 flex-1 mx-0.5 rounded-full ${
                  index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </View>
          
          <View className="space-y-2 mb-6">
            <H2 className="text-xl">{steps[currentStep].title}</H2>
            <Muted>{steps[currentStep].description}</Muted>
          </View>
          
          {renderStepContent()}
          
          <View className="flex-row space-x-3 mt-6">
            <Button 
              variant="outline" 
              className="flex-1"
              onPress={handleBack}
            >
              <Text>{currentStep === 0 ? "Cancel" : "Back"}</Text>
            </Button>
            
            <Button 
              className="flex-1 bg-primary"
              onPress={handleNext}
            >
              <Text className="text-white">{currentStep === steps.length - 1 ? "Complete" : "Next"}</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 