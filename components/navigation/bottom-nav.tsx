import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { theme } from "@/lib/theme";

type NavItem = {
  label: string;
  icon: typeof Ionicons extends React.ComponentType<infer T> ? T extends { name: infer K } ? K : never : never;
  activeIcon: typeof Ionicons extends React.ComponentType<infer T> ? T extends { name: infer K } ? K : never : never;
  route: string;
};

const navItems: NavItem[] = [
  {
    label: "Home",
    icon: "home-outline" as const, 
    activeIcon: "home" as const,
    route: "/(app)/(protected)",
  },
  {
    label: "Decide",
    icon: "navigate-outline" as const, 
    activeIcon: "navigate" as const,
    route: "/(app)/(protected)/new-decision",
  },
  {
    label: "History",
    icon: "time-outline" as const,
    activeIcon: "time" as const,
    route: "/(app)/(protected)/history",
  },
  {
    label: "Settings",
    icon: "settings-outline" as const,
    activeIcon: "settings" as const,
    route: "/(app)/(protected)/settings",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = pathname === item.route || 
                         (item.route === "/(app)/(protected)" && pathname === "/(app)/(protected)/index");
        return (
          <TouchableOpacity
            key={item.label}
            style={styles.tab}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[
              styles.iconContainer,
              isActive && styles.activeIconContainer
            ]}>
              <Ionicons 
                name={isActive ? item.activeIcon : item.icon}
                size={22} 
                color={isActive ? theme.colors.primary.DEFAULT : theme.colors.text.muted} 
              />
            </View>
            <Text
              className="text-xs"
              style={{ 
                color: isActive ? theme.colors.primary.DEFAULT : theme.colors.text.muted,
                fontWeight: isActive ? '600' : '400',
                marginTop: 2,
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: theme.colors.background.DEFAULT,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 34, // Safe area for iPhone
    paddingTop: 10,
    paddingHorizontal: 10,
  } as ViewStyle,
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  } as ViewStyle,
  activeIconContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  } as ViewStyle,
}); 