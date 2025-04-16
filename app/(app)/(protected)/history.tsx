import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getUserDecisionTrees, DecisionTree } from "@/lib/decisionAIService";
import { useSupabase } from "@/context/supabase-provider";
import { summarizeDecisionTree } from "@/lib/decisionAIService";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function History() {
  const [isLoading, setIsLoading] = useState(true);
  const [decisions, setDecisions] = useState<DecisionTree[]>([]);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const { user } = useSupabase();

  useEffect(() => {
    if (user?.id) {
      fetchDecisions();
    }
  }, [user?.id]);

  const fetchDecisions = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const trees = await getUserDecisionTrees(user.id);
      setDecisions(trees);
      
      // Generate summaries for each tree
      const summaryMap: Record<string, string> = {};
      for (const tree of trees) {
        try {
          const summary = await summarizeDecisionTree(tree);
          summaryMap[tree.id] = summary;
        } catch (err) {
          console.error('Error generating summary:', err);
          summaryMap[tree.id] = `📝 ${tree.title}`;
        }
      }
      setSummaries(summaryMap);
    } catch (err) {
      console.error('Error fetching decision trees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-6 space-y-6">
        <View className="flex-row justify-between items-center">
          <H1 className="text-2xl font-bold">Decision History</H1>
          <View className="flex-row">
            <Button
              variant="ghost"
              onPress={() => router.push("/(app)/(protected)/decide")}
              className="mr-2"
            >
              <Text>New</Text>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.back()}
            >
              <Text>✕</Text>
            </Button>
          </View>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#6e3abd" />
            <Text className="mt-4 text-center">Loading your decisions...</Text>
          </View>
        ) : decisions.length === 0 ? (
          <View className="items-center justify-center py-10">
            <Ionicons name="document-text-outline" size={64} color="#6e3abd" />
            <Text className="mt-4 text-center font-medium text-lg">No decisions yet</Text>
            <Text className="text-center text-muted-foreground mb-6">
              Your decision history will appear here
            </Text>
            <Button
              onPress={() => router.push("/(app)/(protected)/decide")}
            >
              <Text>Start Your First Decision</Text>
            </Button>
          </View>
        ) : (
          <View className="space-y-4">
            {decisions.map((decision) => (
              <TouchableOpacity
                key={decision.id}
                onPress={() => router.push(`/(app)/(protected)/decision/${decision.id}`)}
              >
                <Card className="p-4">
                  <View className="space-y-2">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center space-x-2">
                        <View
                          className="w-2 h-2 rounded-full bg-green-500"
                        />
                        <Text className="text-sm text-muted-foreground">
                          {Object.keys(decision.nodes).length} nodes
                        </Text>
                      </View>
                      <Text className="text-sm text-muted-foreground">
                        {formatDate(decision.updatedAt)}
                      </Text>
                    </View>
                    <Text className="font-medium">{summaries[decision.id] || `📝 ${decision.title}`}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {decisions.length > 0 && (
          <Button
            className="w-full"
            onPress={() => router.push("/(app)/(protected)/decide")}
          >
            <Text>Start New Decision</Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
} 