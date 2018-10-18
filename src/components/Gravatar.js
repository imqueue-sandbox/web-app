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
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import { md5 } from '../common';

const bigSize = 60;
const styles = {
    row: {
        display: 'flex',
        justifyContent: 'center',
    },
    avatar: {
        margin: 10,
    },
    bigAvatar: {
        width: bigSize,
        height: bigSize,
    },
};

class Gravatar extends PureComponent {
    render() {
        const { user, classes, large, size } = this.props;

        return <Avatar
            alt={`${user.firstName} ${user.lastName}`}
            src={`https://s.gravatar.com/avatar/${
                md5(user.email.trim().toLowerCase())
            }` + ((size || large) && `?s=${size ? size : bigSize}`)}
            className={classNames(
                classes.avatar,
                large && classes.bigAvatar,
            )}
            style={size && {
                width: size,
                height: size,
            }}
        />;
    }
}

Gravatar.propTypes = {
    classes: PropTypes.object.isRequired,
    user: PropTypes.object,
    large: PropTypes.bool,
    size: PropTypes.number,
};
Gravatar = withStyles(styles)(Gravatar);

export { Gravatar };
