import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View, TouchableOpacity, Dimensions, Image, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from "react-native";
import * as z from "zod";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { ShakeAnimation, ShakeAnimationRef } from "@/components/ui/shake-animation";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";
import { theme } from "@/lib/theme";
import { router } from "expo-router";

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address."),
	password: z
		.string()
		.min(8, "Please enter at least 8 characters.")
		.max(64, "Please enter fewer than 64 characters."),
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
					<Text className="text-center text-lg font-semibold">Sign In Failed</Text>
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

export default function SignIn() {
	const { signInWithPassword } = useSupabase();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [showError, setShowError] = useState(false);
	const shakeRef = useRef<ShakeAnimationRef>(null);
	const { width } = Dimensions.get('window');
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
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			console.log("Attempting to sign in with email:", data.email);
			const result = await signInWithPassword(data.email, data.password);
			console.log("Sign in result:", result);
			form.reset();
			setErrorMessage(null);
		} catch (error: Error | any) {
			console.log("Sign in error:", error);
			console.log("Error message:", error.message);
			console.log("Error details:", error.details);
			
			let displayMessage = "Invalid email or password. Please try again.";
			
			if (error.message) {
				if (error.message.includes("credentials")) {
					displayMessage = "The email or password you entered is incorrect.";
				} else if (error.message.includes("rate limit")) {
					displayMessage = "Too many attempts. Please try again later.";
				} else {
					displayMessage = error.message;
				}
			}
			
			setErrorMessage(displayMessage);
			setShowError(true);
			shakeRef.current?.shake();
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
								<Ionicons name="person" size={40} color={theme.colors.primary.DEFAULT} />
							</View>
						)}
						<H1 className="text-2xl text-center font-bold">Welcome Back</H1>
						{!keyboardVisible && (
							<Text className="text-center text-muted-foreground mt-2">
								Sign in to continue to your account
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
								name="password"
								render={({ field }) => (
									<FormInput
										label="Password"
										placeholder="Your password"
										autoCapitalize="none"
										autoCorrect={false}
										secureTextEntry
										labelIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.muted} />}
										className="rounded-xl bg-muted/30 border-0 px-4"
										{...field}
									/>
								)}
							/>
						</View>
					</Form>

					{/* Forgot Password */}
					<TouchableOpacity className="mt-2 self-end" onPress={() => {}}>
						<Text className="text-primary font-medium text-sm">Forgot Password?</Text>
					</TouchableOpacity>

					{/* Sign in button */}
					<ShakeAnimation ref={shakeRef} className="mt-8">
						<Button
							size="lg"
							variant="default"
							onPress={form.handleSubmit(onSubmit)}
							disabled={form.formState.isSubmitting}
							className="rounded-xl h-14"
						>
							{form.formState.isSubmitting ? (
								<ActivityIndicator color="#FFF" size="small" />
							) : (
								<Text className="font-semibold">Sign In</Text>
							)}
						</Button>
					</ShakeAnimation>

					{/* Sign up link */}
					<View className="flex-row justify-center mt-5">
						<Text className="text-muted-foreground">Don't have an account? </Text>
						<TouchableOpacity onPress={() => router.push('/sign-up')}>
							<Text className="text-primary font-medium">Sign Up</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>

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
