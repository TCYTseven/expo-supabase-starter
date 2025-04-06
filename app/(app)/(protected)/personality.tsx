import { View, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

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
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold">Personality Quiz</H1>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
          >
            <Text>✕</Text>
          </Button>
        </View>

        <View className="space-y-4">
          <Card className="p-4">
            <View className="space-y-4">
              <View className="flex-row justify-between">
                <Muted>Question {currentQuestion + 1} of {questions.length}</Muted>
                <Muted>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</Muted>
              </View>
              
              <H2 className="text-xl font-semibold">
                {questions[currentQuestion].question}
              </H2>

              <View className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full"
                    onPress={() => handleAnswer(option.value)}
                    disabled={saving}
                  >
                    <Text className="text-left">{option.text}</Text>
                  </Button>
                ))}
              </View>
              
              {saving && (
                <View className="items-center py-2">
                  <ActivityIndicator size="small" />
                  <Muted className="mt-2">Saving your results...</Muted>
                </View>
              )}
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
} 