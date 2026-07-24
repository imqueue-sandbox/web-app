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
import { AppStore, AUTH_KEY, mutationResult } from '../../common';
import { logger } from '../../config';
import type { FailureHandler, SuccessHandler } from '../../types';
import type {
    loginInput,
    loginMutation,
    loginMutation$data,
} from './__generated__/loginMutation.graphql';

const mutation: GraphQLTaggedNode = graphql`
mutation loginMutation($input: loginInput!) {
    login(input: $input) {
        token
        user {
            id
            email
            firstName
            lastName
            isAdmin
            isActive
            carsCount
        }
        clientMutationId
    }
}`;

/**
 * What the `login` mutation resolves with — the authenticated identity as the
 * mutation payload wraps it. This is the very type `AppStore` persists under
 * `AUTH_KEY`, so `AuthInfo` in `src/types.ts` is an alias of it and no cast is
 * needed at that boundary.
 */
export type LoginPayload = NonNullable<loginMutation$data['login']>;

/** Options of a single {@link useLogin} call. */
export interface LoginOptions {
    success?: SuccessHandler<LoginPayload>;
    failure?: FailureHandler;
}

let clientMutationId = 0;

/**
 * Returns a function signing the given credentials in, along with a flag
 * telling whether such a request is currently in flight — handy for disabling
 * the submit control while it is.
 */
export function useLogin(): [
    (credentials: loginInput, options?: LoginOptions) => void,
    boolean,
] {
    const [commit, isInFlight] = useMutation<loginMutation>(mutation);
    const login = useCallback((
        credentials: loginInput,
        { success, failure }: LoginOptions = {},
    ) => {
        const complete = mutationResult<loginMutation$data, 'login'>(
            'login',
            success,
            failure,
        );

        commit({
            variables: {
                input: {
                    ...credentials,
                    clientMutationId: String(++clientMutationId),
                },
            },
            onError: (err) => {
                logger.error('loginMutation:request', credentials.email, err);
                failure && failure([err]);
            },
            onCompleted: (response, errors) => {
                if (!(errors && errors.length)) {
                    // the session record is persisted before the view layer
                    // hears about it, so whatever `success` kicks off already
                    // sees an authenticated app
                    AppStore.set(AUTH_KEY, response.login);
                }

                complete(response, errors);
            },
        });
    }, [commit]);

    return [login, isInFlight];
}
