import { View, ScrollView, Switch } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function Settings() {
	const [notifications, setNotifications] = useState({
		newAdvice: true,
		reminders: true,
		updates: false,
	});

	return (
		<ScrollView className="flex-1 bg-background">
			<View className="p-6 space-y-6">
				<View className="flex-row justify-between items-center">
					<H1 className="text-2xl font-bold">Settings</H1>
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
							<Text className="font-medium">Personality Profile</Text>
							<View className="flex-row justify-between items-center">
								<Muted>Current Type</Muted>
								<Text>INTJ - The Architect</Text>
							</View>
							<Button
								variant="outline"
								className="w-full"
								onPress={() => router.push("/(app)/(protected)/personality")}
							>
								<Text>Retake Personality Quiz</Text>
							</Button>
						</View>

						<View className="space-y-2">
							<Text className="font-medium">Preferred Advisor</Text>
							<View className="flex-row justify-between items-center">
								<Muted>Current Advisor</Muted>
								<Text>Rocky Balboa</Text>
							</View>
							<Button
								variant="outline"
								className="w-full"
								onPress={() => router.push("/(app)/(protected)/personality-result")}
							>
								<Text>Change Advisor</Text>
							</Button>
						</View>
					</View>
				</Card>

				<Card className="p-4">
					<View className="space-y-4">
						<Text className="font-medium">Notifications</Text>
						<View className="space-y-4">
							<View className="flex-row justify-between items-center">
								<View>
									<Text>New Advice</Text>
									<Muted>Get notified when new advice is available</Muted>
								</View>
								<Switch
									value={notifications.newAdvice}
									onValueChange={(value) =>
										setNotifications({ ...notifications, newAdvice: value })
									}
								/>
							</View>

							<View className="flex-row justify-between items-center">
								<View>
									<Text>Reminders</Text>
									<Muted>Get reminded to complete pending decisions</Muted>
								</View>
								<Switch
									value={notifications.reminders}
									onValueChange={(value) =>
										setNotifications({ ...notifications, reminders: value })
									}
								/>
							</View>

							<View className="flex-row justify-between items-center">
								<View>
									<Text>Updates</Text>
									<Muted>Get notified about app updates and improvements</Muted>
								</View>
								<Switch
									value={notifications.updates}
									onValueChange={(value) =>
										setNotifications({ ...notifications, updates: value })
									}
								/>
							</View>
						</View>
					</View>
				</Card>

				<Card className="p-4">
					<View className="space-y-4">
						<Text className="font-medium">Account</Text>
						<Button
							variant="outline"
							className="w-full"
							onPress={() => router.push("/(app)/sign-in")}
						>
							<Text>Sign Out</Text>
						</Button>
					</View>
				</Card>
			</View>
		</ScrollView>
	);
}
