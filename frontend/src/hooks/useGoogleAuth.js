import { useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { googleLogin } from "../services/api";

// Get Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const useGoogleAuth = () => {
  const { login } = useAuth();

  const handleCredentialResponse = useCallback(
    async (response) => {
      try {
        // Send the credential to your backend using API service
        const result = await googleLogin({
          credential: response.credential,
        });

        if (result.data.success) {
          // Use your existing login function
          login(result.data.user, result.data.token);
        } else {
          throw new Error(result.data.message || "Google login failed");
        }
      } catch (error) {
        console.error("Google login error:", error);
        alert("Google login failed. Please try again.");
      }
    },
    [login]
  );

  const handleGoogleLogin = useCallback(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.prompt(); // Show the One Tap dialog
    }
  }, [handleCredentialResponse]);

  const renderGoogleButton = useCallback(
    (containerId) => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById(containerId),
          {
            theme: "outline",
            size: "large",
            width: "100%",
          }
        );
      }
    },
    [handleCredentialResponse]
  );

  return {
    handleGoogleLogin,
    renderGoogleButton,
  };
};
