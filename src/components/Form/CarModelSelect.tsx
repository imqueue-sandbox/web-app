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
import type { ChangeEvent } from 'react';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { useLazyLoadQuery } from 'react-relay';
import { carType } from '../../common';
import { CarModelsQuery } from '../../relay/queries';
// the generated operation type and the query node it describes share a name
import type {
    CarModelsQuery as CarModelsQueryType,
    CarModelsQuery$data,
} from '../../relay/queries/__generated__/CarModelsQuery.graphql';
import { SelectField, selectHandler } from './SelectStyle';

/** The car class shown in grey next to a model name. */
const CarTypeHint = styled('span')({
    color: '#777',
    fontSize: '.8em',
});

/** A single car model, as `CarModelsQuery` selects it. */
type CarModel = NonNullable<NonNullable<CarModelsQuery$data['cars']>[number]>;

interface CarModelSelectProps {
    /**
     * Make whose models to offer. While it is empty nothing is loaded and the
     * select stays empty, asking for a make first.
     */
    brand: string;
    disabled: boolean;
    onChange?: (value: string) => void;
}

/** The select itself — the same markup for both branches of the guard below. */
interface ModelSelectProps {
    cars: readonly CarModel[];
    brand: string;
    disabled: boolean;
    value: string;
    onChange: (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
}

function ModelSelect(props: ModelSelectProps) {
    return <SelectField
        id="car-model"
        fullWidth
        required
        select
        disabled={props.disabled}
        label="Model"
        value={props.value}
        onChange={props.onChange}
        helperText={props.brand
            ? 'Please, select car model'
            : 'Please, select car make first'
        }
        margin="normal"
    >
    {props.cars.map(car => {
        const years = (car.years ?? [])
            .filter((year): year is number => typeof year === 'number');
        const [min, max] = [Math.min(...years), Math.max(...years)];
        const range = min !== max ? `${min} - ${max}` : max;

        return <MenuItem key={car.id} value={car.id}>
            {car.model} (<i>{range}</i>)
            <CarTypeHint>
                &nbsp;&ndash;&nbsp;{carType(car.type ?? undefined)}
            </CarTypeHint>
        </MenuItem>;
    })}
    </SelectField>;
}

/**
 * Loads the models of a make and offers them.
 *
 * The query lives here rather than in `CarModelSelect` itself because a hook
 * cannot be called conditionally: keeping it in a component the guard below
 * only renders once a make is known is what stops a request going out for an
 * empty brand.
 */
function BrandModels(props: Omit<ModelSelectProps, 'cars'>) {
    const data = useLazyLoadQuery<CarModelsQueryType>(CarModelsQuery, {
        brand: props.brand,
    });
    const cars = (data.cars ?? [])
        .filter((car): car is CarModel => !!car);

    return <ModelSelect {...props} cars={cars}/>;
}

/**
 * Car model select, offering the models of the given make.
 *
 * Nothing is loaded until a make is picked. Once one is, the models are fetched
 * during render, so the caller owns the pending and failed states: render this
 * inside a `<Suspense>` and an `ErrorBoundary`.
 */
export function CarModelSelect(props: CarModelSelectProps) {
    const [model, setModel] = useState('');
    const select = useMemo(
        () => selectHandler(setModel, props.onChange),
        [props.onChange],
    );
    const selectProps = {
        brand: props.brand,
        disabled: props.disabled,
        value: model,
        onChange: select,
    };

    return props.brand
        ? <BrandModels {...selectProps}/>
        : <ModelSelect {...selectProps} cars={[]}/>;
}
