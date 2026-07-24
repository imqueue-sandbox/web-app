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
import { mutationResult } from '../../common';
import { logger } from '../../config';
import type { FailureHandler, SuccessHandler } from '../../types';
import type {
    registerMutation,
    registerMutation$data,
    updateUserInput,
} from './__generated__/registerMutation.graphql';

const mutation: GraphQLTaggedNode = graphql`
mutation registerMutation($input: updateUserInput!) {
    updateUser(input: $input) {
        user {
            id
            email
            firstName
            lastName
        }
        clientMutationId
    }
}`;

/**
 * What the `register` mutation resolves with — the created user wrapped into
 * the `updateUser` payload, not the user record on its own. Signing up is an
 * `updateUser` write of a record which does not exist yet, which is why the
 * payload field is spelled that way.
 */
export type RegisterPayload =
    NonNullable<registerMutation$data['updateUser']>;

/** Options of a single {@link useRegister} call. */
export interface RegisterOptions {
    success?: SuccessHandler<RegisterPayload>;
    failure?: FailureHandler;
}

let clientMutationId = 0;

/**
 * Returns a function signing the given user data up, along with a flag telling
 * whether such a request is currently in flight — handy for disabling the
 * submit control while it is.
 */
export function useRegister(): [
    (userData: updateUserInput, options?: RegisterOptions) => void,
    boolean,
] {
    const [commit, isInFlight] = useMutation<registerMutation>(mutation);
    const register = useCallback((
        userData: updateUserInput,
        { success, failure }: RegisterOptions = {},
    ) => {
        commit({
            variables: {
                input: {
                    ...userData,
                    clientMutationId: String(++clientMutationId),
                },
            },
            onError: (err) => {
                logger.error('registerMutation:request', err);
                failure && failure([err]);
            },
            onCompleted: mutationResult('updateUser', success, failure),
        });
    }, [commit]);

    return [register, isInFlight];
}
