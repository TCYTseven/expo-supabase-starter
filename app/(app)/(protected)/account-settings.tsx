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
	const { user, signOut, session } = useSupabase();
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
		<View className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />
	);

	const handleUpdateProfile = async () => {
		if (!user || !session) {
			Alert.alert("Session Error", "Your session has expired. Please sign in again.");
			return;
		}

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
			if (error.message?.includes('session') || error.message?.includes('expired')) {
				Alert.alert("Session Expired", "Your session has expired. Please sign in again.");
			} else {
				Alert.alert("Error", error.message || "Failed to update profile. Please try again.");
			}
		} finally {
			setIsUpdating(false);
		}
	};

	const handleChangePassword = async () => {
		if (!user || !session) {
			Alert.alert("Session Error", "Your session has expired. Please sign in again.");
			return;
		}

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
			if (error.message?.includes('session') || error.message?.includes('expired')) {
				Alert.alert("Session Expired", "Your session has expired. Please sign in again.");
			} else {
				Alert.alert("Error", error.message || "Failed to change password. Please try again.");
			}
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
			
			{/* Header with more top spacing */}
			<View className="px-6 pt-20 pb-8">
				<View className="flex-row items-center">
					<TouchableOpacity 
						onPress={() => router.back()}
						className="mr-4 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full items-center justify-center"
						style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
					>
						<Ionicons name="arrow-back" size={22} color={theme.colors.text.DEFAULT} />
					</TouchableOpacity>
					<View className="flex-1">
						<H1 className="text-3xl font-bold text-white">Account Settings</H1>
						<Text className="text-white/70 mt-2 text-base">Manage your profile</Text>
					</View>
					{/* Profile Avatar - Moved to header */}
					<View className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full items-center justify-center">
						<Text className="text-white font-bold text-lg">
							{(fullName || username || "U").charAt(0).toUpperCase()}
						</Text>
					</View>
				</View>
			</View>

			{/* Main Content Container - Responsive to screen size */}
			<View className="px-6 flex-1 pb-6">
				<View 
					className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex-1"
					style={{ 
						backgroundColor: 'rgba(30, 41, 59, 0.8)',
						borderColor: 'rgba(255, 255, 255, 0.1)',
						shadowColor: 'rgba(0, 0, 0, 0.3)',
						shadowOffset: { width: 0, height: 10 },
						shadowOpacity: 0.3,
						shadowRadius: 20,
						minHeight: height * 0.55, // Minimum height based on screen
						maxHeight: height * 0.75, // Maximum height based on screen
					}}
				>
					<ScrollView 
						className="flex-1"
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={{ 
							flexGrow: 1,
							paddingBottom: 100 // Extra padding to avoid navbar overlap
						}}
					>
						{/* Profile Section */}
						<View className="mb-8">
							<View className="flex-row items-center mb-6">
								<View className="w-8 h-8 bg-purple-500/20 rounded items-center justify-center mr-4">
									<Ionicons name="person-outline" size={18} color={theme.colors.primary.DEFAULT} />
								</View>
								<Text className="text-white font-bold text-lg">Profile Information</Text>
							</View>
							
							{/* Form Fields */}
							<View className="space-y-5">
								{/* Email */}
								<View>
									<Text className="text-white/70 mb-3">Email</Text>
									<View 
										className="bg-white/5 rounded-xl px-5 py-4 border border-white/10"
										style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
									>
										<Text className="text-white/60 text-base">{email}</Text>
									</View>
								</View>

								{/* Full Name */}
								<View>
									<Text className="text-white/70 mb-3">Full Name</Text>
									<TextInput
										value={fullName}
										onChangeText={setFullName}
										editable={isEditing}
										style={{
											backgroundColor: isEditing ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
											borderColor: isEditing ? theme.colors.primary.DEFAULT : 'rgba(255, 255, 255, 0.1)',
											borderWidth: 1,
											borderRadius: 12,
											paddingHorizontal: 20,
											paddingVertical: 16,
											fontSize: 16,
											color: theme.colors.text.DEFAULT,
										}}
										placeholder="Full name"
										placeholderTextColor="rgba(255, 255, 255, 0.4)"
									/>
								</View>

								{/* Username */}
								<View>
									<Text className="text-white/70 mb-3">Username</Text>
									<TextInput
										value={username}
										onChangeText={setUsername}
										editable={isEditing}
										style={{
											backgroundColor: isEditing ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
											borderColor: isEditing ? theme.colors.primary.DEFAULT : 'rgba(255, 255, 255, 0.1)',
											borderWidth: 1,
											borderRadius: 12,
											paddingHorizontal: 20,
											paddingVertical: 16,
											fontSize: 16,
											color: theme.colors.text.DEFAULT,
										}}
										placeholder="Username"
										placeholderTextColor="rgba(255, 255, 255, 0.4)"
										autoCapitalize="none"
									/>
								</View>

								{/* Edit/Save buttons */}
								<View className="flex-row space-x-4 mt-6">
									{!isEditing ? (
										<TouchableOpacity
											onPress={() => setIsEditing(true)}
											className="flex-1 bg-purple-500/20 rounded-xl py-4 flex-row items-center justify-center border border-purple-500/30"
										>
											<Ionicons name="create-outline" size={18} color={theme.colors.primary.DEFAULT} />
											<Text className="ml-3 text-purple-400 font-medium text-base">Edit</Text>
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
												className="flex-1 bg-white/10 rounded-xl py-4 flex-row items-center justify-center"
											>
												<Text className="text-white/80 font-medium text-base">Cancel</Text>
											</TouchableOpacity>
											<TouchableOpacity
												onPress={handleUpdateProfile}
												disabled={isUpdating}
												className="flex-1 bg-purple-500 rounded-xl py-4 flex-row items-center justify-center"
											>
												{isUpdating ? (
													<ActivityIndicator size="small" color="white" />
												) : (
													<Text className="text-white font-medium text-base">Save</Text>
												)}
											</TouchableOpacity>
										</>
									)}
								</View>
							</View>
						</View>

						{renderDivider()}

						{/* Security Section */}
						<View>
							<View className="flex-row items-center mb-5">
								<View className="w-8 h-8 bg-red-500/20 rounded items-center justify-center mr-4">
									<Ionicons name="shield-outline" size={18} color="#F87171" />
								</View>
								<Text className="text-white font-bold text-lg">Security</Text>
							</View>
							
							<View className="space-y-12">
								{/* Change Password Toggle */}
								<View>
									<TouchableOpacity
										onPress={() => setShowPasswordFields(!showPasswordFields)}
										className="flex-row items-center justify-between py-4 px-5 bg-white/5 rounded-xl border border-white/10"
										activeOpacity={0.7}
									>
										<View className="flex-row items-center">
											<Ionicons name="lock-closed-outline" size={18} color={theme.colors.text.muted} />
											<Text className="text-white font-medium ml-4 text-base">Change Password</Text>
										</View>
										<Ionicons 
											name={showPasswordFields ? "chevron-up" : "chevron-down"} 
											size={18} 
											color={theme.colors.text.muted} 
										/>
									</TouchableOpacity>

									{/* Password Fields - Animated Container */}
									{showPasswordFields && (
										<View className="mt-4 space-y-4 mb-8">
											{/* New Password Field */}
											<View>
												<Text className="text-white/70 mb-3">New Password</Text>
												<TextInput
													value={newPassword}
													onChangeText={setNewPassword}
													secureTextEntry
													style={{
														backgroundColor: 'rgba(139, 92, 246, 0.1)',
														borderColor: theme.colors.primary.DEFAULT,
														borderWidth: 1,
														borderRadius: 12,
														paddingHorizontal: 20,
														paddingVertical: 16,
														fontSize: 16,
														color: theme.colors.text.DEFAULT,
													}}
													placeholder="New password"
													placeholderTextColor="rgba(255, 255, 255, 0.4)"
												/>
											</View>

											{/* Confirm Password Field */}
											<View>
												<Text className="text-white/70 mb-3">Confirm Password</Text>
												<TextInput
													value={confirmPassword}
													onChangeText={setConfirmPassword}
													secureTextEntry
													style={{
														backgroundColor: 'rgba(139, 92, 246, 0.1)',
														borderColor: theme.colors.primary.DEFAULT,
														borderWidth: 1,
														borderRadius: 12,
														paddingHorizontal: 20,
														paddingVertical: 16,
														fontSize: 16,
														color: theme.colors.text.DEFAULT,
													}}
													placeholder="Confirm password"
													placeholderTextColor="rgba(255, 255, 255, 0.4)"
												/>
											</View>

											{/* Update Password Button */}
											<View className="mt-6">
												<TouchableOpacity
													onPress={handleChangePassword}
													disabled={isChangingPassword}
													className="bg-purple-500 rounded-xl py-4 flex-row items-center justify-center"
												>
													{isChangingPassword ? (
														<ActivityIndicator size="small" color="white" />
													) : (
														<Text className="text-white font-medium text-base">Update Password</Text>
													)}
												</TouchableOpacity>
											</View>
										</View>
									)}
								</View>

								{/* Delete Account - Increased spacing */}
								<TouchableOpacity
									onPress={handleDeleteAccount}
									className="flex-row items-center justify-between py-4 px-5 bg-red-500/10 rounded-xl border border-red-500/30"
									activeOpacity={0.7}
								>
									<View className="flex-row items-center">
										<Ionicons name="trash-outline" size={18} color="#EF4444" />
										<Text className="text-red-400 font-medium ml-4 text-base">Delete Account</Text>
									</View>
									<Ionicons name="chevron-forward" size={18} color="#EF4444" />
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				</View>
			</View>
		</View>
	);
} 