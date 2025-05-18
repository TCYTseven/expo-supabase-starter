import { View, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { theme } from "@/lib/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useSupabase } from "@/context/supabase-provider";
import { getUserDecisionTrees, summarizeDecisionTree } from "@/lib/decisionAIService";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === 'ios';

export default function Home() {
	const [isLoading, setIsLoading] = useState(true);
	const [recentDecisions, setRecentDecisions] = useState<any[]>([]);
	const { user } = useSupabase();

	useEffect(() => {
		if (user?.id) {
			fetchRecentDecisions();
		} else {
			setIsLoading(false);
		}
	}, [user?.id]);

	const fetchRecentDecisions = async () => {
		if (!user?.id) return;
		
		setIsLoading(true);
		try {
			// Fetch only the 3 most recent decisions directly from the API
			const trees = await getUserDecisionTrees(user.id, 3);
			
			// Generate summaries for display
			const decisionsWithSummaries = await Promise.all(
				trees.map(async (tree) => {
					try {
						const summary = await summarizeDecisionTree(tree);
						return {
							...tree,
							summary
						};
					} catch (err) {
						console.error('Error generating summary:', err);
						return {
							...tree,
							summary: tree.title
						};
					}
				})
			);
			
			setRecentDecisions(decisionsWithSummaries);
		} catch (err) {
			console.error('Error fetching decision trees:', err);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		
		if (diffDays === 0) {
			return "Today";
		} else if (diffDays === 1) {
			return "Yesterday";
		} else if (diffDays < 7) {
			return `${diffDays} days ago`;
		} else if (diffDays < 30) {
			return `${Math.floor(diffDays / 7)} weeks ago`;
		} else {
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric'
			});
		}
	};

	return (
		<View className="flex-1 bg-background">
			<ScrollView 
				className="flex-1" 
				contentContainerStyle={{ paddingBottom: 80, paddingTop: isIOS ? 100 : 60 }}
			>
				<LinearGradient
					colors={['rgba(139, 92, 246, 0.15)', 'transparent']}
					style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
				/>
				
				<View className="px-6 space-y-6 w-full max-w-lg mx-auto">
					<View className="flex-row justify-between items-center">
						<View>
							<H1 className="text-2xl font-bold text-text">
								Smart8Ball
							</H1>
							<Muted>
								Your decision-making companion
							</Muted>
						</View>
					</View>

					{/* Quick Actions */}
					<View>
						<H2 className="text-xl font-semibold mb-4">
							Quick Actions
						</H2>
						<View className="flex-row flex-wrap gap-4">
							<TouchableOpacity 
								className="flex-1 min-w-[150px]"
								onPress={() => router.push("/(app)/(protected)/decide")}
							>
								<Card className="p-4 items-center justify-center h-32">
									<View className="bg-primary/10 p-3 rounded-full mb-3">
										<Ionicons name="help-buoy" size={24} color={theme.colors.primary.DEFAULT} />
									</View>
									<Text className="text-center font-medium">
										Decide
									</Text>
								</Card>
							</TouchableOpacity>

							<TouchableOpacity 
								className="flex-1 min-w-[150px]"
								onPress={() => router.push("/(app)/(protected)/personality")}
							>
								<Card className="p-4 items-center justify-center h-32">
									<View className="bg-primary/10 p-3 rounded-full mb-3">
										<Ionicons name="person" size={24} color={theme.colors.primary.DEFAULT} />
									</View>
									<Text className="text-center font-medium">
										Personality Quiz
									</Text>
								</Card>
							</TouchableOpacity>
						</View>
					</View>

					{/* History and Build Advisor */}
					<View>
						<View className="flex-row flex-wrap gap-4">
							<TouchableOpacity 
								className="flex-1 min-w-[150px]"
								onPress={() => router.push("/(app)/(protected)/history")}
							>
								<Card className="p-4 items-center justify-center h-32">
									<View className="bg-primary/10 p-3 rounded-full mb-3">
										<Ionicons name="time" size={24} color={theme.colors.primary.DEFAULT} />
									</View>
									<Text className="text-center font-medium">
										History
									</Text>
								</Card>
							</TouchableOpacity>

							<TouchableOpacity 
								className="flex-1 min-w-[150px]"
								onPress={() => router.push("/(app)/(protected)/build-advisor")}
							>
								<Card className="p-4 items-center justify-center h-32">
									<View className="bg-primary/10 p-3 rounded-full mb-3">
										<Ionicons name="build" size={24} color={theme.colors.primary.DEFAULT} />
									</View>
									<Text className="text-center font-medium">
										Build Advisor
									</Text>
								</Card>
							</TouchableOpacity>
						</View>
					</View>

					{/* Recent Decisions */}
					<View>
						<H2 className="text-xl font-semibold mb-4">
							Recent Decisions
						</H2>
						
						{isLoading ? (
							<View className="items-center justify-center py-6">
								<ActivityIndicator size="small" color={theme.colors.primary.DEFAULT} />
								<Text className="mt-2 text-center text-muted-foreground">Loading decisions...</Text>
							</View>
						) : recentDecisions.length === 0 ? (
							<Card className="p-6 items-center">
								<Ionicons name="document-text-outline" size={32} color={theme.colors.text.muted} />
								<Text className="mt-2 text-center">No decisions yet</Text>
								<TouchableOpacity 
									className="mt-4 bg-primary/10 px-4 py-2 rounded-full"
									onPress={() => router.push("/(app)/(protected)/decide")}
								>
									<Text className="text-primary">Start Your First Decision</Text>
								</TouchableOpacity>
							</Card>
						) : (
							<View className="space-y-4">
								{recentDecisions.map((decision) => (
									<TouchableOpacity 
										key={decision.id}
										onPress={() => router.push(`/(app)/(protected)/decision/${decision.id}`)}
									>
										<Card className="p-4">
											<View className="space-y-2 flex-row items-center">
												<View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
													<Ionicons name="help-buoy-outline" size={18} color={theme.colors.primary.DEFAULT} />
												</View>
												<View className="flex-1">
													<Text className="font-medium">
														{decision.summary || decision.title}
													</Text>
													<Muted>
														Last updated: {formatDate(decision.updatedAt)}
													</Muted>
												</View>
												<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
											</View>
										</Card>
									</TouchableOpacity>
								))}
								
								<TouchableOpacity
									className="mt-2"
									onPress={() => router.push("/(app)/(protected)/history")}
								>
									<Text className="text-primary text-center">View All History</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
