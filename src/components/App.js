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
import { UserStorage } from '../common';
import { Login, AppView } from '../layouts';

export class App extends Component {

    state = {
        auth: UserStorage.fetch(),
    };

    _onUserChange = auth => this.setState({ auth })

    componentWillUnmount() {
        UserStorage.off('change', this._onUserChange);
    }

    componentDidMount() {
        UserStorage.on('change', this._onUserChange);
    }

    render() {
        if (this.state.auth) {
            return <AppView
                vars={{}}
                onError={error =>
                    <div className="error">{error.message}</div>}
                onLoading={() =>
                    <div>Loading...</div>}
            />;
        }

        else {
            return <Login/>;
        }
    }
}
