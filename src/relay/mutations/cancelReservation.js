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
import { commitMutation, graphql } from 'react-relay';
import environment from '../Environment';
import { logger } from '../../config';
import { resultHandler } from '../../common';

const mutation = graphql`
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

export function cancelReservation(id, success, failure) {
    if (!cancelReservation.id) {
        cancelReservation.id = 0;
    }

    const config = {
        mutation,
        variables: {
            input: {
                id,
                clientMutationId: String(++cancelReservation.id),
            }
        },
        onError: (err) => {
            logger.error('cancelReservationMutation:request', err);
            failure && failure([err]);
        },
        onCompleted: resultHandler('cancelReservation', success, failure)
    };

    commitMutation(environment, config);
}
