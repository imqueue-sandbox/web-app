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
import LocalCarWash from '@material-ui/icons/LocalCarWash';
import { removeCar } from '../relay/mutations';

/**
 * Car
 */
export default class UserCar extends Component {
    remove = () => {
        const carId = this.props.car && this.props.car.id;
        carId && removeCar({ carId });
    }

    render() {
        const { car } = this.props;

        return <div className="car">
            <LocalCarWash/>
            <div>{car.make}</div>
            <div>{car.model}</div>
            <div>{car.regNumber}</div>
            <button onClick={this.remove}>X</button>
        </div>;
    }
}
