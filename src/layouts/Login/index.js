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
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';
import LoginMutation from './LoginMutation';
import './style.scss';

export class Login extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: ''
        };

        this.login = this.login.bind(this);
        this.reset = this.reset.bind(this);
    }

    handleClose() {
        return false;
    }

    login() {
        LoginMutation.commit(this.state);
    }

    reset() {
        this.setState({
            email: '',
            password: ''
        });
    }

    handleChange(name, event) {
        this.setState({ [name]: event.target.value });
    }

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
                    className="button-reset"
                >
                    Reset
                    <Icon style={{marginLeft: "5px"}}>not_interested</Icon>
                </Button>
                <Button
                    variant="contained"
                    onClick={this.login}
                    color="primary"
                    autoFocus
                    size={"large"}
                    className="button-login"
                >
                    Login
                    <Icon style={{marginLeft: "5px"}}>lock_open</Icon>
                </Button>
            </DialogActions>
        </Dialog>
    }
}
