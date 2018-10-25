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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql, QueryRenderer } from 'react-relay';
import environment from '../Environment';

const query = graphql`
query AppRootQuery(
    $withUser: Boolean!
    $withUserCars: Boolean!
) {
    user {
        ...CurrentUser @include(if: $withUser)
        ...UserCars @include(if: $withUserCars)
    }
}`;

export function withAppRootQuery(Child) {
    class AppRootQuery extends Component {
        render() {
            const { vars, onError, onLoading } = this.props;

            return <QueryRenderer
                environment={environment}
                query={query}
                variables={vars}
                render={({error, props}) => {
                    if (error) {
                        return onError && (onError(error) || null);
                    }

                    else if (props) {
                        return <Child data={props} />;
                    }

                    return onLoading && (onLoading() || null);
                }}
            />;
        }
    }

    AppRootQuery.propTypes = {
        vars: PropTypes.object.isRequired,
        onError: PropTypes.func,
        onLoading: PropTypes.func,
    };

    return AppRootQuery;
}
