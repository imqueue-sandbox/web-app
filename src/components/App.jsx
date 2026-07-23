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
import { useLocation } from 'react-router-dom';
import LinearProgress from '@mui/material/LinearProgress';
import { AppStore, AUTH_KEY } from '../common';
import { Login, AppView } from '../layouts';
import { AppMessage } from '.';

class AppComponent extends Component {

    state = {
        user: (AppStore.get(AUTH_KEY) || {}).user,
    };

    onUserChange = (key, auth) =>
        key === AUTH_KEY && this.setState({ user: auth && auth.user });

    componentWillUnmount() {
        AppStore.off('change', this.onUserChange);
    }

    componentDidMount() {
        AppStore.on('change', this.onUserChange);
    }

    is(routePath) {
        return this.props.location.pathname === `/${routePath}`;
    }

    render() {
        if (!this.state.user) {
            return <Login/>;
        }

        return <AppView
            childProps={{route: this.props.location.pathname}}
            vars={{
                withUser: true,
                withUserCars: true,
                withOptions: this.is(''),
                withReservations: this.is(''),
            }}
            onError={error =>
                <AppMessage
                    message={error.message}
                    variant="error"
                />
            }
            onLoading={() => <LinearProgress color="secondary"/>}
        />;
    }
}

/**
 * Injects the current router location into the App component. React Router v7
 * dropped the `withRouter` HOC in favor of hooks, so this thin functional
 * wrapper bridges the location into the class-based application shell.
 */
export function App(props) {
    const location = useLocation();

    return <AppComponent {...props} location={location}/>;
}
