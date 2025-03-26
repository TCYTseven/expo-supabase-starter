import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";

interface ButtonProps extends TouchableOpacityProps {
	variant?: "default" | "outline" | "ghost";
	size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
	className,
	variant = "default",
	size = "default",
	children,
	...props
}: ButtonProps) {
	const baseStyles = "rounded-lg items-center justify-center";
	const variantStyles = {
		default: "bg-primary",
		outline: "border border-border",
		ghost: "bg-transparent",
	};

	const sizeStyles = {
		default: "px-4 py-2",
		sm: "px-3 py-1",
		lg: "px-6 py-3",
		icon: "p-2",
	};

	return (
		<TouchableOpacity
			className={cn(
				baseStyles,
				variantStyles[variant],
				sizeStyles[size],
				className
			)}
			style={{
				borderColor: theme.colors.border,
			}}
			{...props}
		>
			{children}
		</TouchableOpacity>
	);
}
