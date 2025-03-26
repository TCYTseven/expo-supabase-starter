import { Text, TextProps } from "./text";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";

export function H1({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn("text-3xl font-bold", className)}
      style={{ color: theme.colors.text.DEFAULT }}
      {...props}
    />
  );
}

export function H2({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn("text-2xl font-semibold", className)}
      style={{ color: theme.colors.text.DEFAULT }}
      {...props}
    />
  );
}

export function Muted({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn("text-sm", className)}
      style={{ color: theme.colors.text.muted }}
      {...props}
    />
  );
} 