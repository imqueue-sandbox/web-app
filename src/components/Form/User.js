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
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";
import { withStyles } from '@material-ui/core';
import { errorList, Gravatar} from '../index';
import { AppStore, AUTH_KEY } from '../../common/index';
import { CurrentUserFragment } from '../../relay/queries/index';

const styles = () => ({
    userBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    stats: {
        marginTop: '2em',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    avatar: {
        margin: '0 5em 0 3em !important',
    },
    userName: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
    userContainer: {
        maxWidth: 'initial !important',
        width: '100%',
    },
});

export class User extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        onChange: PropTypes.func,
        errors: PropTypes.arrayOf(PropTypes.shape({
            message: PropTypes.string,
        })),
        data: PropTypes.shape({
            user: PropTypes.shape({
                firstName: PropTypes.string,
                lastName: PropTypes.string,
                email: PropTypes.string,
                carsCount: PropTypes.number,
            }),
        }),
    };

    state = {
        inProgress: true,
        firstName: '',
        lastName: '',
        email: '',
    };

    constructor(props) {
        super(props);
        const { errors } = props;
        const { firstName, lastName, email } = props.data || {};
        Object.assign(this.state, { firstName, lastName, email, errors });
    }

    change = (what) => (event) => {
        this.setState({ [what]: event.target.value }, () => {
            const { firstName, lastName, email } = this.state;
            this.props.onChange && this.props.onChange('user', {
                firstName,
                lastName,
                email,
            }, this.state.errors);
        });
    };

    render() {
        const { error, data, classes, errors } = this.props;
        const user = data;

        if (error) {
            errors.push(error);
        }

        if (!user) {
            AppStore.del(AUTH_KEY);

            return <LinearProgress
                color="secondary"
                className={this.state.inProgress ? "" : "invisible"}
            />;
        }

        return <div className={classes.userContainer}>
            {errorList(errors)}
            <div className={classes.userBox}>
                <div className={classes.avatar}>
                    <Gravatar user={user} size={160} editable />
                </div>
                <div className={classes.userInfo}>
                    <div className={classes.userName}>
                        <TextField
                            id="first-name"
                            label="First Name"
                            value={this.state.firstName}
                            onChange={this.change('firstName')}
                            margin="normal"
                        />
                        <TextField
                            id="last-name"
                            label="Last Name"
                            value={this.state.lastName}
                            onChange={this.change('lastName')}
                            margin="normal"
                        />
                    </div>
                    <TextField
                        id="email"
                        label="Email"
                        value={this.state.email}
                        onChange={this.change('email')}
                        margin="normal"
                        // disabling e-mail change because it will cause
                        // current user token invalidation and will break
                        // current user view
                        disabled
                    />
                    <Typography className={classes.stats}>
                        <em>Cars in garage: {user.carsCount}</em>
                        <em>Bookings made: {0}</em>
                    </Typography>
                </div>
            </div>
        </div>;
    }
}

User = withStyles(styles)(User);
User = createFragmentContainer(User, CurrentUserFragment);
