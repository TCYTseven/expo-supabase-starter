import { View, ScrollView, TouchableOpacity, StyleSheet, Text as RNText } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { theme } from "@/lib/theme";
import { useMemo } from "react";

// Custom background pattern component
const BackgroundPattern = () => {
	const dots = [];
	const rows = 20;
	const cols = 12;
	
	for (let i = 0; i < rows * cols; i++) {
		const row = Math.floor(i / cols);
		const col = i % cols;
		
		dots.push(
			<View 
				key={i}
				style={[
					styles.dot,
					{
						top: row * 40,
						left: col * 40,
						opacity: Math.random() * 0.5 + 0.1,
					}
				]}
			/>
		);
	}
	
	return <View style={styles.patternContainer}>{dots}</View>;
};

// Multiple Choice Illustration
const IllustrationBox = () => {
	return (
		<View style={styles.illustrationContainer}>
			{/* Main Card */}
			<View style={styles.card}>
				<View style={styles.cardRow}>
					<View style={styles.checkbox}>
						<View style={styles.checkmark} />
					</View>
					<View style={styles.cardTextContainer}>
						<View style={styles.cardTextLine} />
						<View style={styles.cardTextLineShort} />
					</View>
				</View>
				<View style={styles.cardRow}>
					<View style={styles.checkbox} />
					<View style={styles.cardTextContainer}>
						<View style={styles.cardTextLine} />
						<View style={styles.cardTextLineShort} />
					</View>
				</View>
				<View style={styles.cardRow}>
					<View style={styles.checkbox} />
					<View style={styles.cardTextContainer}>
						<View style={styles.cardTextLine} />
						<View style={styles.cardTextLineShort} />
					</View>
				</View>
			</View>
			
			{/* Character */}
			<View style={styles.characterContainer}>
				<View style={styles.characterHead} />
				<View style={styles.characterBody} />
			</View>
		</View>
	);
};

export default function Welcome() {
	return (
		<View style={styles.container}>
			<BackgroundPattern />
			<View style={styles.overlay}>
				<ScrollView contentContainerStyle={styles.scrollContainer}>
					<View style={styles.content}>
						<View style={styles.spacer} />
						
						<View style={styles.mainContent}>
							<View style={styles.logoContainer}>
								<H1 style={styles.title}>Smart8Ball</H1>
								<Muted style={styles.subtitle}>
									Your AI-powered decision-making companion
								</Muted>
							</View>
							
							<View style={styles.svgContainer}>
								<IllustrationBox />
							</View>

							<View style={styles.infoContainer}>
								<Text style={styles.infoTitle}>Get started</Text>
								<Text style={styles.infoText}>
									Make smarter decisions with AI-powered guidance and personalized insights
								</Text>
							</View>
						</View>

						<View style={styles.buttonContainer}>
							<TouchableOpacity
								style={[styles.button, styles.signupButton]}
								onPress={() => router.push("/(app)/sign-up")}
							>
								<Text style={styles.signupButtonText}>GET STARTED</Text>
							</TouchableOpacity>
							
							<View style={styles.loginTextContainer}>
								<Text style={styles.loginText}>Already have an account? </Text>
								<TouchableOpacity onPress={() => router.push("/(app)/sign-in")}>
									<Text style={styles.loginLink}>Login</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.background.DEFAULT,
	},
	patternContainer: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		zIndex: 0,
	},
	dot: {
		position: 'absolute',
		width: 4,
		height: 4,
		borderRadius: 2,
		backgroundColor: theme.colors.primary.light,
	},
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(15, 23, 42, 0.7)',
	},
	scrollContainer: {
		flexGrow: 1,
	},
	content: {
		flex: 1,
		padding: 24,
		justifyContent: 'space-between',
		paddingTop: theme.spacing.safeTop,
		paddingBottom: 40,
	},
	spacer: {
		flex: 0.3, // Pushes content down
	},
	mainContent: {
		flex: 1,
		justifyContent: 'center',
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
	title: {
		fontSize: 38,
		fontWeight: 'bold',
		color: theme.colors.text.DEFAULT,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 16,
		color: theme.colors.text.muted,
		textAlign: 'center',
		marginTop: 8,
	},
	svgContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 20,
		marginBottom: 20,
		height: 180, // Made smaller to fit better
	},
	illustrationContainer: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
	},
	card: {
		width: '90%',
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.2)',
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 5,
	},
	cardRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 6,
		borderWidth: 2,
		borderColor: theme.colors.primary.DEFAULT,
		marginRight: 12,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
	checkmark: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: theme.colors.primary.DEFAULT,
	},
	cardTextContainer: {
		flex: 1,
	},
	cardTextLine: {
		height: 10,
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
		borderRadius: 4,
		marginBottom: 4,
	},
	cardTextLineShort: {
		height: 8,
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
		borderRadius: 4,
		width: '70%',
	},
	characterContainer: {
		position: 'absolute',
		bottom: -20,
		right: 20,
		alignItems: 'center',
	},
	characterHead: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: theme.colors.primary.light,
		marginBottom: 2,
	},
	characterBody: {
		width: 40,
		height: 50,
		borderRadius: 10,
		backgroundColor: theme.colors.primary.DEFAULT,
	},
	infoContainer: {
		alignItems: 'center',
		marginBottom: 30,
		marginTop: 20,
	},
	infoTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: theme.colors.text.DEFAULT,
		marginBottom: 8,
	},
	infoText: {
		fontSize: 14,
		color: theme.colors.text.muted,
		textAlign: 'center',
		lineHeight: 20,
	},
	buttonContainer: {
		width: '100%',
		alignItems: 'center',
		marginTop: 20,
	},
	button: {
		width: '100%',
		height: 56,
		borderRadius: 28,
		justifyContent: 'center',
		alignItems: 'center',
	},
	signupButton: {
		backgroundColor: theme.colors.primary.DEFAULT,
	},
	signupButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	loginTextContainer: {
		flexDirection: 'row',
		marginTop: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	loginText: {
		color: theme.colors.text.muted,
		fontSize: 14,
	},
	loginLink: {
		color: theme.colors.primary.light,
		fontSize: 14,
		fontWeight: 'bold',
	},
});
