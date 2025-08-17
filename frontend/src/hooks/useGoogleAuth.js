import { useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { googleLogin } from "../services/api";

// Get Google Client ID from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const useGoogleAuth = () => {
  const { loginUser } = useAuth(); // Use loginUser instead of login

  const handleCredentialResponse = useCallback(
    async (response) => {
      try {
        console.log(
          "Google credential received:",
          response.credential ? "Yes" : "No"
        );

        // Send the credential to your backend using API service
        const result = await googleLogin({
          credential: response.credential,
        });

        console.log("Backend response:", result.data);

        if (result.data.success) {
          // Use your existing login function
          loginUser(result.data.user, result.data.token);
          console.log("User logged in successfully");
          // Redirect to dashboard
          window.location.href = "/dashboard";
        } else {
          throw new Error(result.data.message || "Google login failed");
        }
      } catch (error) {
        console.error("Google login error:", error);

        // More specific error messages
        if (error.response?.status === 404) {
          alert(
            "Authentication service not available. Please try again later."
          );
        } else if (error.response?.status === 400) {
          alert("Invalid Google token. Please try again.");
        } else {
          alert(`Google login failed: ${error.message}`);
        }
      }
    },
    [loginUser] // Update dependency
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
