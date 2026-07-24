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
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useFragment } from 'react-relay';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
// straight at the modules rather than back through the barrels these are
// re-exported from, which would make the files import each other
import { Gravatar } from '../Gravatar';
import { errorList } from './errors';
import { AppStore, AUTH_KEY } from '../../common';
import { CurrentUserFragment } from '../../relay/queries';
import type { CurrentUser$key }
    from '../../relay/queries/fragments/__generated__/CurrentUser.graphql';
import type { updateUserInput }
    from '../../relay/mutations/__generated__/updateUserMutation.graphql';
import type { AppError } from '../../types';

const UserContainer = styled('div')({
    maxWidth: 'initial !important',
    width: '100%',
});

const UserBox = styled('div')({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
});

const Avatar = styled('div')({
    margin: '0 5em 0 3em !important',
});

const UserInfo = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
});

const UserName = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
});

const Stats = styled(Typography)({
    marginTop: '2em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
});

/** Editable members of the form. */
type UserField = 'firstName' | 'lastName' | 'email';

interface UserProps {
    onChange?: (
        type: string,
        data: updateUserInput,
        errors?: AppError[],
    ) => void;
    errors?: AppError[];
    /** Data layer error, pushed into the rendered error list when given. */
    error?: AppError;
    data?: CurrentUser$key | null;
}

/**
 * Customer details form of the profile view. Like {@link Security} it carries no
 * submit control: every keystroke is reported through `onChange` and the view
 * decides when the record is worth saving.
 */
export function User(props: UserProps) {
    const { error, errors, onChange } = props;
    const user = useFragment<CurrentUser$key>(CurrentUserFragment, props.data);
    // the form is seeded from the record once and then owns its own values —
    // the class version did the same from its constructor, so a later update of
    // the record does not overwrite what is being typed
    const [form, setForm] = useState(() => ({
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
    }));
    // the class captured the error list at construction time as well and
    // reported that same list back with every change — kept verbatim
    const [initialErrors] = useState(errors);
    // the class version pushed `error` into the `errors` prop array, mutating
    // the list its owner keeps in state; the rendered list is derived instead.
    // As before, a data layer error only shows when there is a list to add it
    // to — the view always passes one
    const allErrors = useMemo(
        () => errors && error ? [...errors, error] : errors,
        [errors, error],
    );
    const change = useCallback((what: UserField) => (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const next = { ...form, [what]: event.target.value };

        setForm(next);
        onChange && onChange('user', next, initialErrors);
    }, [form, onChange, initialErrors]);

    // no record means the session is no longer good for anything — the class
    // version dropped the stored identity from `render`, which is a side effect
    // this app is better off performing after the render than during it
    useEffect(() => {
        if (!user) {
            AppStore.del(AUTH_KEY);
        }
    }, [user]);

    if (!user) {
        return <LinearProgress color="secondary"/>;
    }

    return <UserContainer>
        {errorList(allErrors)}
        <UserBox>
            <Avatar>
                <Gravatar user={user} size={160} editable/>
            </Avatar>
            <UserInfo>
                <UserName>
                    <TextField
                        id="first-name"
                        label="First Name"
                        value={form.firstName}
                        onChange={change('firstName')}
                        margin="normal"
                    />
                    <TextField
                        id="last-name"
                        label="Last Name"
                        value={form.lastName}
                        onChange={change('lastName')}
                        margin="normal"
                    />
                </UserName>
                <TextField
                    id="email"
                    label="Email"
                    value={form.email}
                    onChange={change('email')}
                    margin="normal"
                    // disabling e-mail change because it will cause
                    // current user token invalidation and will break
                    // current user view
                    disabled
                />
                <Stats>
                    <em>Cars in garage: {user.carsCount}</em>
                    <em>Bookings made: {0}</em>
                </Stats>
            </UserInfo>
        </UserBox>
    </UserContainer>;
}
