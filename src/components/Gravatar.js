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
import * as md5 from 'md5';

const bigSize = 60;
const styles = {
    row: {
        display: 'flex',
        justifyContent: 'center',
    },
    avatar: {
        margin: 10,
        cursor: 'pointer',
        border: '5px solid transparent',
    },
    editable: {
        transition: 'border-color 0.5s ease-in-out, ' +
            'box-shadow: 0.5s ease-in-out',
        opacity: 1,
        '&:hover': {
            borderColor: '#fff',
            boxShadow: '0 0 8px #333'
        },
    },
    bigAvatar: {
        width: bigSize,
        height: bigSize,
    },
};

class Gravatar extends PureComponent {

    edit = () => {
        window.open('https://gravatar.com/gravatars/new', '_blank');
    }

    render() {
        const { user, classes, large, size, editable } = this.props;

        return <Avatar
            onClick={this.props.editable ? this.edit : () => {}}
            title={`${user.firstName} ${user.lastName}${
                this.props.editable ? '. Click to change...' : ''
            }`}
            src={`https://s.gravatar.com/avatar/${
                md5((user.email || '').trim().toLowerCase())
            }` + ((size || large) && `?s=${size ? size : bigSize}`)}
            className={classNames(
                classes.avatar,
                large && classes.bigAvatar,
                editable && classes.editable,
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
    user: PropTypes.object.isRequired,
    large: PropTypes.bool,
    size: PropTypes.number,
    editable: PropTypes.bool,
};
Gravatar = withStyles(styles)(Gravatar);

export { Gravatar };
