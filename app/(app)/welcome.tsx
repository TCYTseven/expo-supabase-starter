import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { theme } from "@/lib/theme";

export default function Welcome() {
	return (
		<ScrollView className="flex-1" style={{ backgroundColor: theme.colors.background.DEFAULT }}>
			<View className="flex-1 items-center justify-center p-6 gap-y-8" style={{ paddingTop: theme.spacing.safeTop }}>
				<View className="items-center">
					<Text className="text-6xl mb-4">🎱</Text>
					<H1 className="text-center text-4xl font-bold" style={{ color: theme.colors.text.DEFAULT }}>
						Smart8Ball
					</H1>
					<Muted className="text-center text-lg mt-2" style={{ color: theme.colors.text.muted }}>
						Your AI-powered decision-making companion
					</Muted>
				</View>

				<TouchableOpacity
					className="w-full bg-primary rounded-2xl p-6 items-center"
					onPress={() => router.push("/(app)/(protected)/new-decision")}
				>
					<Text className="text-2xl mb-2">🎯</Text>
					<Text className="text-xl font-bold text-white">Make a Decision</Text>
					<Muted className="text-center mt-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
						Get personalized advice for your choices
					</Muted>
				</TouchableOpacity>

				<View className="w-full space-y-4">
					<View className="bg-background-card p-4 rounded-xl">
						<H2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text.DEFAULT }}>
							Dynamic Flowcharts
						</H2>
						<Muted style={{ color: theme.colors.text.muted }}>
							Visualize your decision-making process with interactive flowcharts
						</Muted>
					</View>

					<View className="bg-background-card p-4 rounded-xl">
						<H2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text.DEFAULT }}>
							Personality-Driven Advice
						</H2>
						<Muted style={{ color: theme.colors.text.muted }}>
							Get guidance from unique personalities like Rocky Balboa or Uncle Iroh
						</Muted>
					</View>

					<View className="bg-background-card p-4 rounded-xl">
						<H2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text.DEFAULT }}>
							Smart Context Analysis
						</H2>
						<Muted style={{ color: theme.colors.text.muted }}>
							Upload documents for AI-enhanced insights
						</Muted>
					</View>

					<View className="bg-background-card p-4 rounded-xl">
						<H2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text.DEFAULT }}>
							Real-Time Feedback
						</H2>
						<Muted style={{ color: theme.colors.text.muted }}>
							Shape your decision path with continuous feedback
						</Muted>
					</View>
				</View>

				<View className="w-full space-y-4">
					<Button
						className="w-full bg-primary"
						size="lg"
						onPress={() => router.push("/(app)/sign-up")}
					>
						<Text className="text-lg text-white">Get Started</Text>
					</Button>
					<Button
						className="w-full bg-background-card"
						variant="outline"
						size="lg"
						onPress={() => router.push("/(app)/sign-in")}
					>
						<Text className="text-lg" style={{ color: theme.colors.text.DEFAULT }}>
							I already have an account
						</Text>
					</Button>
				</View>
			</View>
		</ScrollView>
	);
}
