/*!
 * ISC License
 *
 * Copyright (c) 2026, Imqueue Sandbox
 */
import { Network } from 'relay-runtime';
import { AppStore, AUTH_KEY } from '../common/index.js';
import { APP_BACKEND_URL } from '../config.js';

function fetchQuery(operation, variables) {
    const auth = AppStore.get(AUTH_KEY) || {};
    const headers = { 'Content-Type': 'application/json' };

    if (auth.token) {
        headers['X-Auth-User'] = auth.token;
    }

    return fetch(APP_BACKEND_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: operation.text, variables }),
    }).then(response => response.json());
}

const network = Network.create(fetchQuery);

export default network;
