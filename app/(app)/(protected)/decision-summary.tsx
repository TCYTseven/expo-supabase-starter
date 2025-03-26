import { View, ScrollView } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";

export default function DecisionSummary() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold">Decision Summary</H1>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.push("/(app)/(protected)")}
          >
            <Text>✕</Text>
          </Button>
        </View>

        <Card className="p-4">
          <View className="space-y-4">
            <View className="items-center">
              <Text className="text-2xl mb-2">🎯</Text>
              <H2 className="text-xl text-center">Career Change Decision</H2>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Key Insights</Text>
              <Muted>
                Based on your responses and the analysis, here are the key insights:
              </Muted>
              <View className="space-y-2">
                <Text>• Your current job satisfaction is moderate</Text>
                <Text>• The financial impact of changing careers would be positive</Text>
                <Text>• You have transferable skills in your target field</Text>
              </View>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Recommendation</Text>
              <Muted>
                Based on the analysis, we recommend proceeding with the career change.
                The potential benefits outweigh the risks, and you have a solid
                foundation to make this transition.
              </Muted>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Next Steps</Text>
              <View className="space-y-2">
                <Text>1. Research target companies and roles</Text>
                <Text>2. Update your resume and LinkedIn profile</Text>
                <Text>3. Start networking in your target industry</Text>
                <Text>4. Consider taking relevant courses or certifications</Text>
              </View>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Save for Later</Text>
              <Button
                variant="outline"
                className="w-full"
                onPress={() => router.push("/(app)/(protected)")}
              >
                <Text>Save to History</Text>
              </Button>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
} 