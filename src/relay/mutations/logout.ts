/*!
 * ISC License
 *
 * Copyright (c) 2018, Imqueue Sandbox
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import type { GraphQLTaggedNode } from 'relay-runtime';
import { AppStore, AUTH_KEY } from '../../common';
import { logger } from '../../config';
import type {
    logoutMutation,
    logoutMutation$data,
} from './__generated__/logoutMutation.graphql';

const mutation: GraphQLTaggedNode = graphql`
mutation logoutMutation($input: logoutInput!) {
    logout(input: $input) {
        success
        clientMutationId
    }
}`;

/** What the `logout` mutation resolves with. */
export type LogoutPayload = NonNullable<logoutMutation$data['logout']>;

let clientMutationId = 0;

/**
 * Returns a function signing the given token out, along with a flag telling
 * whether such a request is currently in flight.
 *
 * Signing out is fire-and-forget: it takes no success/failure handlers, reports
 * whatever went wrong to the log only, and drops the locally stored session in
 * any case — a token the gateway refuses to invalidate is of no use here
 * either.
 */
export function useLogout(): [(token: string) => void, boolean] {
    const [commit, isInFlight] = useMutation<logoutMutation>(mutation);
    const logout = useCallback((token: string) => {
        commit({
            variables: {
                input: {
                    token,
                    clientMutationId: String(clientMutationId++),
                },
            },
            onError: (err) => {
                logger.error('LogoutMutation:request', err);
            },
            onCompleted: (_response, errors) => {
                if (errors && errors.length) {
                    errors.forEach((err) => {
                        logger.error('LogoutMutation:response', err);
                    });
                }

                AppStore.del(AUTH_KEY);
            },
        });
    }, [commit]);

    return [logout, isInFlight];
}
