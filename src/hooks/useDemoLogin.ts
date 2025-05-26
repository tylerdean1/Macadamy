import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import type { EnrichedProfile } from "@/lib/store";
import { cloneDemoData, DemoSession } from "@/lib/utils/cloneDemoData";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useDemoLogin(): {
    loading: boolean;
    error: string | null;
    loginAsDemoUser: () => Promise<EnrichedProfile | null>;
} {
    // Use the loading and error state from the auth store
    const {
        setUser,
        setProfile,
        loading,
        error,
        setLoading,
        setError
    } = useAuthStore();
    const navigate = useNavigate();

    const loginAsDemoUser = useCallback(
        async (): Promise<EnrichedProfile | null> => {
            // Set the demo loading state to true
            setLoading({ demo: true });
            setError(null);
            let currentToastId: string | number | undefined = undefined;

            try {
                currentToastId = toast.loading("Preparing demo environment...");

                const demoSessionData: DemoSession = await cloneDemoData();

                toast.success("Demo environment ready!", {
                    id: currentToastId,
                    duration: 2000,
                });
                currentToastId = toast.loading("Logging into demo account..."); // New toast, new ID

                const demoEmail = typeof import.meta.env.VITE_DEMO_USER_EMAIL === 'string' ? import.meta.env.VITE_DEMO_USER_EMAIL : '';
                const demoPassword = typeof import.meta.env.VITE_DEMO_USER_PASSWORD === 'string' ? import.meta.env.VITE_DEMO_USER_PASSWORD : '';

                if (demoEmail.length === 0 || demoPassword.length === 0) {
                    console.error(
                        "VITE_DEMO_USER_EMAIL or VITE_DEMO_USER_PASSWORD environment variables are not set.",
                    );
                    const errMsg = "Demo user credentials are not configured. Please set VITE_DEMO_USER_EMAIL and VITE_DEMO_USER_PASSWORD in your .env file.";
                    toast.error(errMsg, { id: currentToastId });
                    setError(errMsg);
                    throw new Error(errMsg);
                }

                if (demoEmail === "demo@example.com") {
                    console.warn(
                        "Using default demo credentials. Ensure VITE_DEMO_USER_EMAIL and VITE_DEMO_USER_PASSWORD are set in your .env file for a real demo account.",
                    );
                }

                // Set auth loading state to true during login
                setLoading({ demo: true, auth: true });
                const { data: authData, error: authError } = await supabase.auth
                    .signInWithPassword({
                        email: demoEmail,
                        password: demoPassword,
                    });
                // Reset auth loading state
                setLoading({ auth: false });

                let authErrorMsg = '';
                if (authError && typeof authError.message === 'string' && authError.message.length > 0) {
                    authErrorMsg = authError.message;
                }

                if (authErrorMsg.length > 0 || typeof authData !== 'object' || authData === null || typeof authData.user !== 'object' || authData.user === null) {
                    const errMsg = authErrorMsg.length > 0 ? authErrorMsg : "Demo login failed. Check credentials or demo account status.";
                    setError(errMsg);
                    toast.error(
                        authErrorMsg.length > 0 ? authErrorMsg : "Demo login failed. Please try again later or contact support.",
                        { id: currentToastId },
                    );
                    return null;
                }

                setUser(authData.user);

                // Profile loading is managed by loadProfile itself
                console.log("[useDemoLogin] Loading demo profile for user ID:", demoSessionData.userId);
                await useAuthStore.getState().loadProfile(demoSessionData.userId);

                const demoProfile = useAuthStore.getState().profile;

                if (!demoProfile) {
                    const errMsg = "Failed to load demo profile. The demo account might be incomplete.";
                    setError(errMsg);
                    toast.error(
                        "Failed to load demo profile. Please try again later or contact support.",
                        { id: currentToastId },
                    );
                    return null;
                }

                setProfile(demoProfile);

                // Update the current toast to success
                toast.success("Logged into demo account successfully!", { id: currentToastId });

                // Navigate to dashboard
                navigate("/dashboard");

                return demoProfile;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                setError(errorMessage);
                if (currentToastId !== undefined) {
                    toast.error(errorMessage, { id: currentToastId });
                } else {
                    toast.error(errorMessage);
                }
                return null;
            } finally {
                setLoading({ demo: false });
            }
        },
        [setUser, setProfile, setLoading, setError, navigate],
    );

    // Return the loading and error states from the auth store
    return {
        loading: loading.demo,
        error,
        loginAsDemoUser
    };
}