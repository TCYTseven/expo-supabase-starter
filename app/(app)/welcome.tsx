import { View, ScrollView, TouchableOpacity, StyleSheet, Text as RNText, Platform, Animated, Easing } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { theme } from "@/lib/theme";
import { useMemo, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";

// Custom background pattern component
const BackgroundPattern = () => {
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const moveAnim = useRef(new Animated.Value(0)).current;
	
	useEffect(() => {
		// Continuous smooth fade animation using infinite loop
		Animated.loop(
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 3600,
				easing: Easing.inOut(Easing.sin),
				useNativeDriver: true,
			}), 
			{ iterations: -1 } // Infinite iterations
		).start();
		
		// Continuous smooth movement animation using infinite loop
		Animated.loop(
			Animated.timing(moveAnim, {
				toValue: 1,
				duration: 6000,
				easing: Easing.inOut(Easing.sin),
				useNativeDriver: true,
			}),
			{ iterations: -1 } // Infinite iterations
		).start();
		
	}, [fadeAnim, moveAnim]);
	
	const dots = [];
	const rows = 20;
	const cols = 12;
	
	for (let i = 0; i < rows * cols; i++) {
		const row = Math.floor(i / cols);
		const col = i % cols;
		const isEven = (row + col) % 2 === 0;
		const offset = ((row * col) % 10) / 10; // Phase offset for staggered animation
		
		dots.push(
			<Animated.View 
				key={i}
				style={[
					styles.dot,
					{
						top: row * 40,
						left: col * 40,
						opacity: fadeAnim.interpolate({
							inputRange: [0, 0.5, 1],
							outputRange: [0.05, isEven ? 0.6 : 0.8, 0.05], // Create a full sine wave pattern
						}),
						transform: [{ 
							translateY: moveAnim.interpolate({
								inputRange: [0, 0.5, 1],
								outputRange: [0, isEven ? 12 : -12, 0], // Create a full sine wave pattern
							})
						}]
					}
				]}
			/>
		);
	}
	
	return <View style={styles.patternContainer}>{dots}</View>;
};

// Multiple Choice Illustration
const IllustrationBox = () => {
	const animValue = useRef(new Animated.Value(0)).current;
	
	useEffect(() => {
		// Single continuous animation using infinite loop
		Animated.loop(
			Animated.timing(animValue, {
				toValue: 1,
				duration: 3000, 
				easing: Easing.inOut(Easing.sin),
				useNativeDriver: true,
			}),
			{ iterations: -1 } // Infinite iterations
		).start();
	}, [animValue]);
	
	// Use interpolation to create different effects from a single animation value
	const scale = animValue.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: [1, 1.08, 1], // Full cycle for smooth loop
	});
	
	const rotation = animValue.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: ['0deg', '1deg', '0deg'], // Full cycle for smooth loop
	});
	
	return (
		<View style={styles.illustrationContainer}>
			{/* Main Card with animation */}
			<Animated.View style={[
				styles.card,
				{
					transform: [
						{ scale: scale },
						{ rotate: rotation }
					],
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 8 },
					shadowOpacity: 0.4,
					shadowRadius: 16,
					elevation: 10,
				}
			]}>
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
			</Animated.View>
			
			{/* Character */}
			<View style={styles.characterContainer}>
				<View style={styles.characterHead} />
				<View style={styles.characterBody} />
			</View>
		</View>
	);
};

export default function Welcome() {
	const mainAnim = useRef(new Animated.Value(0)).current;
	
	useEffect(() => {
		// Single continuous animation for all effects using infinite loop
		Animated.loop(
			Animated.timing(mainAnim, {
				toValue: 1,
				duration: 8000,
				easing: Easing.inOut(Easing.sin),
				useNativeDriver: false, // Required for some interpolations
			}),
			{ iterations: -1 } // Infinite iterations
		).start();
	}, [mainAnim]);
	
	// Create separate interpolations for different effects from a single animation
	const gradientOpacity = mainAnim.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: [0.3, 0.7, 0.3], // Full cycle for smooth loop
	});
	
	const contentTranslateY = mainAnim.interpolate({
		inputRange: [0, 0.5, 1],
		outputRange: [0, -8, 0], // Full cycle for smooth loop
	});
	
	return (
		<View style={styles.container}>
			<BackgroundPattern />
			<Animated.View 
				style={{ 
					position: 'absolute', 
					top: 0, 
					left: 0, 
					right: 0, 
					height: 300,
					opacity: gradientOpacity
				}}
			>
				<LinearGradient
					colors={['rgba(139, 92, 246, 1)', 'transparent']}
					style={{ width: '100%', height: '100%' }}
				/>
			</Animated.View>
			<View style={styles.overlay}>
				<ScrollView contentContainerStyle={styles.scrollContainer}>
					<Animated.View 
						style={[
							styles.content,
							{ transform: [{ translateY: contentTranslateY }] }
						]}
					>
						<View style={styles.spacer} />
						
						<View style={styles.mainContent}>
							<View style={styles.logoContainer}>
								<View style={[styles.titleWrapper, { marginTop: 20 }]}>
									<H1 style={[styles.title, { marginTop: 20 }]}>smart 8 ball</H1>
								</View>
								<Muted style={styles.subtitle}>
									Your AI-powered decision-making companion
								</Muted>
							</View>
							
							<View style={styles.svgContainer}>
								<IllustrationBox />
							</View>

							<View style={styles.infoContainer}>
								<Text style={styles.infoTitle}>Start smarter.</Text>
								<Text style={styles.infoText}>
									Get personalized insights and guidance to make confident decisions.
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
					</Animated.View>
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#08101E',
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
		backgroundColor: 'rgba(8, 16, 30, 0.8)',
	},
	scrollContainer: {
		flexGrow: 1,
	},
	content: {
		flex: 1,
		padding: 24,
		justifyContent: 'space-between',
		paddingTop: Platform.OS === 'ios' ? 50 : 30,
		paddingBottom: 40,
	},
	spacer: {
		flex: 0.2,
	},
	mainContent: {
		flex: 1,
		justifyContent: 'center',
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 20,
		paddingTop: 15,
	},
	titleWrapper: {
		paddingVertical: 10,
	},
	title: {
		fontSize: 33,
		fontWeight: '800',
		color: theme.colors.text.DEFAULT,
		textAlign: 'center',
		includeFontPadding: true,
		textAlignVertical: 'center',
		letterSpacing: 0.5,
		textShadowColor: 'rgba(0, 0, 0, 0.3)',
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
		transform: [{ translateY: 5 }],
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
		height: 180,
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
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.35,
		shadowRadius: 16,
		elevation: 10,
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
		fontSize: 22,
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
		fontWeight: '500',
	},
});
