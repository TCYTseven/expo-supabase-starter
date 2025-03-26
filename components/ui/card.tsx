import { View, ViewProps } from "react-native";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-xl border border-border shadow-sm",
        className
      )}
      style={{
        backgroundColor: theme.colors.background.card,
        borderColor: theme.colors.border,
      }}
      {...props}
    >
      {children}
    </View>
  );
} 