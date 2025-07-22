import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../auth'; // Adjust this path to your actual useAuth hook

export function useAuthRedirect(isAuthRequired: boolean = true) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) { // Wait until authentication state is loaded
      if (isAuthRequired && !user) {
        const redirectPath = router.asPath;
        // console.log("Redirecting to login:", redirectPath); // For debugging
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      }
    }
  }, [user, loading, router, isAuthRequired]); // Dependencies for useEffect

  return { user, loading }; // Return these for use in the component if needed
}