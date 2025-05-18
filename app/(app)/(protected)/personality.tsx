import { View, ScrollView, ActivityIndicator, Platform, Dimensions, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/lib/theme";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === 'ios';

const questions = [
  {
    id: 1,
    question: "When making decisions, do you prefer to:",
    options: [
      { text: "Rely on logic and facts", value: "T" },
      { text: "Consider feelings and values", value: "F" },
    ],
  },
  {
    id: 2,
    question: "In social situations, do you:",
    options: [
      { text: "Gain energy from being around others", value: "E" },
      { text: "Feel drained and need alone time", value: "I" },
    ],
  },
  {
    id: 3,
    question: "When planning, do you prefer:",
    options: [
      { text: "Structured schedules and lists", value: "J" },
      { text: "Flexible, spontaneous approaches", value: "P" },
    ],
  },
  {
    id: 4,
    question: "When learning new things, do you:",
    options: [
      { text: "Focus on concrete facts and details", value: "S" },
      { text: "Look for patterns and possibilities", value: "N" },
    ],
  },
];

// Mapping of quiz results to personality types
const personalityTypes = {
  "ISTJ": "The Inspector",
  "ISFJ": "The Protector",
  "INFJ": "The Counselor",
  "INTJ": "The Architect",
  "ISTP": "The Craftsman",
  "ISFP": "The Composer",
  "INFP": "The Healer",
  "INTP": "The Thinker",
  "ESTP": "The Dynamo",
  "ESFP": "The Performer",
  "ENFP": "The Champion",
  "ENTP": "The Visionary",
  "ESTJ": "The Supervisor",
  "ESFJ": "The Provider",
  "ENFJ": "The Teacher",
  "ENTJ": "The Commander"
};

export default function PersonalityQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const { updatePersonalityType } = useUserProfile();

  const handleAnswer = async (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      try {
        // Quiz completed, calculate and save personality type
        // Note: In a real app, you would need to map these values to proper MBTI types
        // This is a simplified version that just concatenates the answers
        const i = newAnswers[1] === "I" ? 0 : 1;
        const s = newAnswers[3] === "S" ? 0 : 1;
        const t = newAnswers[0] === "T" ? 0 : 1;
        const j = newAnswers[2] === "J" ? 0 : 1;
        
        // We're simplifying this - a real test would do more complex calculations
        const type = `${i ? "E" : "I"}${s ? "N" : "S"}${t ? "F" : "T"}${j ? "P" : "J"}`;
        
        setSaving(true);
        await updatePersonalityType(type);
        setSaving(false);
        
        // Navigate to the result page
        router.push({
          pathname: "/(app)/(protected)/personality-result",
          params: { type }
        });
      } catch (error) {
        console.error("Failed to save personality type:", error);
        setSaving(false);
      }
    }
  };

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
            <H1 className="text-2xl font-bold text-text">Personality Quiz</H1>
            <Muted>Discover your decision style</Muted>
          </View>
        </View>

        <View className="space-y-4">
          <Card className="bg-background-card border-none shadow-md overflow-hidden">
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4 }}
            />
            <View className="p-5 space-y-4">
              <View className="flex-row justify-between">
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary text-xs font-medium">Question {currentQuestion + 1} of {questions.length}</Text>
                </View>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary text-xs font-medium">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</Text>
                </View>
              </View>
              
              <H2 className="text-xl font-semibold text-text">
                {questions[currentQuestion].question}
              </H2>

              <View className="space-y-3 mt-2">
                {questions[currentQuestion].options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    className="w-full border-2 border-primary/30 rounded-xl p-4 bg-background-input active:opacity-80"
                    onPress={() => handleAnswer(option.value)}
                    disabled={saving}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center">
                      <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-3">
                        <Text className="text-primary font-semibold">{index + 1}</Text>
                      </View>
                      <Text className="flex-1 text-text font-medium">{option.text}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              {saving && (
                <View className="items-center py-4 mt-2">
                  <View className="bg-primary/20 p-4 rounded-full mb-3">
                    <ActivityIndicator size="small" color={theme.colors.primary.DEFAULT} />
                  </View>
                  <Text className="text-text text-center font-medium">Processing your results...</Text>
                  <Muted className="text-center">Creating your personalized profile</Muted>
                </View>
              )}
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
} 