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
import { createFragmentContainer } from 'react-relay';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Avatar from "@material-ui/core/Avatar/Avatar";
import ExitToApp from '@material-ui/icons/ExitToApp';
import IconButton from '@material-ui/core/IconButton';
import { Gravatar } from '.';
import { AppStore, AUTH_KEY, CAR_KEY } from '../common/index';
import { CurrentUserFragment } from '../relay/queries/fragments/index';
import { logout } from '../relay/mutations';

const styles = () => ({
    appBarUser: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
});

export class AuthUser extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        data: PropTypes.shape({
            firstName: PropTypes.string.isRequired,
            lastName: PropTypes.string.isRequired,
            email: PropTypes.string,
        }),
    };

    logout = () => {
        const token = (AppStore.get(AUTH_KEY) || {}).token;
        token && logout(token);
        AppStore.del(AUTH_KEY);
        AppStore.del(CAR_KEY);
        return false;
    };

    render() {
        const { classes } = this.props;
        const user = this.props.data;

        if (!user) {
            AppStore.del(AUTH_KEY);
            return null;
        }

        const fullName = `${user.firstName} ${user.lastName}`;
        const letters = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

        return <div className={classes.appBarUser}>
            <Link to="/profile">{`Hello, ${fullName}`}</Link>
            <Link to="/profile">
                {user.email ?
                    <Gravatar user={user} size={40} /> :
                    <Avatar>{letters}</Avatar>
                }
            </Link>
        </div>;
    }
}

AuthUser = withStyles(styles)(AuthUser);
AuthUser = createFragmentContainer(AuthUser, CurrentUserFragment);
