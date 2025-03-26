import { View, ScrollView } from "react-native";
import { H1, Muted } from "@/components/ui/typography";
import { theme } from "@/lib/theme";
import { Card } from "@/components/ui/card";

export default function Analytics() {
  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background.DEFAULT }}>
      <ScrollView 
        className="flex-1" 
        style={{ paddingTop: theme.spacing.safeTop }}
        contentContainerStyle={{ paddingBottom: 100 }} // Space for bottom nav
      >
        <View className="p-6 space-y-8">
          <View>
            <H1 className="text-2xl font-bold">
              Analytics
            </H1>
            <Muted>
              Track your decision progress
            </Muted>
          </View>
          
          <Card className="p-6">
            <Muted>
              Analytics content coming soon
            </Muted>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
} 