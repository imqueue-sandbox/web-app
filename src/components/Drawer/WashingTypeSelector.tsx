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
import { useFragment } from 'react-relay';
import { styled } from '@mui/material/styles';
import Radio from '@mui/material/Radio';
import MuiRadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { OptionsFragment } from '../../relay/queries/fragments';
import { AppStore, SLOT_KEY } from '../../common';
import type { Options_options$key }
    from '../../relay/queries/fragments/__generated__/Options_options.graphql';

const Root = styled('div')({
    display: 'flex',
});

// `FormControl` renders as a `fieldset` here, and `styled()` drops the
// polymorphic `component` prop, so its single margin rule goes through `sx`
const formControlSx = { m: 3 } as const;

const RadioGroup = styled(MuiRadioGroup)(({ theme }) => ({
    margin: `${theme.spacing(1)} 0`,
}));

export interface WashingTypeSelectorProps {
    /** Fragment reference to the car-wash options. */
    options?: Options_options$key | null;
}

/**
 * Lets the user choose one of the washing types the car wash offers, storing
 * the duration of the chosen one in `AppStore` as the length of the time slot
 * to reserve.
 */
export function WashingTypeSelector(props: WashingTypeSelectorProps) {
    const options = useFragment<Options_options$key>(
        OptionsFragment,
        props.options ?? null,
    );
    const baseTime = options?.baseTime ?? [];
    const [value, setValue] = useState(
        () => AppStore.get<string>(SLOT_KEY) || '30',
    );

    const change = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        AppStore.set(SLOT_KEY, event.target.value);
        setValue(event.target.value);
    }, []);

    return <Root>
        <FormControl component="fieldset" sx={formControlSx}>
            <FormLabel component="legend">
                Choose preferred washing type
            </FormLabel>
            <RadioGroup
                aria-label="Choose preferred washing type"
                name="washing-type"
                value={value}
                onChange={change}
            >{baseTime.map((option, i) => option && <FormControlLabel
                key={option.key ?? i}
                value={`${option.duration ?? ''}`}
                control={<Radio />}
                label={option.title}
            />)}
            </RadioGroup>
        </FormControl>
    </Root>;
}
