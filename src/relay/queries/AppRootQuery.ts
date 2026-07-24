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
import { graphql } from 'react-relay';
import type { GraphQLTaggedNode } from 'relay-runtime';

/**
 * `user { id }` is selected next to the fragment spreads on purpose: Relay masks
 * fragment data, so without it the identifier the `updateUser` mutation needs
 * would only be reachable through Relay's internal `__id` book-keeping field.
 *
 * Read it with `useLazyLoadQuery<AppRootQuery>(...)` — the generated operation
 * type of the same name supplies both the variables and the response types.
 */
export const AppRootQuery: GraphQLTaggedNode = graphql`
query AppRootQuery(
    $withUser: Boolean!
    $withUserCars: Boolean!
    $withOptions: Boolean!
    $withReservations: Boolean!
) {
    user {
        id
        ...CurrentUser @include(if: $withUser)
        ...UserCars @include(if: $withUserCars)
    }
    options @include(if: $withOptions) {
        ...Options_options
    }
    ...Reservations @include(if: $withReservations) 
}`;
