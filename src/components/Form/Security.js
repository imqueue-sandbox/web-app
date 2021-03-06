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
import classNames from 'classnames';
import { withStyles } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { PasswordEye, errorList } from '.';

const styles = theme => ({
    textField: {
        maxWidth: '30em',
    },
    passwordForm: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    margin: {
        margin: theme.spacing.unit,
    },
});

export class Security extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        onChange: PropTypes.func,
        errors: PropTypes.arrayOf(PropTypes.shape({
            message: PropTypes.string.isRequired,
        })),
    };

    state = {
        showOld: false,
        showNew: false,
        oldPassword: '',
        newPassword: '',
    };

    showPassword = (which) => () => {
        this.setState({ [`show${which}`]: !this.state[`show${which}`] });
    };

    change = (which) => (event) => {
        this.setState({ [which]: event.target.value }, () => {
            this.props.onChange && this.props.onChange('password', {
                password: this.state.newPassword,
                oldPassword: this.state.oldPassword,
            });
        });
    };

    render() {
        const { classes, errors } = this.props;

        return <div className={classes.passwordForm}>
            {errorList(errors)}
            <FormControl className={classNames(
                classes.margin,
                classes.textField
            )}>
                <InputLabel htmlFor="adornment-password">
                    Current Password
                </InputLabel>
                <Input
                    id="old-password"
                    type={this.state.showOld ? 'text' : 'password'}
                    value={this.state.oldPassword}
                    onChange={this.change('oldPassword')}
                    endAdornment={<PasswordEye
                        onClick={this.showPassword('Old')}
                        enabled={this.state.showOld}
                    />}
                />
            </FormControl>

            <FormControl className={classNames(
                classes.margin,
                classes.textField
            )}>
                <InputLabel htmlFor="adornment-password">
                    New Password
                </InputLabel>
                <Input
                    id="new-password"
                    type={this.state.showNew ? 'text' : 'password'}
                    value={this.state.newPassword}
                    onChange={this.change('newPassword')}
                    endAdornment={<PasswordEye
                        onClick={this.showPassword('New')}
                        enabled={this.state.showNew}
                    />}
                />
            </FormControl>
        </div>;
    }
}

Security = withStyles(styles)(Security);
