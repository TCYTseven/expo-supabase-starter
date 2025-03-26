import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { Text } from "./text";
import { cn } from "@/lib/utils";

interface SuccessPopupProps {
	message: string;
	submessage?: string;
	onClose?: () => void;
}

export function SuccessPopup({ message, submessage, onClose }: SuccessPopupProps) {
	return (
		<Animated.View
			entering={FadeIn.duration(200)}
			exiting={FadeOut.duration(200)}
			className="absolute inset-0 flex items-center justify-center bg-black/50"
			onTouchEnd={onClose}
		>
			<View className="mx-4 w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
				<View className="items-center gap-2">
					<View className="rounded-full bg-green-100 p-3">
						<Text className="text-2xl">✓</Text>
					</View>
					<Text className="text-center text-lg font-semibold">{message}</Text>
					{submessage && (
						<Text className="text-center text-sm text-muted-foreground">
							{submessage}
						</Text>
					)}
				</View>
			</View>
		</Animated.View>
	);
} 