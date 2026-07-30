/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_API_URL?: string;
  readonly VITE_COACH_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
