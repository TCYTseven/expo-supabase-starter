import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";

export interface TextProps extends RNTextProps {
	variant?: "default" | "muted" | "primary";
}

export function Text({ className, variant = "default", ...props }: TextProps) {
	const variantStyles = {
		default: { color: theme.colors.text.DEFAULT },
		muted: { color: theme.colors.text.muted },
		primary: { color: theme.colors.text.primary },
	};

	return (
		<RNText
			className={cn("text-base", className)}
			style={variantStyles[variant]}
			{...props}
		/>
	);
}
