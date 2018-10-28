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
import { QueryRenderer } from 'react-relay';
import environment from '../Environment';

/**
 * Base high order component for generic queries, which produces
 * corresponding Relay's <QueryRenderer /> for a given query to
 * render given RenderComponent
 *
 * @param {Relay.QL} query
 * @return {function(*): Query}
 */
export const withQuery = (query) => (RenderComponent) => {
    class Query extends Component {
        render() {
            const {
                vars,
                onError,
                onLoading,
                onLoaded,
                childProps,
            } = this.props;

            return <QueryRenderer
                environment={environment}
                query={query}
                variables={vars || {}}
                render={({error, props}) => {
                    if (error) {
                        return (onError && onError(error)) || null;
                    }

                    else if (props) {
                        onLoaded && onLoaded();
                        return <RenderComponent
                            data={props}
                            {...(childProps || {})}
                        />;
                    }

                    return (onLoading && onLoading()) || null;
                }}
            />;
        }
    }

    Query.propTypes = {
        vars: PropTypes.object,
        onError: PropTypes.func,
        onLoading: PropTypes.func,
        onLoaded: PropTypes.func,
        childProps: PropTypes.object,
    };

    return Query;
}
