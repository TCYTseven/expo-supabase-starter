import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { theme } from "@/lib/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function Home() {
	return (
		<View className="flex-1" style={{ backgroundColor: theme.colors.background.DEFAULT }}>
			<ScrollView 
				className="flex-1" 
				style={{ paddingTop: theme.spacing.safeTop }}
				contentContainerStyle={{ paddingBottom: 100 }} // Space for bottom nav
			>
				<View className="p-6 space-y-8">
					<View className="flex-row justify-between items-center">
						<View>
							<H1 className="text-2xl font-bold">
								Smart8Ball
							</H1>
							<Muted>
								Your decision-making companion
							</Muted>
						</View>
					</View>

					{/* Quick Actions */}
					<View className="space-y-4">
						<H2 className="text-xl font-semibold">
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
								onPress={() => router.push("/(app)/(protected)/new-decision")}
							>
								<Card className="p-4 items-center justify-center h-32">
									<View className="bg-primary/10 p-3 rounded-full mb-3">
										<Ionicons name="navigate" size={24} color={theme.colors.primary.DEFAULT} />
									</View>
									<Text className="text-center font-medium">
										New Decision
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
						</View>
					</View>

					{/* Recent Decisions */}
					<View className="space-y-4">
						<H2 className="text-xl font-semibold">
							Recent Decisions
						</H2>
						<Card className="p-4">
							<View className="space-y-2 flex-row items-center">
								<View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
									<MaterialCommunityIcons name="briefcase-outline" size={18} color={theme.colors.primary.DEFAULT} />
								</View>
								<View className="flex-1">
									<Text className="font-medium">
										Career Change
									</Text>
									<Muted>
										Last updated: 2 days ago
									</Muted>
								</View>
								<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
							</View>
						</Card>
						<Card className="p-4">
							<View className="space-y-2 flex-row items-center">
								<View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
									<Ionicons name="home-outline" size={18} color={theme.colors.primary.DEFAULT} />
								</View>
								<View className="flex-1">
									<Text className="font-medium">
										Moving to New City
									</Text>
									<Muted>
										Last updated: 1 week ago
									</Muted>
								</View>
								<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
							</View>
						</Card>
						<Card className="p-4">
							<View className="space-y-2 flex-row items-center">
								<View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
									<Ionicons name="cash-outline" size={18} color={theme.colors.primary.DEFAULT} />
								</View>
								<View className="flex-1">
									<Text className="font-medium">
										Investment Strategy
									</Text>
									<Muted>
										Last updated: 2 weeks ago
									</Muted>
								</View>
								<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
							</View>
						</Card>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
