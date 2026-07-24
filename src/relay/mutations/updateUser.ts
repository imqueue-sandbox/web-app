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
    updateUserInput,
    updateUserMutation,
    updateUserMutation$data,
} from './__generated__/updateUserMutation.graphql';

const mutation: GraphQLTaggedNode = graphql`
mutation updateUserMutation(
    $input: updateUserInput!,
    $withoutUser: Boolean!
) {
    updateUser(input: $input) {
        user @skip(if: $withoutUser) {
            id
            firstName
            lastName
            email
            isActive
            isAdmin
            carsCount
        }
        clientMutationId
    }
}`;

/**
 * What the `updateUser` mutation resolves with — the saved user wrapped into the
 * mutation payload, not the user record on its own.
 */
export type UpdateUserPayload =
    NonNullable<updateUserMutation$data['updateUser']>;

/** Options of a single {@link useUpdateUser} call. */
export interface UpdateUserOptions {
    success?: SuccessHandler<UpdateUserPayload>;
    failure?: FailureHandler;
    /** Skips the `user` selection when only the write matters. */
    withoutUser?: boolean;
}

let clientMutationId = 0;

/**
 * Returns a function saving the given user data, along with a flag telling
 * whether such a request is currently in flight — handy for disabling the
 * submit control while it is.
 */
export function useUpdateUser(): [
    (userData: updateUserInput, options?: UpdateUserOptions) => void,
    boolean,
] {
    const [commit, isInFlight] = useMutation<updateUserMutation>(mutation);
    const update = useCallback((
        userData: updateUserInput,
        { success, failure, withoutUser = false }: UpdateUserOptions = {},
    ) => {
        commit({
            variables: {
                input: {
                    ...userData,
                    clientMutationId: String(++clientMutationId),
                },
                withoutUser,
            },
            onError: (err) => {
                logger.error('updateUserMutation:request', err);
                failure && failure([err]);
            },
            onCompleted: mutationResult('updateUser', success, failure),
        });
    }, [commit]);

    return [update, isInFlight];
}
