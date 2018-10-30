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
import { PropTypes } from 'prop-types';
import { createFragmentContainer } from 'react-relay';
import Typography from '@material-ui/core/Typography';
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";
import { Gravatar } from '.';
import { AuthStorage } from '../common';
import { CurrentUserFragment } from '../relay/queries';

export class User extends Component {
    state = {
        inProgress: true
    }

    render() {
        const { error, data } = this.props;
        const user = data;

        if (!user) {
            AuthStorage.clear();
        }

        if (error) {
            return <div>{error.message}</div>;
        }

        if (!user) {
            return (
                <LinearProgress
                    color="secondary"
                    className={this.state.inProgress ? "" : "invisible"}
                />
            )
        }

        return <div className="user-box">
            <Gravatar user={user} size={100} editable/>
            <div className="divider"/>
            <div className="user-info">
                <Typography>
                    <b>Name:</b> {user.firstName} {user.lastName}
                </Typography>
                <Typography>
                    <b>Email:</b> {user.email}
                </Typography>
                <Typography>
                    <b>Cars in garage:</b> {user.carsCount}
                </Typography>
                <Typography>
                    <b>Bookings made:</b> {0}
                </Typography>
                <Typography>
                    <b>Cars washed:</b> {0}
                </Typography>
            </div>
        </div>;
    }
}

User.propTypes = {
    error: PropTypes.shape({
        message: PropTypes.string,
    }),
    data: PropTypes.shape({
        user: PropTypes.shape({
            firstName: PropTypes.string,
            lastName: PropTypes.string,
            email: PropTypes.string,
            carsCount: PropTypes.number,
        }),
    }),
};

User = createFragmentContainer(User, CurrentUserFragment);
