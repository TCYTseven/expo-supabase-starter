import { View, ScrollView, ActivityIndicator, Platform, Dimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { getDecisionTree, DecisionTree, summarizeDecisionTree } from "@/lib/decisionAIService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Add platform detection for consistent padding
const isIOS = Platform.OS === 'ios';

export default function DecisionView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [decisionTree, setDecisionTree] = useState<DecisionTree | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDecisionTree();
    }
  }, [id]);

  const fetchDecisionTree = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tree = await getDecisionTree(id as string);
      
      if (!tree) {
        setError("Decision not found");
        return;
      }
      
      setDecisionTree(tree);
      
      // Generate a summary
      const treeSummary = await summarizeDecisionTree(tree);
      setSummary(treeSummary);
    } catch (err: any) {
      console.error("Error fetching decision tree:", err);
      setError(err.message || "Failed to load the decision");
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

  // Get key insights from the decision tree - these are the root node content
  const getKeyInsights = () => {
    if (!decisionTree) return [];
    
    const rootNodeId = decisionTree.currentNodeId;
    const rootNode = decisionTree.nodes[rootNodeId];
    
    if (!rootNode || !rootNode.content) {
      return [];
    }
    
    // Split content by newlines or bullet points and filter empty lines
    const insights = rootNode.content.split(/[\n•]/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    return insights.slice(0, 5); // Return top 5 insights
  };

  // Get recommendations from the decision tree - these are the options
  const getRecommendations = () => {
    if (!decisionTree) return [];
    
    const currentNodeId = decisionTree.currentNodeId;
    const currentNode = decisionTree.nodes[currentNodeId];
    
    if (!currentNode || !currentNode.options) {
      return [];
    }
    
    return currentNode.options.map(option => option.text);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#6e3abd" />
        <Text className="mt-4">Loading decision...</Text>
      </View>
    );
  }

  if (error || !decisionTree) {
    return (
      <View className="flex-1 bg-background p-6 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={64} color="#ee4444" />
        <Text className="text-lg font-medium mt-4 mb-2">
          {error || "Decision not found"}
        </Text>
        <Text className="text-center text-muted-foreground mb-6">
          We couldn't load this decision. It may have been deleted or there was a connection issue.
        </Text>
        <Button onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 120, paddingTop: isIOS ? 100 : 60 }}
    >
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
      />
      
      <View className="px-6 space-y-6 w-full max-w-lg mx-auto">
        <View className="flex-row justify-between items-center">
          <View>
            <H1 className="text-2xl font-bold text-text">
              Decision Details
            </H1>
            <Muted>
              Review your decision process
            </Muted>
          </View>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-primary/10"
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={20} color="#6e3abd" />
          </Button>
        </View>

        <Card className="p-4">
          <View className="space-y-4">
            <View className="items-center">
              <Text className="text-2xl mb-2">{summary.split(" ")[0] || "🎯"}</Text>
              <H2 className="text-xl text-center">{decisionTree.title}</H2>
              <Muted>{formatDate(decisionTree.updatedAt)}</Muted>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Summary</Text>
              <Muted>{summary}</Muted>
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Topic</Text>
              <Muted>{decisionTree.topic}</Muted>
            </View>

            {decisionTree.context && (
              <View className="space-y-2">
                <Text className="font-medium">Context</Text>
                <Muted>{decisionTree.context}</Muted>
              </View>
            )}

            <View className="space-y-2">
              <Text className="font-medium">Key Insights</Text>
              {getKeyInsights().map((insight, index) => (
                <Text key={index}>• {insight}</Text>
              ))}
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Recommendations</Text>
              {getRecommendations().map((recommendation, index) => (
                <Text key={index}>{index + 1}. {recommendation}</Text>
              ))}
            </View>

            <View className="space-y-2">
              <Text className="font-medium">Decision Stats</Text>
              <View className="flex-row justify-between">
                <Muted>Total Decision Points:</Muted>
                <Text>{Object.keys(decisionTree.nodes).length}</Text>
              </View>
              <View className="flex-row justify-between">
                <Muted>Created:</Muted>
                <Text>{formatDate(decisionTree.createdAt)}</Text>
              </View>
            </View>

            <Button
              className="w-full"
              onPress={() => router.push({
                pathname: "/(app)/(protected)/decide",
                params: { topic: decisionTree.topic }
              })}
            >
              <Text>Start Similar Decision</Text>
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onPress={() => router.push({
                pathname: "/(app)/(protected)/decide",
                params: { treeId: decisionTree.id }
              })}
            >
              <Text>Continue This Decision</Text>
            </Button>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
} 