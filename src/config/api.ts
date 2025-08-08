export const API_CONFIG = {
  // Fallback base URL for local development or when hostname cannot be resolved
  // You can override via environment or keep this as a safe default
  FALLBACK_BASE_URL: "https://api.alfrih.com/v1/api",
  ROOT_DOMAIN: "alfrih.com",
  API_SUBDOMAIN: "api",
  API_VERSION_PATH: "/v1/api",
  TIMEOUT: 30000, // 30 seconds default timeout
} as const;

function isIpAddress(hostname: string): boolean {
  return /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
}

function getSubdomain(hostname: string, rootDomain: string): string | null {
  const parts = hostname.split(".");
  const rootParts = rootDomain.split(".");

  if (parts.length <= rootParts.length) return null;
  const domain = parts.slice(-rootParts.length).join(".");
  if (domain !== rootDomain) return null;

  const sub = parts.slice(0, parts.length - rootParts.length).join(".");
  if (!sub || sub === "www") return null;
  return sub;
}

export function computeApiBaseURL(hostname?: string): string {
  try {
    const host =
      hostname ||
      (typeof window !== "undefined" ? window.location.hostname : "");

    // Dev parity on localhost: support admin.localhost and tenant.localhost
    if (
      !host ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      isIpAddress(host)
    ) {
      // Root localhost -> landing -> api.alfrih.com
      return `https://${API_CONFIG.API_SUBDOMAIN}.${API_CONFIG.ROOT_DOMAIN}${API_CONFIG.API_VERSION_PATH}`;
    }

    if (host.endsWith(".localhost")) {
      const sub = host.split(".")[0];
      if (!sub || sub === "www" || sub === "admin") {
        return `https://${API_CONFIG.API_SUBDOMAIN}.${API_CONFIG.ROOT_DOMAIN}${API_CONFIG.API_VERSION_PATH}`;
      }
      return `https://${sub}.${API_CONFIG.API_SUBDOMAIN}.${API_CONFIG.ROOT_DOMAIN}${API_CONFIG.API_VERSION_PATH}`;
    }

    const sub = getSubdomain(host, API_CONFIG.ROOT_DOMAIN);

    // Landing or admin -> api.alfrih.com
    if (!sub || sub === "admin") {
      return `https://${API_CONFIG.API_SUBDOMAIN}.${API_CONFIG.ROOT_DOMAIN}${API_CONFIG.API_VERSION_PATH}`;
    }

    // Tenant -> {sub}.api.alfrih.com
    return `https://${sub}.${API_CONFIG.API_SUBDOMAIN}.${API_CONFIG.ROOT_DOMAIN}${API_CONFIG.API_VERSION_PATH}`;
  } catch {
    return API_CONFIG.FALLBACK_BASE_URL;
  }
}

export const apiUrl = (endpoint: string) => {
  const base = computeApiBaseURL();
  return `${base}${endpoint}`;
};
