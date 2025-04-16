import { useState, useEffect } from 'react';
import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/config/supabase';

// Simple ID generator for React Native environment
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
};

export type UserProfile = {
  id: string;
  personality_type: string;
  advisor: string;
  custom_advisors: string; // This will now store an array of advisors
  created_at: string;
  updated_at: string;
};

// Type for a single custom advisor
export type CustomAdvisor = {
  id: string;
  raw: any;
  prompt: string;
  created_at: string;
}

export function useUserProfile() {
  const { session, user } = useSupabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState(0);

  // Fetch the user's profile
  const fetchProfile = async () => {
    try {
      // Don't try to refresh more than once every 2 seconds
      const now = Date.now();
      if (now - lastRefreshAttempt < 2000) {
        return;
      }
      setLastRefreshAttempt(now);
      
      setLoading(true);
      setError(null);
      
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          // If the profile doesn't exist, create it
          if (error.code === 'PGRST116') { // PostgreSQL error for "no rows returned"
            try {
              const { data: newProfile, error: insertError } = await supabase
                .from('user_profiles')
                .insert([{ 
                  id: user.id,
                  personality_type: "NONE",
                  advisor: "Assistant",
                  custom_advisors: JSON.stringify([]) // Initialize with empty array
                }])
                .select()
                .single();
              
              if (insertError) {
                throw insertError;
              }
              
              setProfile(newProfile);
              return;
            } catch (insertErr) {
              // If insert fails, use cached profile if available
              if (profile) {
                console.warn('Using cached profile due to network error');
                return;
              }
              throw insertErr;
            }
          } else {
            // If there's another error but we have a cached profile, keep using it
            if (profile) {
              console.warn('Using cached profile due to fetch error');
              return;
            }
            throw error;
          }
        }

        setProfile(data);
      } catch (fetchErr) {
        // Network error but we have a cached profile
        if (profile) {
          console.warn('Network error but using cached profile', fetchErr);
          return;
        }
        throw fetchErr;
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err);
      
      // If we have a network error and no profile, create a default profile in memory
      if (!profile && user && err.message?.includes('Network request failed')) {
        console.warn('Creating fallback profile due to network error');
        setProfile({
          id: user.id,
          personality_type: "NONE",
          advisor: "Assistant",
          custom_advisors: JSON.stringify([]),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the user's personality type
  const updatePersonalityType = async (personalityType: string) => {
    try {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          personality_type: personalityType,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error updating personality type:', err);
      throw err;
    }
  };

  // Update the user's advisor
  const updateAdvisor = async (advisor: string) => {
    try {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          advisor,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error updating advisor:', err);
      throw err;
    }
  };

  // Add a new custom advisor to the user's profile
  const addCustomAdvisor = async (advisorData: any, advisorPrompt: string) => {
    try {
      if (!user) return null;

      // Get current custom advisors
      let currentAdvisors: CustomAdvisor[] = [];
      
      if (profile?.custom_advisors) {
        try {
          if (profile.custom_advisors === "Not Set") {
            currentAdvisors = [];
          } else if (typeof profile.custom_advisors === 'string') {
            const parsed = JSON.parse(profile.custom_advisors);
            // Handle the case where it might not be an array yet (legacy data)
            if (Array.isArray(parsed)) {
              currentAdvisors = parsed;
            } else {
              // If it's the old format with a single advisor, create an array with it
              currentAdvisors = [{
                id: generateId(),
                raw: parsed.raw || parsed,
                prompt: parsed.prompt || getPromptFromLegacyData(parsed),
                created_at: new Date().toISOString()
              }];
            }
          }
        } catch (e) {
          console.error('Error parsing current advisors:', e);
          currentAdvisors = [];
        }
      }

      // Create new advisor with unique ID
      const newAdvisor: CustomAdvisor = {
        id: generateId(),
        raw: advisorData,
        prompt: advisorPrompt,
        created_at: new Date().toISOString()
      };

      // Add new advisor to the list
      const updatedAdvisors = [...currentAdvisors, newAdvisor];

      // Update the profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          custom_advisors: JSON.stringify(updatedAdvisors),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return {
        success: true,
        advisorId: newAdvisor.id
      };
    } catch (err: any) {
      console.error('Error adding custom advisor:', err);
      throw err;
    }
  };

  // Get a prompt from legacy data format
  const getPromptFromLegacyData = (data: any): string => {
    if (data.name) {
      return `I am ${data.name}, your personal advisor. I will provide advice based on your needs.`;
    }
    return "I am your personal advisor. How can I help you?";
  };

  // Get all custom advisors as an array
  const getCustomAdvisors = (): CustomAdvisor[] => {
    if (!profile || !profile.custom_advisors || profile.custom_advisors === "Not Set") {
      return [];
    }

    try {
      if (typeof profile.custom_advisors === 'string') {
        const parsed = JSON.parse(profile.custom_advisors);
        if (Array.isArray(parsed)) {
          return parsed;
        } else {
          // Legacy format with single advisor
          return [{
            id: 'legacy',
            raw: parsed.raw || parsed,
            prompt: parsed.prompt || getPromptFromLegacyData(parsed),
            created_at: profile.updated_at || new Date().toISOString()
          }];
        }
      } else if (typeof profile.custom_advisors === 'object') {
        if (Array.isArray(profile.custom_advisors)) {
          return profile.custom_advisors;
        } else {
          // Single object
          return [{
            id: 'legacy',
            raw: profile.custom_advisors.raw || profile.custom_advisors,
            prompt: profile.custom_advisors.prompt || getPromptFromLegacyData(profile.custom_advisors),
            created_at: profile.updated_at || new Date().toISOString()
          }];
        }
      }
    } catch (e) {
      console.error('Error parsing custom advisors:', e);
    }
    
    return [];
  };

  // Delete a custom advisor by ID
  const deleteCustomAdvisor = async (advisorId: string) => {
    try {
      if (!user) return null;

      const advisors = getCustomAdvisors();
      const updatedAdvisors = advisors.filter(a => a.id !== advisorId);

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          custom_advisors: JSON.stringify(updatedAdvisors),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error deleting custom advisor:', err);
      throw err;
    }
  };

  // Fetch profile when user or session changes
  useEffect(() => {
    fetchProfile();
  }, [user, session]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updatePersonalityType,
    updateAdvisor,
    addCustomAdvisor,
    getCustomAdvisors,
    deleteCustomAdvisor
  };
} 