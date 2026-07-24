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
import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import MuiFormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import { styled } from '@mui/material/styles';
import type { updateUserInput }
    from '../../relay/mutations/__generated__/updateUserMutation.graphql';
import type { AppError } from '../../types';
// straight at the siblings rather than back through the barrel this module is
// itself re-exported from, which would make the two files import each other
import { errorList } from './errors';
import { PasswordEye } from './PasswordEye';

const PasswordForm = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
});

/**
 * The two password inputs were given the margin and the width rule as two
 * separate class names joined with `classNames`; there is nothing left to
 * choose between them, so they are one rule set now.
 */
const FormControl = styled(MuiFormControl)(({ theme }) => ({
    margin: theme.spacing(1),
    maxWidth: '30em',
}));

/** Which of the two password fields a change came from. */
type PasswordField = 'oldPassword' | 'newPassword';

interface SecurityProps {
    onChange?: (
        type: string,
        data: updateUserInput,
        errors?: AppError[],
    ) => void;
    errors?: AppError[];
}

/**
 * Password change form of the profile view. It owns no submit control of its
 * own: every keystroke is reported through `onChange`, and the view decides
 * when the pair is complete enough to save.
 */
export function Security(props: SecurityProps) {
    const { errors, onChange } = props;
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const toggleOld = useCallback(() => setShowOld(shown => !shown), []);
    const toggleNew = useCallback(() => setShowNew(shown => !shown), []);
    // the class version reported the pair from a `setState` callback, to be
    // sure it read the stored value rather than the one it replaced; the new
    // value is simply at hand here
    const change = useCallback((which: PasswordField) => (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const value = event.target.value;

        if (which === 'oldPassword') {
            setOldPassword(value);
        } else {
            setNewPassword(value);
        }

        onChange && onChange('password', {
            password: which === 'newPassword' ? value : newPassword,
            oldPassword: which === 'oldPassword' ? value : oldPassword,
        });
    }, [oldPassword, newPassword, onChange]);

    return <PasswordForm>
        {errorList(errors)}
        <FormControl>
            <InputLabel htmlFor="adornment-password">
                Current Password
            </InputLabel>
            <Input
                id="old-password"
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={change('oldPassword')}
                endAdornment={<PasswordEye
                    onClick={toggleOld}
                    enabled={showOld}
                />}
            />
        </FormControl>

        <FormControl>
            <InputLabel htmlFor="adornment-password">
                New Password
            </InputLabel>
            <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={change('newPassword')}
                endAdornment={<PasswordEye
                    onClick={toggleNew}
                    enabled={showNew}
                />}
            />
        </FormControl>
    </PasswordForm>;
}
