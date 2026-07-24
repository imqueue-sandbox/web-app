/*!
 * ISC License
 *
 * Copyright (c) 2026, Imqueue Sandbox
 */
export const logger: Console = console;
export const APP_BACKEND_URL: string =
    import.meta.env.VITE_WEB_API_URL || 'http://localhost:8888/';

/**
 * API protocol this front-end speaks to the gateway, displayed in the UI so
 * this app is not mistaken for its REST twin running side-by-side.
 */
export const APP_API_PROTOCOL: string = 'GraphQL';
