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
			.regex(
				/^(?=.*[a-z])/,
				"Your password must have at least one lowercase letter.",
			)
			.regex(
				/^(?=.*[A-Z])/,
				"Your password must have at least one uppercase letter.",
			)
			.regex(/^(?=.*[0-9])/, "Your password must have at least one number.")
			.regex(
				/^(?=.*[!@#$%^&*])/,
				"Your password must have at least one special character.",
			),
		confirmPassword: z.string().min(8, "Please enter at least 8 characters."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Your passwords do not match.",
		path: ["confirmPassword"],
	});

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
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormInput
										label="Password"
										placeholder="Create a secure password"
										autoCapitalize="none"
										autoCorrect={false}
										secureTextEntry
										labelIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.muted} />}
										className="rounded-xl bg-muted/30 border-0 px-4"
										{...field}
									/>
								)}
							/>
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
