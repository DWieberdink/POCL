// lib/msalConfig.ts - Azure AD MSAL configuration
import { Configuration, PopupRequest } from "@azure/msal-browser";

// Check if Azure AD is configured
const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "";
const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID || "";

// MSAL configuration (only if Azure AD is configured)
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: tenantId ? `https://login.microsoftonline.com/${tenantId}` : "https://login.microsoftonline.com/common",
    redirectUri: typeof window !== "undefined" ? window.location.origin : "",
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "Files.Read.All", "Sites.Read.All"],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};

// Check if Azure AD is configured
export const isAzureADConfigured = !!(clientId && tenantId);

