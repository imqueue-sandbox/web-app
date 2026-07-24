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
import type { Moment } from 'moment';
import { useCallback } from 'react';
import { graphql, useMutation } from 'react-relay';
import type { GraphQLTaggedNode } from 'relay-runtime';
import { mutationResult } from '../../common';
import { logger } from '../../config';
import type { FailureHandler, SuccessHandler } from '../../types';
import type {
    reserveInput,
    reserveMutation,
    reserveMutation$data,
} from './__generated__/reserveMutation.graphql';

const mutation: GraphQLTaggedNode = graphql`
mutation reserveMutation($input: reserveInput!) {
    reserve(input: $input) {
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
 * A reservation as the view layer states it: the generated input, except that
 * `duration` is given as the moments the time table already works in. The hook
 * turns them into the ISO strings the gateway expects.
 */
export type ReserveRequest = Omit<reserveInput, 'duration'> & {
    duration: Moment[];
};

/**
 * What the `reserve` mutation resolves with — the whole refreshed reservations
 * list wrapped into the mutation payload, not the new reservation on its own.
 */
export type ReservePayload = NonNullable<reserveMutation$data['reserve']>;

/** Options of a single {@link useReserve} call. */
export interface ReserveOptions {
    success?: SuccessHandler<ReservePayload>;
    failure?: FailureHandler;
}

let clientMutationId = 0;

/**
 * Returns a function booking the given time for a car wash, along with a flag
 * telling whether such a request is currently in flight — handy for disabling
 * the submit control while it is.
 */
export function useReserve(): [
    (reservation: ReserveRequest, options?: ReserveOptions) => void,
    boolean,
] {
    const [commit, isInFlight] = useMutation<reserveMutation>(mutation);
    const reserve = useCallback((
        { duration, ...reservation }: ReserveRequest,
        { success, failure }: ReserveOptions = {},
    ) => {
        commit({
            variables: {
                input: {
                    ...reservation,
                    duration: duration.map(item => item.toISOString()),
                    clientMutationId: String(++clientMutationId),
                },
            },
            onError: (err) => {
                logger.error('reserveMutation:request', err);
                failure && failure([err]);
            },
            onCompleted: mutationResult('reserve', success, failure),
        });
    }, [commit]);

    return [reserve, isInFlight];
}
