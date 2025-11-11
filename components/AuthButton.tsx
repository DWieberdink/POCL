'use client';

// components/AuthButton.tsx - Login/Logout button component
import { useMsal } from "@azure/msal-react";
import { useIsAuthenticated, useAccount } from "@azure/msal-react";
import { loginRequest, isAzureADConfigured } from "@/lib/msalConfig";
import { useState } from "react";

export function AuthButton() {
  // If Azure AD is not configured, don't show auth button
  if (!isAzureADConfigured) {
    return null;
  }

  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: "/",
    });
  };

  if (isAuthenticated && account) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "14px", color: "#666" }}>
          {account.name || account.username}
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      style={{
        padding: "8px 16px",
        backgroundColor: "#0078d4",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: isLoading ? "not-allowed" : "pointer",
        fontSize: "14px",
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      {isLoading ? "Logging in..." : "Login with Microsoft"}
    </button>
  );
}

