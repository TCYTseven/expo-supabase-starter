import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState } from "react";

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

export default function PersonalityQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed, calculate personality type
      const personalityType = newAnswers.join("");
      // TODO: Save personality type to user profile
      router.push("/(app)/(protected)/personality-result");
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
                  >
                    <Text className="text-left">{option.text}</Text>
                  </Button>
                ))}
              </View>
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
} 