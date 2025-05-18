import { View, ScrollView, TouchableOpacity, Dimensions, Platform } from "react-native";
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
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/lib/theme";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === 'ios';

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
    <ScrollView 
      className="flex-1 bg-background" 
      contentContainerStyle={{ paddingBottom: 80, paddingTop: isIOS ? 100 : 60 }}
    >
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
      />
      
      <View className="px-6 space-y-4 w-full max-w-lg mx-auto">
        <View className="flex-row justify-between items-center">
          <View>
            <H1 className="text-2xl font-bold text-text">Decision History</H1>
            <Muted>Your decision journey</Muted>
          </View>
          
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
            onPress={() => router.push("/(app)/(protected)/decide")}
          >
            <Ionicons name="add" size={20} color={theme.colors.primary.DEFAULT} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-8">
            <View className="bg-primary/20 p-4 rounded-full mb-3">
              <ActivityIndicator size="small" color={theme.colors.primary.DEFAULT} />
            </View>
            <Text className="text-text text-center font-medium text-sm">Loading your decisions...</Text>
            <Text className="text-muted text-center text-xs">Gathering your thought process</Text>
          </View>
        ) : decisions.length === 0 ? (
          <Card className="bg-background-card border-none shadow-md overflow-hidden p-5">
            <View className="items-center justify-center py-5">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Ionicons name="document-text-outline" size={28} color={theme.colors.primary.DEFAULT} />
              </View>
              <Text className="text-text text-center font-medium text-base mb-1">No decisions yet</Text>
              <Text className="text-muted text-center text-xs px-4 mb-6">
                Your decision history will appear here when you make your first decision
              </Text>
              <Button
                className="bg-primary px-5 py-2 rounded-lg shadow shadow-primary/30"
                onPress={() => router.push("/(app)/(protected)/decide")}
              >
                <Text className="text-white font-medium text-sm">Start Your First Decision</Text>
              </Button>
            </View>
          </Card>
        ) : (
          <View className="space-y-3">
            {decisions.map((decision) => (
              <TouchableOpacity
                key={decision.id}
                onPress={() => router.push(`/(app)/(protected)/decision/${decision.id}`)}
                activeOpacity={0.7}
              >
                <Card className="bg-background-card border-none shadow-sm overflow-hidden">
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'transparent']}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4 }}
                  />
                  <View className="p-3 space-y-2">
                    <Text className="font-medium text-base text-text">{summaries[decision.id] || `📝 ${decision.title}`}</Text>
                    
                    <View className="flex-row justify-between items-center mt-1">
                      <View className="flex-row items-center">
                        <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center mr-1">
                          <Text className="text-primary font-medium text-xs">{Object.keys(decision.nodes).length}</Text>
                        </View>
                        <Text className="text-muted text-xs">nodes</Text>
                      </View>
                      
                      <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                        <Text className="text-primary text-xs font-medium">
                          {formatDate(decision.updatedAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {decisions.length > 0 && (
          <Button
            className="w-full py-3 bg-primary rounded-lg shadow shadow-primary/30 mt-2"
            onPress={() => router.push("/(app)/(protected)/decide")}
          >
            <Text className="text-white font-medium text-sm">Start New Decision</Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
} 