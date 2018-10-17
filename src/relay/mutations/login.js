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
import { UserStorage } from '../../common/index';
import { logger } from '../../config';

export function login(component) {
    const { email, password } = component.state;

    if (!login.id) {
        login.id = 0;
    }

    commitMutation(environment, {
        mutation: graphql`mutation loginMutation($input: loginInput!) {
            login(input: $input) {
                token
                user {
                    id
                    email
                    firstName
                    lastName
                    isAdmin
                    isActive
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
        }`,
        variables: {
            input: { email, password, clientMutationId: String(++login.id) }
        },
        onError: logger.error.bind(logger, 'LoginMutation:request', email),
        onCompleted: (response, errors) => {
            if (errors && errors.length) {
                return component.setState({ error: errors[0].message });
            }

            UserStorage.save(response.login);
        }
    })
}
