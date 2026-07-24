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
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import MuiTextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { UserCarsFragment } from '../../relay/queries/fragments';
import { AppStore, CAR_KEY, carType, PROFILE_PANEL_KEY } from '../../common';
import type { GarageCar } from '../UserCar';
import type { UserCars$key }
    from '../../relay/queries/fragments/__generated__/UserCars.graphql';

const CarsSelector = styled('div')({
    marginTop: 40,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
});

// the original combined the shared `textField` rule with its own `userCars`
// one, where the margin shorthand of the latter overrode the horizontal
// margins of the former
const UserCarsField = styled(MuiTextField)({
    margin: '0 25px',
});

const CarType = styled('span')({
    color: '#777',
    fontSize: '.8em',
});

const GarageLink = styled(Link)({
    marginLeft: 30,
    fontSize: '.9em',
});

export interface CarSelectorProps {
    /** Fragment reference to the user owning the garage. */
    data?: UserCars$key | null;
    /**
     * Accepted for compatibility with the other selects of the app. The choice
     * is published through `AppStore` rather than through a callback, so this
     * is not invoked — as it was not before.
     */
    onChange?: (value: string) => void;
}

/**
 * Lets the user choose which of their cars is going to be washed, remembering
 * the choice in `AppStore` so the rest of the app can read it back.
 *
 * With an empty garage there is nothing to choose from, so a link to the
 * profile view is offered instead.
 */
export function CarSelector(props: CarSelectorProps) {
    const data = useFragment<UserCars$key>(
        UserCarsFragment,
        props.data ?? null,
    );
    // the fragment data is stable between renders, a fresh fallback array is
    // not — keeping the identity stable keeps the pre-selection effect quiet;
    // the cars the fragment selects as `null` cannot be offered for selection
    const cars = useMemo(
        () => (data?.cars ?? []).filter((car): car is GarageCar => !!car),
        [data?.cars],
    );
    const [carId, setCarId] = useState(
        () => AppStore.get<GarageCar>(CAR_KEY)?.id ?? '',
    );

    // nothing chosen yet: fall back to the first car of the garage
    useEffect(() => {
        if (carId) {
            return;
        }

        const car = cars[0] ?? null;

        setCarId(car?.id ?? '');
        AppStore.set(CAR_KEY, car);
    }, [carId, cars]);

    const select = useCallback((
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { value } = event.target;

        setCarId(value);
        AppStore.set(CAR_KEY, cars.find(car => car.id === value) ?? null);
    }, [cars]);

    const openGarage = useCallback(() => {
        AppStore.set(PROFILE_PANEL_KEY, 2);

        return true;
    }, []);

    return <CarsSelector>{cars.length
        ? <UserCarsField
            id="car-model"
            select={true}
            label="Choose your car to wash"
            value={carId}
            onChange={select}
            margin="normal"
        >
            {cars.map(car => <MenuItem key={car.id} value={car.id}>
                {car.make}&nbsp;<em>{car.model}</em>
                <CarType>
                    &nbsp;&ndash;&nbsp;{carType(car.type ?? undefined)}
                </CarType>
            </MenuItem>)}
        </UserCarsField>
        : <GarageLink
            to="/profile"
            onClick={openGarage}
        >Add cars to your garage first</GarageLink>}
    </CarsSelector>;
}
