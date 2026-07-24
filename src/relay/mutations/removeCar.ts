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
    removeCarInput,
    removeCarMutation,
    removeCarMutation$data,
} from './__generated__/removeCarMutation.graphql';

const mutation: GraphQLTaggedNode = graphql`
mutation removeCarMutation($input: removeCarInput!) {
    removeCar(input: $input) {
        user {
            id
            carsCount
            cars {
                id
                carId
                make
                model
                type
                regNumber
            }
        }
        clientMutationId
    }
}`;

/**
 * What the `removeCar` mutation resolves with — the owner with their refreshed
 * garage, wrapped into the mutation payload, not the user record on its own.
 */
export type RemoveCarPayload =
    NonNullable<removeCarMutation$data['removeCar']>;

/** Options of a single {@link useRemoveCar} call. */
export interface RemoveCarOptions {
    success?: SuccessHandler<RemoveCarPayload>;
    failure?: FailureHandler;
}

let clientMutationId = 0;

/**
 * Returns a function removing the given car from a user's garage, along with a
 * flag telling whether such a request is currently in flight — handy for
 * disabling the control which triggered it while it is.
 */
export function useRemoveCar(): [
    (car: removeCarInput, options?: RemoveCarOptions) => void,
    boolean,
] {
    const [commit, isInFlight] = useMutation<removeCarMutation>(mutation);
    const removeCar = useCallback((
        car: removeCarInput,
        { success, failure }: RemoveCarOptions = {},
    ) => {
        commit({
            variables: {
                input: {
                    ...car,
                    clientMutationId: String(++clientMutationId),
                },
            },
            onError: (err) => {
                logger.error('removeCarMutation:request', err);
                failure && failure([err]);
            },
            onCompleted: mutationResult('removeCar', success, failure),
        });
    }, [commit]);

    return [removeCar, isInFlight];
}
