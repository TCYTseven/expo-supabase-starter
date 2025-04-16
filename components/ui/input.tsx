import * as React from "react";
import { TextInput, View } from "react-native";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
	leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<
	React.ElementRef<typeof TextInput>,
	InputProps
>(({ className, placeholderClassName, leftIcon, style, ...props }, ref) => {
	return (
		<View className="relative w-full">
			{leftIcon && (
				<View className="absolute left-4 top-0 bottom-0 z-10 flex justify-center">
					{leftIcon}
				</View>
			)}
			<TextInput
				ref={ref}
				className={cn(
					"web:flex h-10 native:h-14 w-full rounded-md border border-input bg-background px-4 web:py-2 text-base lg:text-sm native:text-base text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
					props.editable === false && "opacity-50 web:cursor-not-allowed",
					leftIcon && "pl-16",
					className,
				)}
				placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
				style={[
					style,
				]}
				{...props}
			/>
		</View>
	);
});

Input.displayName = "Input";

export { Input };
