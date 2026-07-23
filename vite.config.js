/*!
 * ISC License
 *
 * Copyright (c) 2026, Imqueue Sandbox
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import relay from 'vite-plugin-relay';

export default defineConfig({
    plugins: [relay, react()],
    server: {
        port: 3000,
        host: true,
    },
    build: {
        outDir: 'build',
    },
});
