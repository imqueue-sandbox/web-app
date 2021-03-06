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
import {resultHandler} from "../../common";

const mutation = graphql`
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

export function register(userData, success, failure) {
    if (!register.id) {
        register.id = 0;
    }

    const config = {
        mutation,
        variables: {
            input: { ...userData, clientMutationId: String(++register.id) }
        },
        onError: (err) => {
            logger.error('registerMutation:request', err);
            failure && failure([err]);
        },
        onCompleted: resultHandler('updateUser', success, failure),
    };

    commitMutation(environment, config);
}
