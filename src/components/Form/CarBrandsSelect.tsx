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
import { useMemo, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import { useLazyLoadQuery } from 'react-relay';
import { CarBrandsQuery } from '../../relay/queries';
// the generated operation type and the query node it describes share a name
import type { CarBrandsQuery as CarBrandsQueryType }
    from '../../relay/queries/__generated__/CarBrandsQuery.graphql';
import { SelectField, selectHandler } from './SelectStyle';

interface CarBrandsSelectProps {
    onChange?: (value: string) => void;
    /**
     * Accepted for uniformity with `CarModelSelect` — the brands select is
     * never disabled, so the flag is not used.
     */
    disabled?: boolean;
}

/**
 * Car make select, offering the brand list the gateway knows about.
 *
 * The brand list is fetched during render, so the two unhappy paths of that
 * request are the caller's business: render this inside a `<Suspense>` for the
 * pending state and inside an `ErrorBoundary` for the failed one.
 */
export function CarBrandsSelect(props: CarBrandsSelectProps) {
    const data = useLazyLoadQuery<CarBrandsQueryType>(CarBrandsQuery, {});
    const [brand, setBrand] = useState('');
    const select = useMemo(
        () => selectHandler(setBrand, props.onChange),
        [props.onChange],
    );
    const brands = (data.brands ?? [])
        .filter((item): item is string => !!item);

    return <SelectField
        id="car-make"
        select
        label="Make"
        fullWidth
        required
        value={brand}
        onChange={select}
        helperText="Please, select car make"
        margin="normal"
    >{brands.map(item => (
        <MenuItem key={item} value={item}>{item}</MenuItem>
    ))}</SelectField>;
}
