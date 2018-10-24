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
import React, {PureComponent} from 'react';
import Typography from '@material-ui/core/Typography';
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";
import {Gravatar} from './Gravatar';

import {createFragmentContainer, graphql} from 'react-relay';

//TODO: this component can be re-writed just as Presentation component
class User extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            inProgress: true,
        };
    }

    render() {
        let { error, user } = this.props;
        user = user.user;

        if (error) {
            return <div>{error.message}</div>;
        }

        else if (user) {
            return <div className="user-box">
                <Gravatar user={user} size={100} editable={true}/>
                <div className="divider"/>
                <div className="user-info">
                    <Typography>
                        <b>Name:</b> {user.firstName} {user.lastName}
                    </Typography>
                    <Typography>
                        <b>Email:</b> {user.email}
                    </Typography>
                    <Typography>
                        <b>Cars in garage:</b> {user.cars.length}
                    </Typography>
                    <Typography>
                        <b>Reservations requested:</b> {0}
                    </Typography>
                    <Typography>
                        <b>Cars washed:</b> {0}
                    </Typography>
                </div>
            </div>;
        }

        return <LinearProgress color="secondary" className={
            this.state.inProgress ? "" : "invisible"
        }/>;
    }
}

User = createFragmentContainer(User,
    graphql`
    fragment User_user on Query {
        user {
            id
            firstName
            lastName
            email
            isActive
            isAdmin
            cars {
                id
                make
                model
            }
        }
    }`
);

export default User;
