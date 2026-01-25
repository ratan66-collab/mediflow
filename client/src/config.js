// Centralized config for API URL
// In development, this uses localhost.
// In production (Cloudflare), we must set VITE_API_URL environment variable.

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Helper to construct full endpoints
export const endpoints = {
    analyze: `${API_BASE_URL}/api/reports/analyze`,
    chat: `${API_BASE_URL}/api/physio/chat`,
    consult: `${API_BASE_URL}/api/physio/consult`,
    // Add other endpoints here if needed
};
