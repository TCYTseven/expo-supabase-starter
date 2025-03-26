import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { SuccessPopup } from "@/components/ui/success-popup";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";
import { useState } from "react";

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

export default function SignUp() {
	const { signUp } = useSupabase();
	const [showSuccess, setShowSuccess] = useState(false);

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
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 web:m-4">
				<H1 className="self-start">Sign Up</H1>

				<Form {...form}>
					<View className="gap-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormInput
									label="Email"
									placeholder="Email"
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect={false}
									keyboardType="email-address"
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
									placeholder="Password"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
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
									placeholder="Confirm password"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
									{...field}
								/>
							)}
						/>
					</View>
				</Form>
			</View>
			<Button
				size="default"
				variant="default"
				onPress={form.handleSubmit(onSubmit)}
				disabled={form.formState.isSubmitting}
				className="web:m-4"
			>
				{form.formState.isSubmitting ? (
					<ActivityIndicator size="small" />
				) : (
					<Text>Sign Up</Text>
				)}
			</Button>

			{showSuccess && (
				<SuccessPopup
					message="Account created successfully!"
					submessage="Please check your email to verify your account."
					onClose={() => setShowSuccess(false)}
				/>
			)}
		</SafeAreaView>
	);
}
