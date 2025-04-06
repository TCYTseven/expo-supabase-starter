import { useState, useEffect } from 'react';
import { useSupabase } from '@/context/supabase-provider';
import { supabase } from '@/config/supabase';

export type UserProfile = {
  id: string;
  personality_type: string;
  advisor: string;
  custom_advisors: string;
  created_at: string;
  updated_at: string;
};

export function useUserProfile() {
  const { session, user } = useSupabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch the user's profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user) {
        setProfile(null);
        return;
      }

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
                custom_advisors: "Not Set"
              }])
              .select()
              .single();
            
            if (insertError) {
              throw insertError;
            }
            
            setProfile(newProfile);
            return;
          } catch (insertErr) {
            throw insertErr;
          }
        } else {
          throw error;
        }
      }

      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err);
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

  // Update the user's custom advisors
  const updateCustomAdvisors = async (customAdvisors: string) => {
    try {
      if (!user) return null;

      // Make sure customAdvisors is a valid JSON string
      let validCustomAdvisors = customAdvisors;
      try {
        // Test if it's valid JSON
        JSON.parse(customAdvisors);
      } catch (e) {
        // If not valid JSON, wrap it as a prompt
        validCustomAdvisors = JSON.stringify({
          prompt: customAdvisors,
          raw: null
        });
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          custom_advisors: validCustomAdvisors,
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
      console.error('Error updating custom advisors:', err);
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
    updateCustomAdvisors
  };
} 