import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";
import { BottomNav } from "@/components/navigation/bottom-nav";

export default function ProtectedLayout() {
	return (
		<View style={{ flex: 1 }}>
			<Stack screenOptions={{ headerShown: false }} />
			<BottomNav />
		</View>
	);
}
