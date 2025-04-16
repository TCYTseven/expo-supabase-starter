import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { theme } from "@/lib/theme";
import { useSupabase } from "@/context/supabase-provider";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { getAdvisorPrompt } from "@/lib/advisorService";

// Advisor display names mapping
const advisorNames = {
	"rocky": "Rocky Balboa",
	"iroh": "Uncle Iroh",
	"goggins": "David Goggins",
	"assistant": "Assistant",
};

// Personality type descriptions
const personalityDescriptions = {
	"INTJ": "The Architect",
	"INTP": "The Logician",
	"ENTJ": "The Commander",
	"ENTP": "The Debater",
	"ISFJ": "The Defender",
	"ISTJ": "The Inspector",
	"ENFJ": "The Protagonist",
	"ENFP": "The Campaigner",
	// Add more as needed
};

export default function Settings() {
	const { signOut } = useSupabase();
	const { profile, loading, error, fetchProfile } = useUserProfile();

	// Refresh profile data when screen is focused, but only if needed
	useFocusEffect(
		useCallback(() => {
			// Add a small delay to prevent immediate fetching
			const timer = setTimeout(() => {
				fetchProfile();
			}, 300);
			
			return () => clearTimeout(timer);
		}, [fetchProfile])
	);

	const renderDivider = () => (
		<View className="h-px bg-border/50 my-4" />
	);

	const renderSectionHeader = (title: string) => (
		<Text className="font-bold text-lg mb-4">{title}</Text>
	);

	// Get personality description or fallback
	const getPersonalityDescription = () => {
		if (!profile || profile.personality_type === "NONE") {
			return "Not Set";
		}

		return `${profile.personality_type} - ${personalityDescriptions[profile.personality_type as keyof typeof personalityDescriptions] || ""}`;
	};

	// Get advisor name or fallback
	const getAdvisorName = () => {
		if (!profile || profile.advisor === "Not Set") {
			return "Assistant";
		}

		// For custom advisors, extract the name from the custom_advisors data
		if (profile.advisor && profile.advisor.toString().includes("custom_") || 
		    profile.advisor && /^[a-z0-9]{10,}$/i.test(profile.advisor)) { // Match both "custom_" and random IDs
			if (profile.custom_advisors && profile.custom_advisors !== "Not Set") {
				try {
					// Parse the custom advisor data
					let allAdvisors;
					if (typeof profile.custom_advisors === 'string') {
						allAdvisors = JSON.parse(profile.custom_advisors);
					} else {
						allAdvisors = profile.custom_advisors;
					}
					
					// Check if we have an array of advisors (new format)
					if (Array.isArray(allAdvisors)) {
						// Find the advisor that matches the ID in profile.advisor directly
						let selectedAdvisor = allAdvisors.find(advisor => 
							advisor.id === profile.advisor || 
							`custom_${advisor.id}` === profile.advisor
						);
						
						// If not found, do a fallback fuzzy match (handle when IDs are different formats)
						if (!selectedAdvisor && profile.advisor) {
							// Try to get just the last part of both IDs for comparison
							const shortAdvisorId = profile.advisor.split('_').pop() || profile.advisor;
							selectedAdvisor = allAdvisors.find(advisor => 
								advisor.id.includes(shortAdvisorId) || 
								shortAdvisorId.includes(advisor.id)
							);
						}
						
						if (selectedAdvisor) {
							return selectedAdvisor.raw?.name || "Custom Advisor";
						} else {
							// Try to find any advisor with a name if we couldn't match by ID
							const firstAdvisor = allAdvisors[0];
							if (firstAdvisor && firstAdvisor.raw?.name) {
								return firstAdvisor.raw.name;
							}
						}
					} else {
						// Legacy format - single advisor
						// Get the name from raw data
						if (allAdvisors.raw && allAdvisors.raw.name) {
							return allAdvisors.raw.name;
						}
						
						// Alternative: check direct properties if not in raw
						if (allAdvisors.name) {
							return allAdvisors.name;
						}
					}
				} catch (e) {
					console.error("Error parsing custom advisor data:", e);
				}
			}
			return "Custom Advisor"; // Fallback if we can't get the name
		}

		// Handle built-in advisors
		if (advisorNames[profile.advisor as keyof typeof advisorNames]) {
			return advisorNames[profile.advisor as keyof typeof advisorNames];
		}

		// If nothing else works, display in a more user-friendly format
		return "Custom Advisor";
	};

	// Check if custom advisor data exists
	const hasCustomAdvisor = profile?.custom_advisors && 
		profile.custom_advisors !== "Not Set";

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
							<Text className="font-medium">Build New Advisor</Text>
							<Muted>Create a new personalized advisor (cannot edit existing)</Muted>
						</View>
					</View>
					<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
				</TouchableOpacity>

				{renderDivider()}

				<TouchableOpacity 
					className="flex-row items-center justify-between py-3"
					onPress={() => router.push("/(app)/(protected)/view-custom-advisors" as any)}
				>
					<View className="flex-row items-center">
						<View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
							<Ionicons name="people" size={20} color={theme.colors.primary.DEFAULT} />
						</View>
						<View>
							<Text className="font-medium">View Custom Advisors</Text>
							<Muted>See all the custom advisors you've created</Muted>
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
								{loading ? (
									<ActivityIndicator size="small" />
								) : (
									<Text>{getPersonalityDescription()}</Text>
								)}
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
								{loading ? (
									<ActivityIndicator size="small" />
								) : (
									<Text>{getAdvisorName()}</Text>
								)}
							</View>
						</View>
					</View>
					<Ionicons name="chevron-forward" size={20} color={theme.colors.text.muted} />
				</TouchableOpacity>

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
						onPress={async () => {
							try {
								await signOut();
								router.replace("/(app)/welcome");
							} catch (error) {
								console.error("Error signing out:", error);
							}
						}}
					>
						<View className="w-10 h-10 bg-red-500/10 rounded-full items-center justify-center mr-4">
							<Ionicons name="log-out" size={20} color="red" />
						</View>
						<Text className="font-medium text-red-500">Sign Out</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
}
