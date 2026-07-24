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
import type { ChangeEvent } from 'react';
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

/**
 * The rule every select of this app shares: a one-unit horizontal inset, so
 * that a select lines up with the text fields around it.
 *
 * Kept as an `sx` object next to the ready-made {@link SelectField} below, for
 * a select that needs rules of its own on the very same element and therefore
 * cannot just take the component — `sx` merges as an array:
 *
 * ```tsx
 * <TextField select sx={[SelectStyle, { margin: '0 25px' }]}/>
 * ```
 *
 * The style set this replaces also declared an empty `menu` rule set, attached
 * to the drop-down through `slotProps.select.MenuProps.className`. It generated
 * a class name carrying no declarations at all, so it is gone along with the
 * `slotProps` plumbing that delivered it.
 */
export const SelectStyle: SxProps<Theme> = {
    marginLeft: 1,
    marginRight: 1,
};

/**
 * A `TextField` carrying {@link SelectStyle} — what the selects of this
 * directory render. Pass `select` to turn it into a drop-down, as `TextField`
 * itself requires.
 */
export const SelectField = styled(TextField)(({ theme }) => ({
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
}));

/**
 * Builds the `onChange` handler of a select: it hands the picked value to
 * `setValue` and then reports it to the owner through the optional `onChange`
 * callback.
 *
 * The class version of this helper was bound to a component and reached for
 * `this.setState`/`this.props`; it now takes both collaborators as arguments,
 * which is all a function component has to give it:
 *
 * ```tsx
 * const [brand, setBrand] = useState('');
 * const select = useMemo(
 *     () => selectHandler(setBrand, props.onChange),
 *     [props.onChange],
 * );
 * ```
 *
 * `useMemo` rather than `useCallback`, because the handler is the *result* of
 * calling this function — a `useState` setter is stable, so the handler only
 * has to be rebuilt when the reported callback changes.
 *
 * @param setValue - stores the picked value (a `useState` setter, typically)
 * @param onChange - notified with the picked value, when given
 * @return the change handler to hand to the select
 */
export function selectHandler(
    setValue: (value: string) => void,
    onChange?: (value: string) => void,
): (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void {
    return (event) => {
        setValue(event.target.value);
        onChange && onChange(event.target.value);
    };
}
