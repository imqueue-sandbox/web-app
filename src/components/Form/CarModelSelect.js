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
import { PropTypes } from 'prop-types';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField/TextField';
import { withStyles } from '@material-ui/core';
import { withQuery, CarModelsQuery } from '../../relay/queries';
import SelectStyle, { selectHandler } from './SelectStyle';
import { carType } from '../../common';

const style = theme => (Object.assign(SelectStyle(theme), {
    carType: {
        color: '#777',
        fontSize: '.8em',
    },
}));

class CarModelSelect extends Component {
    state = {
        model: '',
    }

    select = selectHandler.bind(this)('model')

    render() {
        const { classes, data } = this.props;
        const { cars } = data;

        return <TextField
            id="car-model"
            fullWidth
            required
            select={true}
            disabled={this.props.disabled}
            label="Model"
            className={classes.textField}
            value={this.state.model}
            onChange={this.select}
            SelectProps={{MenuProps: {
                className: classes.menu,
            }}}
            helperText={this.props.brand
                ? "Please, select car model"
                : "Please, select car make first"
            }
            margin="normal"
        >
        {cars.map(car => {
            const [min, max] = [Math.min(...car.years), Math.max(...car.years)];
            const years = min !== max ? `${min} - ${max}` : max;

            return <MenuItem key={car.id} value={car.id}>
                {car.model} (<i>{years}</i>)
                <span className={classes.carType}>
                    &nbsp;&ndash;&nbsp;{carType(car.type)}
                </span>
            </MenuItem>
        })}
        </TextField>;
    }
}

CarModelSelect.propTypes = {
    classes: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired,
    brand: PropTypes.string.isRequired,
    onChange: PropTypes.func,
};

CarModelSelect = withStyles(style)(CarModelSelect);
CarModelSelect = withQuery(CarModelsQuery)(CarModelSelect);

export { CarModelSelect };
