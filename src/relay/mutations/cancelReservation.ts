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
    cancelReservationMutation,
    cancelReservationMutation$data,
} from './__generated__/cancelReservationMutation.graphql';

const mutation: GraphQLTaggedNode = graphql`
mutation cancelReservationMutation($input: cancelReservationInput!) {
    cancelReservation(input: $input) {
        reservations {
            id
            car {
                id
                make
                model
                type
                regNumber
            }
            user {
                id
                firstName
                lastName
            }
            type
            start
            end
        }
        clientMutationId
    }
}`;

/**
 * What the `cancelReservation` mutation resolves with — the whole refreshed
 * reservations list wrapped into the mutation payload, not the cancelled
 * reservation.
 */
export type CancelReservationPayload =
    NonNullable<cancelReservationMutation$data['cancelReservation']>;

/** Options of a single {@link useCancelReservation} call. */
export interface CancelReservationOptions {
    success?: SuccessHandler<CancelReservationPayload>;
    failure?: FailureHandler;
}

let clientMutationId = 0;

/**
 * Returns a function cancelling the reservation with the given identifier,
 * along with a flag telling whether such a request is currently in flight —
 * handy for disabling the control which triggered it while it is.
 */
export function useCancelReservation(): [
    (id: string, options?: CancelReservationOptions) => void,
    boolean,
] {
    const [commit, isInFlight] =
        useMutation<cancelReservationMutation>(mutation);
    const cancelReservation = useCallback((
        id: string,
        { success, failure }: CancelReservationOptions = {},
    ) => {
        commit({
            variables: {
                input: {
                    id,
                    clientMutationId: String(++clientMutationId),
                },
            },
            onError: (err) => {
                logger.error('cancelReservationMutation:request', err);
                failure && failure([err]);
            },
            onCompleted: mutationResult('cancelReservation', success, failure),
        });
    }, [commit]);

    return [cancelReservation, isInFlight];
}
