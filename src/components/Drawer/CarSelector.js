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
import { createFragmentContainer } from 'react-relay';
import { PropTypes } from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core';
import TextField from "@material-ui/core/TextField/TextField";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import { SelectStyle} from '../Form';
import { UserCarsFragment } from '../../relay/queries/fragments';
import {AppStore, CAR_KEY, carType, PROFILE_PANEL_KEY} from '../../common';

const style = theme => (Object.assign(SelectStyle(theme), {
    carsSelector: {
        marginTop: 40,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    carType: {
        color: '#777',
        fontSize: '.8em',
    },
    userCars: {
        margin: '0 25px',
    },
    garageLink: {
        marginLeft: 30,
        fontSize: '.9em',
    },
}));

export class CarSelector extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        onChange: PropTypes.func,
    };

    state = {
        carId: (AppStore.get(CAR_KEY) || { id: '' }).id,
    };

    select = cars => event => {
        const car = cars.find(car => car.id === event.target.value);
        this.setState(
            { carId: event.target.value },
            () => AppStore.set(CAR_KEY, car),
        );
    };

    openGarage = () => {
        AppStore.set(PROFILE_PANEL_KEY, 2);
        return true;
    };

    componentDidMount() {
        if (!this.state.carId) {
            const car = (this.props.data.cars || [])[0] || null;
            const carId = car ? car.id : '';

            this.setState({ carId }, () => AppStore.set(CAR_KEY, car));
        }
    }

    render() {
        const { classes, data } = this.props;
        const { cars } = data || { cars: [] };

        return <div className={classes.carsSelector}>{cars && cars.length
            ? <TextField
                id="car-model"
                select={true}
                label="Choose your car to wash"
                className={classNames(classes.textField, classes.userCars)}
                value={this.state.carId}
                onChange={this.select(cars)}
                SelectProps={{MenuProps: {
                    className: classes.menu,
                }}}
                margin="normal"
            >
                {cars.map(car => {
                    return <MenuItem key={car.id} value={car.id}>
                        {car.make}&nbsp;<em>{car.model}</em>
                        <span className={classes.carType}>
                            &nbsp;&ndash;&nbsp;{carType(car.type)}
                        </span>
                    </MenuItem>
                })}
            </TextField>
            : <Link
                to="/profile"
                className={classes.garageLink}
                onClick={this.openGarage}
            >Add cars to your garage first</Link>}
        </div>;
    }
}

CarSelector = withStyles(style)(CarSelector);
CarSelector = createFragmentContainer(CarSelector, UserCarsFragment);
