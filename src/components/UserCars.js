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
import React, { Component } from 'react';
import UserCar from './UserCar';
import { createFragmentContainer } from 'react-relay';
import { UserCarsFragment } from '../relay/queries';

/**
 * Cars
 */
class UserCars extends Component {
    render() {
        const { data } = this.props;
        const cars = data.user ? data.user.cars : [];

        if (cars) {
            return <div className="cars">
                {cars.map(car => <UserCar key={car.id} car={car}/>)}
            </div>;
        }

        else {
            return <div>No cars in garage</div>
        }
    }
}

UserCars = createFragmentContainer(UserCars, UserCarsFragment);

export default UserCars;
