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
import React, { PureComponent } from 'react';
import { withStyles } from "@material-ui/core";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import LockOpen from '@material-ui/icons/LockOpen';
import NotInterested from '@material-ui/icons/NotInterested';
import { login } from '../relay/mutations/index';
import { AppMessage } from '../components';
import { clone, uuid } from '../common';

const styles = () => ({});

/**
 * Login page layout component - displays login form
 */
class Login extends PureComponent {
    /**
     * Initializes component
     *
     * @constructor
     * @param {*} props
     */
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            errors: [],
        };

        this.initialState = clone(this.state);
    }

    /**
     * Handles close login dialog box. Actually it exists specially to prevent
     * close behavior
     *
     * @return {boolean}
     */
    handleClose = () => false;

    /**
     * Performs login action
     */
    login = () => login(this);

    /**
     * Resets the login form to initial state
     */
    reset = () => this.clearErrors() ||
        this.setState(clone(this.initialState));

    /**
     * Clears errors off
     */
    clearErrors = () => this.setState({ errors: [] });

    /**
     * Handles changes on a form fields and updates local state
     *
     * @param {string} name - field name
     * @param {CustomEvent} event - react event
     */
    handleChange = (name, event) =>
        this.setState({ [name]: event.target.value });

    render() {
        return <Dialog
            fullScreen={false}
            open={true}
            onClose={this.handleClose}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">
                {"Customer Login"}
            </DialogTitle>
            <DialogContent>
                {this.state.errors.map(error =>
                    <AppMessage
                        variant="error"
                        message={error.message}
                        onClose={this.clearErrors}
                        key={(error.extensions || {}).code || uuid()}
                    />)
                }
                <TextField
                    id="email"
                    label="E-mail"
                    fullWidth
                    type="email"
                    name="email"
                    autoComplete="email"
                    margin="normal"
                    variant="outlined"
                    value={this.state.email}
                    onChange={this.handleChange.bind(this, 'email')}
                />
                <TextField
                    id="password"
                    label="Password"
                    fullWidth
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    variant="outlined"
                    value={this.state.password}
                    onChange={this.handleChange.bind(this, 'password')}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={this.reset}
                    color="default"
                    size={"large"}
                    disabled={!(
                        this.state.email ||
                        this.state.password ||
                        this.state.errors
                    )}
                >
                    Reset
                    <NotInterested />
                </Button>
                <Button
                    variant="contained"
                    onClick={this.login}
                    color="primary"
                    autoFocus
                    size={"large"}
                    disabled={!(this.state.email && this.state.password)}
                >
                    Login
                    <LockOpen />
                </Button>
            </DialogActions>
        </Dialog>
    }
}


Login = withStyles(styles)(Login);

export { Login };