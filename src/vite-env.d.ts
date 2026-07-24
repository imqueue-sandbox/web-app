/*!
 * ISC License
 *
 * Copyright (c) 2026, Imqueue Sandbox
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
    /**
     * Base URL of the GraphQL gateway (`api`) this front-end talks to.
     * Defaults to `http://localhost:8888/` when not set.
     */
    readonly VITE_WEB_API_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
