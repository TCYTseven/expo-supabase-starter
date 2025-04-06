import { View, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { theme } from "@/lib/theme";

export default function Welcome() {
	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View style={styles.content}>
				<View style={styles.logoContainer}>
					<Text style={styles.emoji}>🎱</Text>
					<H1 style={styles.title}>Smart8Ball</H1>
					<Muted style={styles.subtitle}>
						Your AI-powered decision-making companion
					</Muted>
				</View>

				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={[styles.button, styles.loginButton]}
						onPress={() => router.push("/(app)/sign-in")}
					>
						<Text style={styles.loginButtonText}>LOG IN</Text>
					</TouchableOpacity>
					
					<TouchableOpacity
						style={[styles.button, styles.signupButton]}
						onPress={() => router.push("/(app)/sign-up")}
					>
						<Text style={styles.signupButtonText}>SIGN UP</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: theme.colors.background.DEFAULT,
	},
	content: {
		flex: 1,
		padding: 24,
		justifyContent: 'space-between',
		paddingTop: theme.spacing.safeTop + 60,
		paddingBottom: 40,
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 60,
	},
	emoji: {
		fontSize: 80,
		marginBottom: 20,
	},
	title: {
		fontSize: 42,
		fontWeight: 'bold',
		color: theme.colors.text.DEFAULT,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 18,
		color: theme.colors.text.muted,
		textAlign: 'center',
		marginTop: 12,
	},
	buttonContainer: {
		width: '100%',
		gap: 16,
		marginTop: 'auto',
	},
	button: {
		width: '100%',
		height: 56,
		borderRadius: 28,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loginButton: {
		backgroundColor: theme.colors.primary.DEFAULT,
	},
	loginButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	signupButton: {
		backgroundColor: 'white',
		borderWidth: 1,
		borderColor: theme.colors.border,
	},
	signupButtonText: {
		color: theme.colors.primary.DEFAULT,
		fontSize: 16,
		fontWeight: 'bold',
	},
});
