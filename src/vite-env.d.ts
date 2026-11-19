/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ASSISTANT_ENDPOINT?: string;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
