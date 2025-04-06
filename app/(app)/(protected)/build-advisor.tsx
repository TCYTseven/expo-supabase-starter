import { View, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/lib/theme";

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
  
  const [sliders, setSliders] = useState({
    directness: 5,
    optimism: 5,
    creativity: 5,
    detail: 5,
  });
  
  const [freeForm, setFreeForm] = useState({
    background: "",
    expertise: "",
    tone: "",
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
      description: "Tell us more about your ideal advisor. These are optional.",
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
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      // Save advisor settings and return to settings
      router.replace("/(app)/(protected)/settings");
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

  // Render a custom slider component
  const renderSlider = (label: string, name: keyof typeof sliders, min: string, max: string) => (
    <View className="mb-6" key={name}>
      <Text className="font-medium mb-2">{label}</Text>
      <View className="flex-row items-center">
        <Text className="w-24">{min}</Text>
        <View className="flex-1 h-2 bg-gray-200 rounded-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
            <TouchableOpacity
              key={val}
              style={{
                position: 'absolute',
                left: `${(val - 1) * 12.5}%`,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: val <= sliders[name] ? theme.colors.primary.DEFAULT : '#ddd',
                marginTop: -9,
              }}
              onPress={() => handleSliderChange(name, val)}
            />
          ))}
        </View>
        <Text className="w-24 text-right">{max}</Text>
      </View>
    </View>
  );

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
            {renderSlider("Directness", "directness", "Gentle", "Direct")}
            {renderSlider("Optimism", "optimism", "Realistic", "Optimistic")}
            {renderSlider("Approach", "creativity", "Conventional", "Creative")}
            {renderSlider("Focus", "detail", "Big Picture", "Detail-oriented")}
          </View>
        );
        
      case "freeform":
        return (
          <View className="space-y-4">
            <View className="space-y-2">
              <Text className="font-medium">Background (optional)</Text>
              <TextInput
                className="border border-border rounded-lg p-3"
                placeholder="What kind of background should your advisor have?"
                value={freeForm.background}
                onChangeText={(text) => setFreeForm({...freeForm, background: text})}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View className="space-y-2">
              <Text className="font-medium">Areas of Expertise (optional)</Text>
              <TextInput
                className="border border-border rounded-lg p-3"
                placeholder="Any specific areas of expertise?"
                value={freeForm.expertise}
                onChangeText={(text) => setFreeForm({...freeForm, expertise: text})}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View className="space-y-2">
              <Text className="font-medium">Tone and Voice (optional)</Text>
              <TextInput
                className="border border-border rounded-lg p-3"
                placeholder="How should your advisor speak to you?"
                value={freeForm.tone}
                onChangeText={(text) => setFreeForm({...freeForm, tone: text})}
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
              <H2 className="text-xl text-center mb-2">Your Custom Advisor</H2>
              <Muted className="text-center">This advisor will be tailored to your preferences</Muted>
            </View>
            
            <View className="space-y-2 mt-4">
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
            
            {freeForm.tone ? (
              <View className="space-y-2">
                <Text className="font-medium">Tone</Text>
                <Muted>{freeForm.tone}</Muted>
              </View>
            ) : null}
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView ref={scrollViewRef} className="flex-1">
        <View className="p-6 space-y-6">
          <View className="flex-row justify-between items-center">
            <H1 className="text-2xl font-bold">Build Your Advisor</H1>
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