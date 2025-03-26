import { View } from "react-native";
import Animated, { 
	useAnimatedStyle, 
	withSequence, 
	withTiming, 
	useSharedValue, 
	withDelay,
	runOnJS
} from "react-native-reanimated";
import { forwardRef, useImperativeHandle } from "react";

interface ShakeAnimationProps {
	children: React.ReactNode;
	onShakeComplete?: () => void;
}

export interface ShakeAnimationRef {
	shake: () => void;
}

export const ShakeAnimation = forwardRef<ShakeAnimationRef, ShakeAnimationProps>(
	({ children, onShakeComplete }, ref) => {
		const translateX = useSharedValue(0);

		const shake = () => {
			translateX.value = withSequence(
				withTiming(-10, { duration: 50 }),
				withTiming(10, { duration: 50 }),
				withTiming(-10, { duration: 50 }),
				withTiming(10, { duration: 50 }),
				withTiming(-10, { duration: 50 }),
				withTiming(10, { duration: 50 }),
				withTiming(0, { duration: 50 }, () => {
					if (onShakeComplete) {
						runOnJS(onShakeComplete)();
					}
				})
			);
		};

		useImperativeHandle(ref, () => ({
			shake
		}));

		const animatedStyle = useAnimatedStyle(() => ({
			transform: [{ translateX: translateX.value }],
		}));

		return (
			<Animated.View style={animatedStyle}>
				{children}
			</Animated.View>
		);
	}
);

ShakeAnimation.displayName = "ShakeAnimation"; 