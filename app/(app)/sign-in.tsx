import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { ShakeAnimation, ShakeAnimationRef } from "@/components/ui/shake-animation";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";
import { useState, useRef } from "react";

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address."),
	password: z
		.string()
		.min(8, "Please enter at least 8 characters.")
		.max(64, "Please enter fewer than 64 characters."),
});

export default function SignIn() {
	const { signInWithPassword } = useSupabase();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const shakeRef = useRef<ShakeAnimationRef>(null);

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
			setErrorMessage(error.message || "Invalid email or password");
			shakeRef.current?.shake();
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 web:m-4">
				<H1 className="self-start">Sign In</H1>
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
					</View>
				</Form>
			</View>
			<ShakeAnimation ref={shakeRef}>
				<View className="web:m-4">
					<Button
						size="default"
						variant="default"
						onPress={form.handleSubmit(onSubmit)}
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? (
							<ActivityIndicator size="small" />
						) : (
							<Text>Sign In</Text>
						)}
					</Button>
					{errorMessage && (
						<Text className="mt-2 text-center text-sm text-destructive">
							{errorMessage}
						</Text>
					)}
				</View>
			</ShakeAnimation>
		</SafeAreaView>
	);
}
