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
import { useCallback } from 'react';
import { styled } from '@mui/material/styles';
import MuiAvatar from '@mui/material/Avatar';
import md5 from 'blueimp-md5';
import type { CurrentUser$data }
    from '../relay/queries/fragments/__generated__/CurrentUser.graphql';

const bigSize = 60;

const Avatar = styled(MuiAvatar)({
    margin: 10,
    border: '5px solid transparent',
});

/** Highlights the avatar as a control which opens the gravatar editor. */
const editableSx = {
    transition: 'border-color 0.5s ease-in-out, box-shadow: 0.5s ease-in-out',
    cursor: 'pointer',
    opacity: 1,
    '&:hover': {
        borderColor: '#fff',
        boxShadow: '0 0 8px #333',
    },
} as const;

export interface GravatarProps {
    /** The user whose e-mail addresses the gravatar. */
    user: CurrentUser$data;
    /** Renders the avatar at {@link bigSize} instead of the MUI default. */
    large?: boolean;
    /** Explicit avatar size in pixels, winning over `large`. */
    size?: number;
    /** Makes the avatar clickable, opening the gravatar editor. */
    editable?: boolean;
}

/**
 * The user's gravatar, addressed by the md5 of their e-mail as the service
 * requires.
 */
export function Gravatar({ user, large, size, editable }: GravatarProps) {
    const edit = useCallback(() => {
        window.open('https://gravatar.com/gravatars/new', '_blank');
    }, []);

    return (
        <Avatar
            onClick={editable ? edit : () => {}}
            title={`${user.firstName} ${user.lastName}${
                editable ? '. Click to change...' : ''
            }`}
            // the size query is appended exactly as it always was: with
            // neither `size` nor `large` given the right operand is not a
            // string at all, which both callers avoid by always passing a size
            src={`https://s.gravatar.com/avatar/${
                md5((user.email || '').trim().toLowerCase())
            }` + ((size || large) && `?s=${size ? size : bigSize}`)}
            sx={[
                !!large && { width: bigSize, height: bigSize },
                !!editable && editableSx,
            ]}
            style={size ? {
                width: size,
                height: size,
            } : undefined}
        />
    );
}
