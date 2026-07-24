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
import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import { Gravatar } from '.';
import { AppStore, AUTH_KEY } from '../common';
import { CurrentUserFragment } from '../relay/queries/fragments';
import type { CurrentUser$key }
    from '../relay/queries/fragments/__generated__/CurrentUser.graphql';

const AppBarUser = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
});

export interface AuthUserProps {
    /** Fragment reference to the signed-in user. */
    data?: CurrentUser$key | null;
}

/**
 * Greeting and avatar of the signed-in user, as shown in the app bar. Both are
 * links to the profile view.
 *
 * A missing user means the persisted session no longer resolves on the
 * back-end, so the stored session record is dropped and nothing is rendered.
 */
export function AuthUser(props: AuthUserProps) {
    const user = useFragment<CurrentUser$key>(
        CurrentUserFragment,
        props.data ?? null,
    );

    useEffect(() => {
        if (!user) {
            AppStore.del(AUTH_KEY);
        }
    }, [user]);

    if (!user) {
        return null;
    }

    const fullName = `${user.firstName} ${user.lastName}`;
    const letters = `${(user.firstName ?? '')[0]}${
        (user.lastName ?? '')[0]
    }`.toUpperCase();

    return <AppBarUser>
        <Link to="/profile">{`Hello, ${fullName}`}</Link>
        <Link to="/profile">
            {user.email ?
                <Gravatar user={user} size={40} /> :
                <Avatar>{letters}</Avatar>
            }
        </Link>
    </AppBarUser>;
}
