/*!
 * ISC License
 *
 * Copyright (c) 2026, Imqueue Sandbox
 */
import { Network } from 'relay-runtime';
import type { FetchFunction } from 'relay-runtime';
import { AppStore, AUTH_KEY } from '../common';
import { APP_BACKEND_URL } from '../config';
import type { AuthInfo } from '../types';

const fetchQuery: FetchFunction = (operation, variables) => {
    const token = AppStore.get<AuthInfo>(AUTH_KEY)?.token;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['X-Auth-User'] = token;
    }

    return fetch(APP_BACKEND_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: operation.text, variables }),
    }).then(response => response.json());
};

const network = Network.create(fetchQuery);

export default network;
