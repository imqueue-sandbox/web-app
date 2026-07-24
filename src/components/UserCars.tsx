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
import { useFragment } from 'react-relay';
import { styled } from '@mui/material/styles';
import { UserCar } from '.';
import { UserCarsFragment } from '../relay/queries';
import type { UserCars$key }
    from '../relay/queries/fragments/__generated__/UserCars.graphql';

const Cars = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'flex-start',
    flexWrap: 'wrap',
    fontSize: 14,
});

export interface UserCarsProps {
    /** Fragment reference to the user owning the garage. */
    data?: UserCars$key | null;
}

/** The user's garage: one {@link UserCar} card per car they own. */
export function UserCars(props: UserCarsProps) {
    const data = useFragment<UserCars$key>(
        UserCarsFragment,
        props.data ?? null,
    );
    const cars = data?.cars ?? [];

    return <Cars>
        {cars.map((car, i) => <UserCar key={i} car={car}/>)}
    </Cars>;
}
