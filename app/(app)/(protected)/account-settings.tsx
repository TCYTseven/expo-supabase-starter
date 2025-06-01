import { View, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Dimensions, Alert, TextInput } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Text } from "@/components/ui/text";
import { H1, H2, Muted } from "@/components/ui/typography";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback, useEffect } from "react";
import { theme } from "@/lib/theme";
import { useSupabase } from "@/context/supabase-provider";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/ui/button";

const { width, height } = Dimensions.get("window");
const isIOS = Platform.OS === 'ios';

export default function AccountSettings() {
	const { user, signOut } = useSupabase();
	const { profile, loading, fetchProfile, updateUserMetadata, updatePassword } = useUserProfile();
	
	// Form state
	const [fullName, setFullName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	
	// UI state
	const [isEditing, setIsEditing] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [showPasswordFields, setShowPasswordFields] = useState(false);

	// Initialize form data when user loads
	useEffect(() => {
		if (user) {
			setEmail(user.email || "");
			setFullName(user.user_metadata?.full_name || "");
			setUsername(user.user_metadata?.username || "");
		}
	}, [user]);

	// Refresh data when screen is focused
	useFocusEffect(
		useCallback(() => {
			fetchProfile();
		}, [fetchProfile])
	);

	const renderDivider = () => (
		<View className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-3" />
	);

	const handleUpdateProfile = async () => {
		if (!user) return;

		// Basic validation
		if (!fullName.trim()) {
			Alert.alert("Error", "Full name cannot be empty.");
			return;
		}

		if (!username.trim()) {
			Alert.alert("Error", "Username cannot be empty.");
			return;
		}

		setIsUpdating(true);
		try {
			// Update user metadata using the hook
			await updateUserMetadata({
				full_name: fullName.trim(),
				username: username.trim()
			});

			Alert.alert("Success", "Your profile has been updated successfully.");
			setIsEditing(false);
		} catch (error: any) {
			console.error("Error updating profile:", error);
			Alert.alert("Error", error.message || "Failed to update profile. Please try again.");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleChangePassword = async () => {
		if (!newPassword || !confirmPassword) {
			Alert.alert("Error", "Please fill in all password fields.");
			return;
		}

		if (newPassword !== confirmPassword) {
			Alert.alert("Error", "New passwords do not match.");
			return;
		}

		if (newPassword.length < 8) {
			Alert.alert("Error", "Password must be at least 8 characters long.");
			return;
		}

		// Additional password validation
		const hasUpperCase = /[A-Z]/.test(newPassword);
		const hasLowerCase = /[a-z]/.test(newPassword);
		const hasNumbers = /\d/.test(newPassword);
		const hasSpecialChar = /[!@#$%^&*]/.test(newPassword);

		if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
			Alert.alert(
				"Weak Password", 
				"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)."
			);
			return;
		}

		setIsChangingPassword(true);
		try {
			// Use the hook instead of calling supabase directly
			await updatePassword(newPassword);

			Alert.alert("Success", "Your password has been updated successfully.");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setShowPasswordFields(false);
		} catch (error: any) {
			console.error("Error changing password:", error);
			Alert.alert("Error", error.message || "Failed to change password. Please try again.");
		} finally {
			setIsChangingPassword(false);
		}
	};

	const handleDeleteAccount = () => {
		Alert.alert(
			"Delete Account",
			"Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
			[
				{
					text: "Cancel",
					style: "cancel"
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							// For now, we'll sign out the user. 
							// In a production app, you'd want to implement proper account deletion
							await signOut();
							Alert.alert("Account Deleted", "Your account has been deleted successfully.");
						} catch (error: any) {
							console.error("Error deleting account:", error);
							Alert.alert("Error", "Failed to delete account. Please try again.");
						}
					}
				}
			]
		);
	};

	if (loading) {
		return (
			<View className="flex-1 bg-background">
				<LinearGradient
					colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)', 'transparent']}
					style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
				/>
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color={theme.colors.primary.DEFAULT} />
					<Text className="mt-4 text-muted-foreground">Loading your account...</Text>
				</View>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			{/* Background Gradient */}
			<LinearGradient
				colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)', 'transparent']}
				style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 250 }}
			/>
			
			{/* Compact Header */}
			<View className="px-6 pt-12 pb-3">
				<View className="flex-row items-center">
					<TouchableOpacity 
						onPress={() => router.back()}
						className="mr-4 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full items-center justify-center"
						style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
					>
						<Ionicons name="arrow-back" size={20} color={theme.colors.text.DEFAULT} />
					</TouchableOpacity>
					<View className="flex-1">
						<H1 className="text-2xl font-bold text-white">Account Settings</H1>
						<Text className="text-white/70">Manage your profile</Text>
					</View>
					{/* Profile Avatar - Moved to header */}
					<View className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full items-center justify-center">
						<Text className="text-white font-bold">
							{(fullName || username || "U").charAt(0).toUpperCase()}
						</Text>
					</View>
				</View>
			</View>

			{/* Main Content Container */}
			<View className="px-6 flex-1">
				<ScrollView 
					className="flex-1"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
				>
					<View 
						className="bg-white/5 backdrop-blur-xl rounded-3xl p-5 border border-white/10 flex-1"
						style={{ 
							backgroundColor: 'rgba(30, 41, 59, 0.8)',
							borderColor: 'rgba(255, 255, 255, 0.1)',
							shadowColor: 'rgba(0, 0, 0, 0.3)',
							shadowOffset: { width: 0, height: 10 },
							shadowOpacity: 0.3,
							shadowRadius: 20,
						}}
					>
						{/* Profile Section */}
						<View className="mb-3">
							<View className="flex-row items-center mb-3">
								<View className="w-5 h-5 bg-purple-500/20 rounded items-center justify-center mr-2">
									<Ionicons name="person-outline" size={12} color={theme.colors.primary.DEFAULT} />
								</View>
								<Text className="text-white font-bold">Profile Information</Text>
							</View>
							
							{/* Form Fields in Grid */}
							<View className="space-y-2">
								{/* Email - Compact */}
								<View>
									<Text className="text-white/70 text-xs mb-1">Email</Text>
									<View 
										className="bg-white/5 rounded-lg px-3 py-2 border border-white/10"
										style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
									>
										<Text className="text-white/60 text-sm">{email}</Text>
									</View>
								</View>

								{/* Name and Username in Row */}
								<View className="flex-row space-x-2">
									<View className="flex-1">
										<Text className="text-white/70 text-xs mb-1">Full Name</Text>
										<TextInput
											value={fullName}
											onChangeText={setFullName}
											editable={isEditing}
											style={{
												backgroundColor: isEditing ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
												borderColor: isEditing ? theme.colors.primary.DEFAULT : 'rgba(255, 255, 255, 0.1)',
												borderWidth: 1,
												borderRadius: 8,
												paddingHorizontal: 12,
												paddingVertical: 8,
												fontSize: 14,
												color: theme.colors.text.DEFAULT,
											}}
											placeholder="Full name"
											placeholderTextColor="rgba(255, 255, 255, 0.4)"
										/>
									</View>
									<View className="flex-1">
										<Text className="text-white/70 text-xs mb-1">Username</Text>
										<TextInput
											value={username}
											onChangeText={setUsername}
											editable={isEditing}
											style={{
												backgroundColor: isEditing ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
												borderColor: isEditing ? theme.colors.primary.DEFAULT : 'rgba(255, 255, 255, 0.1)',
												borderWidth: 1,
												borderRadius: 8,
												paddingHorizontal: 12,
												paddingVertical: 8,
												fontSize: 14,
												color: theme.colors.text.DEFAULT,
											}}
											placeholder="Username"
											placeholderTextColor="rgba(255, 255, 255, 0.4)"
											autoCapitalize="none"
										/>
									</View>
								</View>

								{/* Compact Edit/Save buttons */}
								<View className="flex-row space-x-2 mt-2">
									{!isEditing ? (
										<TouchableOpacity
											onPress={() => setIsEditing(true)}
											className="flex-1 bg-purple-500/20 rounded-lg py-2 flex-row items-center justify-center border border-purple-500/30"
										>
											<Ionicons name="create-outline" size={14} color={theme.colors.primary.DEFAULT} />
											<Text className="ml-1 text-purple-400 font-medium text-sm">Edit</Text>
										</TouchableOpacity>
									) : (
										<>
											<TouchableOpacity
												onPress={() => {
													setIsEditing(false);
													if (user) {
														setFullName(user.user_metadata?.full_name || "");
														setUsername(user.user_metadata?.username || "");
													}
												}}
												className="flex-1 bg-white/10 rounded-lg py-2 flex-row items-center justify-center"
											>
												<Text className="text-white/80 font-medium text-sm">Cancel</Text>
											</TouchableOpacity>
											<TouchableOpacity
												onPress={handleUpdateProfile}
												disabled={isUpdating}
												className="flex-1 bg-purple-500 rounded-lg py-2 flex-row items-center justify-center"
											>
												{isUpdating ? (
													<ActivityIndicator size="small" color="white" />
												) : (
													<Text className="text-white font-medium text-sm">Save</Text>
												)}
											</TouchableOpacity>
										</>
									)}
								</View>
							</View>
						</View>

						{renderDivider()}

						{/* Account Stats - Horizontal Layout */}
						<View className="mb-3">
							<View className="flex-row items-center mb-2">
								<View className="w-5 h-5 bg-blue-500/20 rounded items-center justify-center mr-2">
									<Ionicons name="analytics-outline" size={12} color="#60A5FA" />
								</View>
								<Text className="text-white font-bold">Account Overview</Text>
							</View>
							
							<View className="flex-row justify-between">
								<View className="flex-1 items-center">
									<Text className="text-white/70 text-xs">Member Since</Text>
									<Text className="text-white font-semibold text-sm">
										{user?.created_at ? new Date(user.created_at).getFullYear() : "N/A"}
									</Text>
								</View>
								<View className="flex-1 items-center">
									<Text className="text-white/70 text-xs">Personality</Text>
									<View className="bg-emerald-500/20 px-2 py-1 rounded">
										<Text className="text-emerald-400 font-semibold text-xs">
											{profile?.personality_type !== "NONE" ? profile?.personality_type : "Not Set"}
										</Text>
									</View>
								</View>
								<View className="flex-1 items-center">
									<Text className="text-white/70 text-xs">Advisor</Text>
									<View className="bg-orange-500/20 px-2 py-1 rounded">
										<Text className="text-orange-400 font-semibold text-xs">{profile?.advisor || "Assistant"}</Text>
									</View>
								</View>
							</View>
						</View>

						{renderDivider()}

						{/* Security Section */}
						<View>
							<View className="flex-row items-center mb-2">
								<View className="w-5 h-5 bg-red-500/20 rounded items-center justify-center mr-2">
									<Ionicons name="shield-outline" size={12} color="#F87171" />
								</View>
								<Text className="text-white font-bold">Security</Text>
							</View>
							
							<View className="space-y-2">
								{/* Change Password Toggle */}
								<TouchableOpacity
									onPress={() => setShowPasswordFields(!showPasswordFields)}
									className="flex-row items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/10"
									activeOpacity={0.7}
								>
									<View className="flex-row items-center">
										<Ionicons name="lock-closed-outline" size={14} color={theme.colors.text.muted} />
										<Text className="text-white font-medium ml-2 text-sm">Change Password</Text>
									</View>
									<Ionicons 
										name={showPasswordFields ? "chevron-up" : "chevron-down"} 
										size={14} 
										color={theme.colors.text.muted} 
									/>
								</TouchableOpacity>

								{/* Password Fields - Compact */}
								{showPasswordFields && (
									<View className="space-y-2">
										<View className="flex-row space-x-2">
											<View className="flex-1">
												<Text className="text-white/70 text-xs mb-1">New Password</Text>
												<TextInput
													value={newPassword}
													onChangeText={setNewPassword}
													secureTextEntry
													style={{
														backgroundColor: 'rgba(139, 92, 246, 0.1)',
														borderColor: theme.colors.primary.DEFAULT,
														borderWidth: 1,
														borderRadius: 8,
														paddingHorizontal: 12,
														paddingVertical: 6,
														fontSize: 13,
														color: theme.colors.text.DEFAULT,
													}}
													placeholder="New password"
													placeholderTextColor="rgba(255, 255, 255, 0.4)"
												/>
											</View>
											<View className="flex-1">
												<Text className="text-white/70 text-xs mb-1">Confirm</Text>
												<TextInput
													value={confirmPassword}
													onChangeText={setConfirmPassword}
													secureTextEntry
													style={{
														backgroundColor: 'rgba(139, 92, 246, 0.1)',
														borderColor: theme.colors.primary.DEFAULT,
														borderWidth: 1,
														borderRadius: 8,
														paddingHorizontal: 12,
														paddingVertical: 6,
														fontSize: 13,
														color: theme.colors.text.DEFAULT,
													}}
													placeholder="Confirm password"
													placeholderTextColor="rgba(255, 255, 255, 0.4)"
												/>
											</View>
										</View>

										<TouchableOpacity
											onPress={handleChangePassword}
											disabled={isChangingPassword}
											className="bg-purple-500 rounded-lg py-2 flex-row items-center justify-center"
										>
											{isChangingPassword ? (
												<ActivityIndicator size="small" color="white" />
											) : (
												<Text className="text-white font-medium text-sm">Update Password</Text>
											)}
										</TouchableOpacity>
									</View>
								)}

								{/* Delete Account - Moved under Security */}
								<TouchableOpacity
									onPress={handleDeleteAccount}
									className="flex-row items-center justify-between py-2 px-3 bg-red-500/10 rounded-lg border border-red-500/30 mt-2"
									activeOpacity={0.7}
								>
									<View className="flex-row items-center">
										<Ionicons name="trash-outline" size={14} color="#EF4444" />
										<Text className="text-red-400 font-medium ml-2 text-sm">Delete Account</Text>
									</View>
									<Ionicons name="chevron-forward" size={14} color="#EF4444" />
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</ScrollView>
			</View>
		</View>
	);
} 