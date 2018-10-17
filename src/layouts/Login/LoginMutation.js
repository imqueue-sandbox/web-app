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
import environment from '../../relay/Environment';
import { UserStorage } from '../../common';

let $id = 0;
const loginMutation = graphql`
    mutation LoginMutation($input: loginInput!) {
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
    }
`;

export default class LoginMutation {
    static commit({ email, password }) {
        $id++;
        commitMutation(environment, {
            mutation: loginMutation,
            variables: {
                input: { email, password, clientMutationId: String($id) }
            },
            onError: err => console.error('LoginMutation:request', email, err),
            onCompleted: (response, errors) => {
                if (errors && errors.length) {
                    errors.map(err =>
                        console.error('LoginMutation:response', email, err)
                    );
                }

                if (response) {
                    if (response.login) {
                        UserStorage.save(response.login);
                    }

                    else {
                        console.error(
                            'LoginMutation:response is invalid:',
                            email, response
                        );
                    }
                }
            }
        })
    }
}
