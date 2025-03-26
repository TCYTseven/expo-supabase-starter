import { View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function NewDecision() {
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");

  const handleStartDecision = () => {
    if (!decision.trim()) return;
    // TODO: Save decision and context to database
    router.push("/(app)/(protected)/decision-flow");
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold">New Decision</H1>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
          >
            <Text>✕</Text>
          </Button>
        </View>

        <Card className="p-4">
          <View className="space-y-4">
            <View className="space-y-2">
              <Text className="font-medium">What decision do you need help with?</Text>
              <TextInput
                className="border border-border rounded-md p-3"
                placeholder="e.g., Should I change careers?"
                value={decision}
                onChangeText={setDecision}
                multiline
              />
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Additional Context (Optional)</Text>
              <TextInput
                className="border border-border rounded-md p-3"
                placeholder="Add any relevant details that might help..."
                value={context}
                onChangeText={setContext}
                multiline
                numberOfLines={4}
              />
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Upload Documents (Optional)</Text>
              <TouchableOpacity className="border border-dashed border-border rounded-md p-4 items-center">
                <Text className="text-2xl mb-2">📄</Text>
                <Text>Tap to upload PDF or PNG</Text>
                <Muted>Max file size: 5MB</Muted>
              </TouchableOpacity>
            </View>

            <Button
              className="w-full"
              onPress={handleStartDecision}
              disabled={!decision.trim()}
            >
              <Text>Start Decision Process</Text>
            </Button>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
} 