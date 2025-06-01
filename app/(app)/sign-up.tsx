import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View, TouchableOpacity, Dimensions, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import * as z from "zod";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { SuccessPopup } from "@/components/ui/success-popup";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";
import { theme } from "@/lib/theme";
import { router } from "expo-router";

const formSchema = z
	.object({
		email: z.string().email("Please enter a valid email address."),
		username: z.string().min(2, "Please enter at least 2 characters.").max(30, "Please enter fewer than 30 characters."),
		full_name: z.string().min(2, "Please enter at least 2 characters.").max(100, "Please enter fewer than 100 characters."),
		password: z
			.string()
			.min(8, "Please enter at least 8 characters.")
			.max(64, "Please enter fewer than 64 characters.")
			.regex(/^(?=.*[0-9])/, "Your password must have at least one number."),
		confirmPassword: z.string().min(8, "Please enter at least 8 characters."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Your passwords do not match.",
		path: ["confirmPassword"],
	});

// Password Requirements Tooltip Component
function PasswordRequirementsTooltip({ visible, onClose }: { visible: boolean; onClose: () => void }) {
	const requirements = [
		{
			text: "At least 8 characters",
			icon: "text-outline" as const,
		},
		{
			text: "At least one number (0-9)",
			icon: "calculator-outline" as const,
		},
	];

	if (!visible) return null;

	return (
		<>
			{/* Backdrop */}
			<TouchableOpacity 
				className="absolute inset-0 z-40" 
				onPress={onClose}
				activeOpacity={1}
			/>
			{/* Tooltip */}
			<Animated.View
				entering={FadeIn.duration(150)}
				exiting={FadeOut.duration(150)}
				className="absolute right-4 top-12 z-50 bg-background border border-border/50 rounded-xl p-4 shadow-lg min-w-64"
				style={{
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.15,
					shadowRadius: 12,
					elevation: 8,
				}}
			>
				<Text className="text-sm font-medium text-foreground mb-3">Password Requirements:</Text>
				<View className="space-y-2">
					{requirements.map((req, index) => (
						<View key={index} className="flex-row items-center space-x-3">
							<Ionicons 
								name={req.icon} 
								size={16} 
								color={theme.colors.text.muted}
							/>
							<Text className="text-sm text-muted-foreground flex-1">
								{req.text}
							</Text>
						</View>
					))}
				</View>
				{/* Small arrow pointing to the info icon */}
				<View className="absolute -top-1 right-4 w-2 h-2 bg-background border-l border-t border-border/50 transform rotate-45" />
			</Animated.View>
		</>
	);
}

// Error Popup Component
function ErrorPopup({ message, onClose }: { message: string; onClose: () => void }) {
	return (
		<Animated.View
			entering={FadeIn.duration(200)}
			exiting={FadeOut.duration(200)}
			className="absolute inset-0 flex items-center justify-center bg-black/50 z-50"
			onTouchEnd={onClose}
		>
			<View className="mx-4 w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
				<View className="items-center gap-3">
					<View className="rounded-full bg-red-100 p-3">
						<Ionicons name="alert-circle" size={32} color={theme.colors.destructive.DEFAULT} />
					</View>
					<Text className="text-center text-lg font-semibold">Sign Up Failed</Text>
					<Text className="text-center text-sm text-muted-foreground">
						{message}
					</Text>
					<Button
						size="sm"
						variant="default"
						className="mt-2 w-full"
						onPress={onClose}
					>
						<Text>Try Again</Text>
					</Button>
				</View>
			</View>
		</Animated.View>
	);
}

export default function SignUp() {
	const { signUp } = useSupabase();
	const [showSuccess, setShowSuccess] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [showError, setShowError] = useState(false);
	const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
	const { width, height } = Dimensions.get('window');
	const [keyboardVisible, setKeyboardVisible] = useState(false);

	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			'keyboardDidShow',
			() => {
				setKeyboardVisible(true);
			}
		);
		const keyboardDidHideListener = Keyboard.addListener(
			'keyboardDidHide',
			() => {
				setKeyboardVisible(false);
			}
		);

		return () => {
			keyboardDidShowListener.remove();
			keyboardDidHideListener.remove();
		};
	}, []);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			username: "",
			full_name: "",
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			console.log("Attempting to sign up with email:", data.email);
			const result = await signUp(data.email, data.password, {
				username: data.username,
				full_name: data.full_name,
			});
			console.log("Sign up result:", result);

			form.reset();
			setShowSuccess(true);
		} catch (error: Error | any) {
			console.log("Sign up error:", error);
			console.log("Error message:", error.message);
			console.log("Error details:", error.details);
			
			let displayMessage = "Unable to create account. Please try again.";
			
			if (error.message) {
				if (error.message.includes("email")) {
					displayMessage = "This email is already registered or invalid.";
				} else if (error.message.includes("rate limit")) {
					displayMessage = "Too many attempts. Please try again later.";
				} else {
					displayMessage = error.message;
				}
			}
			
			setErrorMessage(displayMessage);
			setShowError(true);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
			{/* Background gradient */}
			<View 
				className="absolute top-0 left-0 right-0 h-60 bg-primary/5 rounded-b-3xl"
				style={{ 
					borderBottomLeftRadius: 80, 
					borderBottomRightRadius: 80,
					...(keyboardVisible && { height: 20 })
				}}
			/>
			
			<KeyboardAvoidingView 
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={{ flex: 1 }}
				keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
			>
				<ScrollView 
					className="flex-1 px-6 pt-8"
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={{
						paddingBottom: 100
					}}
				>
					{/* Logo and header */}
					<View className={`items-center ${keyboardVisible ? 'mb-2' : 'mb-8'}`}>
						{!keyboardVisible && (
							<View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
								<Ionicons name="person-add" size={40} color={theme.colors.primary.DEFAULT} />
							</View>
						)}
						<H1 className="text-2xl text-center font-bold">Create an Account</H1>
						{!keyboardVisible && (
							<Text className="text-center text-muted-foreground mt-2">
								Sign up to get started with our app
							</Text>
						)}
					</View>

					{/* Form */}
					<Form {...form}>
						<View className="gap-6">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormInput
										label="Email"
										placeholder="Your email address"
										autoCapitalize="none"
										autoComplete="email"
										autoCorrect={false}
										keyboardType="email-address"
										labelIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.text.muted} />}
										className="rounded-xl bg-muted/30 border-0 px-4"
										{...field}
									/>
								)}
							/>
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormInput
										label="Nickname"
										placeholder="Enter your preferred name"
										autoCapitalize="none"
										autoCorrect={false}
										labelIcon={<Ionicons name="person-outline" size={20} color={theme.colors.text.muted} />}
										className="rounded-xl bg-muted/30 border-0 px-4"
										{...field}
									/>
								)}
							/>
							<FormField
								control={form.control}
								name="full_name"
								render={({ field }) => (
									<FormInput
										label="Full Name"
										placeholder="Enter your full name"
										autoCapitalize="words"
										autoCorrect={false}
										labelIcon={<Ionicons name="id-card-outline" size={20} color={theme.colors.text.muted} />}
										className="rounded-xl bg-muted/30 border-0 px-4"
										{...field}
									/>
								)}
							/>
							<View>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<View>
											{/* Password Label with Info Icon */}
											<View className="flex-row items-center justify-between mb-2">
												<View className="flex-row items-center">
													<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.muted} />
													<Text className="ml-2 text-sm font-medium text-foreground">Password</Text>
												</View>
												<TouchableOpacity
													onPress={() => setShowPasswordRequirements(!showPasswordRequirements)}
													className="p-1"
													hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
												>
													<Ionicons 
														name="information-circle-outline" 
														size={20} 
														color={theme.colors.text.muted} 
													/>
												</TouchableOpacity>
											</View>
											<FormInput
												placeholder="Create a secure password"
												autoCapitalize="none"
												autoCorrect={false}
												secureTextEntry
												className="rounded-xl bg-muted/30 border-0 px-4"
												{...field}
											/>
										</View>
									)}
								/>
								{/* Password Requirements Tooltip */}
								<PasswordRequirementsTooltip 
									visible={showPasswordRequirements} 
									onClose={() => setShowPasswordRequirements(false)} 
								/>
							</View>
							<FormField
								control={form.control}
								name="confirmPassword"
								render={({ field }) => (
									<FormInput
										label="Confirm Password"
										placeholder="Confirm your password"
										autoCapitalize="none"
										autoCorrect={false}
										secureTextEntry
										labelIcon={<Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.text.muted} />}
										className="rounded-xl bg-muted/30 border-0 px-4"
										{...field}
									/>
								)}
							/>
						</View>
					</Form>

					{/* Sign up button */}
					<Button
						size="lg"
						variant="default"
						onPress={form.handleSubmit(onSubmit)}
						disabled={form.formState.isSubmitting}
						className="rounded-xl h-14 mt-8"
					>
						{form.formState.isSubmitting ? (
							<ActivityIndicator color="#FFF" size="small" />
						) : (
							<Text className="font-semibold">Create Account</Text>
						)}
					</Button>

					{/* Sign in link */}
					<View className="flex-row justify-center mt-5 mb-8">
						<Text className="text-muted-foreground">Already have an account? </Text>
						<TouchableOpacity onPress={() => router.push('/sign-in')}>
							<Text className="text-primary font-medium">Sign In</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>

			{/* Success Popup */}
			{showSuccess && (
				<SuccessPopup
					message="Account created successfully!"
					submessage="Please check your email to verify your account."
					onClose={() => setShowSuccess(false)}
				/>
			)}

			{/* Error Popup */}
			{showError && errorMessage && (
				<ErrorPopup 
					message={errorMessage} 
					onClose={() => setShowError(false)} 
				/>
			)}
		</SafeAreaView>
	);
}
