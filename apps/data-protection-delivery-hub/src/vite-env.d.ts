/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HUB_MODE?: "demo" | "live";
  readonly VITE_LIVE_ADAPTER_CONFIGURED?: "true" | "false";
  readonly VITE_DATAVERSE_URL?: string;
  readonly VITE_PUBLISHER_PREFIX?: string;
  readonly VITE_SHAREPOINT_SITE_URL?: string;
  readonly VITE_SHAREPOINT_EVIDENCE_LIBRARY?: string;
}
