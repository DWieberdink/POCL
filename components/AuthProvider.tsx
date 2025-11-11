'use client';

// components/AuthProvider.tsx - MSAL Authentication Provider
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, isAzureADConfigured } from "@/lib/msalConfig";
import { ReactNode } from "react";

// Create MSAL instance only if Azure AD is configured
let msalInstance: PublicClientApplication | null = null;

if (isAzureADConfigured && typeof window !== "undefined") {
  msalInstance = new PublicClientApplication(msalConfig);
  // Initialize MSAL
  msalInstance.initialize().then(() => {
    // Account selection logic is app dependent
    const accounts = msalInstance!.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance!.setActiveAccount(accounts[0]);
    }
  });
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // If Azure AD is not configured, just render children without MSAL
  if (!isAzureADConfigured || !msalInstance) {
    return <>{children}</>;
  }
  
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}

