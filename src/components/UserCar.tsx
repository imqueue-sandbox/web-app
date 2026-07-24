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
import MuiCard from '@mui/material/Card';
import MuiCardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import MuiCardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import MuiLocalCarWash from '@mui/icons-material/LocalCarWash';
import Delete from '@mui/icons-material/Delete';
import { useRemoveCar } from '../relay/mutations';
import { carType } from '../common';
import type { UserCars$data }
    from '../relay/queries/fragments/__generated__/UserCars.graphql';

/**
 * A single car in the user's garage, as the `UserCars` fragment selects it.
 *
 * Every component dealing with one stored car shares this type — the drawer's
 * car selector and whatever reads the car back out of `AppStore` included.
 */
export type GarageCar = NonNullable<NonNullable<UserCars$data['cars']>[number]>;

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    minWidth: '30em',
}));

const Details = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    textAlign: 'center',
});

const CardContent = styled(MuiCardContent)({
    flex: '1 0 auto',
    paddingBottom: 0,
    padding: 0,
    margin: 0,
});

const Controls = styled(MuiCardActions)(({ theme }) => ({
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    justifyContent: 'flex-start',
}));

const LocalCarWash = styled(MuiLocalCarWash)({
    height: 'initial !important',
    width: '3em',
    background: '#333',
    alignSelf: 'stretch',
    padding: '0 1em 0 1em',
    color: '#fff',
});

const CarNumber = styled(Typography)({
    fontSize: '1em',
    marginTop: '.5em',
    fontWeight: 'bold',
    '& span': {
        display: 'inline-block',
        border: '.2rem solid #666',
        borderRadius: '.5em',
        padding: '.2em .5em',
        textTransform: 'uppercase',
    },
});

const CarModel = styled(Typography)({
    fontSize: '1.3em',
    marginTop: '1.2em',
});

const CarType = styled(Typography)({
    fontSize: '.9em',
    color: '#777',
});

export interface UserCarProps {
    /** The car to render — the fragment selects it as nullable. */
    car?: GarageCar | null;
}

/** One card of the garage, with the control removing that car from it. */
export function UserCar({ car }: UserCarProps) {
    const [removeCar] = useRemoveCar();
    const remove = useCallback(() => {
        const carId = car && car.id;

        carId && removeCar({ carId });
    }, [car, removeCar]);

    return <Card>
        <LocalCarWash/>
        <Details>
            <CardContent>
                <CarModel>
                    <b>{car?.make}</b><br/>
                    <i>{car?.model}</i>
                </CarModel>
                <CarType>
                    {carType(car?.type ?? undefined)}
                </CarType>
                <CarNumber>
                    <span>{car?.regNumber}</span>
                </CarNumber>
            </CardContent>
            <Controls>
                <IconButton
                    onClick={remove}
                    title="Remove this car from garage"
                >
                    <Delete/>
                </IconButton>
            </Controls>
        </Details>
    </Card>;
}
