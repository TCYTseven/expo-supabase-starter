import { View, ScrollView, Switch, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { theme } from "@/lib/theme";

export default function Settings() {
	const [notifications, setNotifications] = useState({
		newAdvice: true,
		reminders: true,
		updates: false,
	});

	const renderDivider = () => (
		<View className="h-px bg-border/50 my-4" />
	);

	const renderSectionHeader = (title: string) => (
		<Text className="font-bold text-lg mb-4">{title}</Text>
	);

	return (
		<ScrollView className="flex-1 bg-background">
			<View className="p-6 space-y-8">
				<View className="flex-row justify-between items-center">
					<H1 className="text-2xl font-bold">Settings</H1>
				</View>

				{/* Advisor & Personality Section */}
				{renderSectionHeader("Advisor & Personality")}

				<TouchableOpacity 
					className="flex-row items-center justify-between py-3"
					onPress={() => router.push("/(app)/(protected)/build-advisor")}
				>
					<View className="flex-row items-center">
						<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
							<Ionicons name="person" size={20} color={theme.colors.primary.DEFAULT} />
						</View>
						<View>
							<Text className="font-medium">Build Your Advisor</Text>
							<Muted>Create a personalized advisor for tailored guidance</Muted>
						</View>
					</View>
					<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
				</TouchableOpacity>

				{renderDivider()}

				<TouchableOpacity 
					className="flex-row items-center justify-between py-3"
					onPress={() => router.push("/(app)/(protected)/personality")}
				>
					<View className="flex-row items-center">
						<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
							<Ionicons name="analytics" size={20} color={theme.colors.primary.DEFAULT} />
						</View>
						<View>
							<Text className="font-medium">Personality Profile</Text>
							<View className="flex-row">
								<Muted>Current Type: </Muted>
								<Text>INTJ - The Architect</Text>
							</View>
						</View>
					</View>
					<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
				</TouchableOpacity>

				{renderDivider()}

				<TouchableOpacity 
					className="flex-row items-center justify-between py-3"
					onPress={() => router.push("/(app)/(protected)/personality-result")}
				>
					<View className="flex-row items-center">
						<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
							<Ionicons name="people" size={20} color={theme.colors.primary.DEFAULT} />
						</View>
						<View>
							<Text className="font-medium">Change Advisor</Text>
							<View className="flex-row">
								<Muted>Current Advisor: </Muted>
								<Text>Rocky Balboa</Text>
							</View>
						</View>
					</View>
					<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
				</TouchableOpacity>

				{/* Notifications Section */}
				<View className="mt-6">
					{renderSectionHeader("Notifications")}

					<View className="space-y-5">
						<View className="flex-row justify-between items-center">
							<View className="flex-1 pr-4">
								<Text className="font-medium mb-1">New Advice</Text>
								<Muted>Get notified when new advice is available</Muted>
							</View>
							<Switch
								value={notifications.newAdvice}
								onValueChange={(value) =>
									setNotifications({ ...notifications, newAdvice: value })
								}
							/>
						</View>

						{renderDivider()}

						<View className="flex-row justify-between items-center">
							<View className="flex-1 pr-4">
								<Text className="font-medium mb-1">Reminders</Text>
								<Muted>Get reminded to complete pending decisions</Muted>
							</View>
							<Switch
								value={notifications.reminders}
								onValueChange={(value) =>
									setNotifications({ ...notifications, reminders: value })
								}
							/>
						</View>

						{renderDivider()}

						<View className="flex-row justify-between items-center">
							<View className="flex-1 pr-4">
								<Text className="font-medium mb-1">Updates</Text>
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

				{/* Account Section */}
				<View className="mt-6">
					{renderSectionHeader("Account")}

					<TouchableOpacity 
						className="flex-row items-center justify-between py-3"
						onPress={() => {/* Handle account settings */}}
					>
						<View className="flex-row items-center">
							<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
								<Ionicons name="settings" size={20} color={theme.colors.primary.DEFAULT} />
							</View>
							<View>
								<Text className="font-medium">Account Settings</Text>
								<Muted>Manage your profile and subscription</Muted>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
					</TouchableOpacity>

					{renderDivider()}

					<TouchableOpacity 
						className="flex-row items-center justify-between py-3"
						onPress={() => {/* Handle data privacy */}}
					>
						<View className="flex-row items-center">
							<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
								<Ionicons name="lock-closed" size={20} color={theme.colors.primary.DEFAULT} />
							</View>
							<View>
								<Text className="font-medium">Privacy & Data</Text>
								<Muted>Manage your data and privacy settings</Muted>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
					</TouchableOpacity>

					{renderDivider()}

					<TouchableOpacity 
						className="flex-row items-center py-3"
						onPress={() => router.push("/(app)/sign-in")}
					>
						<View className="w-10 h-10 bg-red-500/10 rounded-full items-center justify-center mr-4">
							<Ionicons name="log-out" size={20} color="red" />
						</View>
						<Text className="font-medium text-red-500">Sign Out</Text>
					</TouchableOpacity>
				</View>

				{/* About Section */}
				<View className="mt-6 mb-12">
					{renderSectionHeader("About")}

					<TouchableOpacity 
						className="flex-row items-center justify-between py-3"
						onPress={() => {/* Handle about */}}
					>
						<View className="flex-row items-center">
							<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
								<Ionicons name="information-circle" size={20} color={theme.colors.primary.DEFAULT} />
							</View>
							<View>
								<Text className="font-medium">About Smart8Ball</Text>
								<Muted>Version 1.0.0</Muted>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
					</TouchableOpacity>

					{renderDivider()}

					<TouchableOpacity 
						className="flex-row items-center justify-between py-3"
						onPress={() => {/* Handle help */}}
					>
						<View className="flex-row items-center">
							<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
								<Ionicons name="help-circle" size={20} color={theme.colors.primary.DEFAULT} />
							</View>
							<View>
								<Text className="font-medium">Help & Support</Text>
								<Muted>Get assistance with app features</Muted>
							</View>
						</View>
						<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
}
