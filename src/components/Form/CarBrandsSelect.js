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
import PropTypes from 'prop-types';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField/TextField';
import { withStyles } from '@material-ui/core';
import { CarBrandsQuery, withQuery } from '../../relay/queries';
import { SelectStyle, selectHandler } from './SelectStyle';

class CarBrandsSelect extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        data: PropTypes.object.isRequired,
        onChange: PropTypes.func,
    };

    state = {
        brand: '',
    };

    select = selectHandler.bind(this)('brand');

    render() {
        const { classes, data } = this.props;
        const { brands } = data;

        return <TextField
            id="car-make"
            select={true}
            label="Make"
            fullWidth
            required
            className={classes.textField}
            value={this.state.brand}
            onChange={this.select}
            SelectProps={{MenuProps: {
                className: classes.menu,
            }}}
            helperText="Please, select car make"
            margin="normal"
        >{brands.map((brand, i) => (
            <MenuItem key={i} value={brand}>{brand}</MenuItem>
        ))}</TextField>;
    }
}

CarBrandsSelect = withStyles(SelectStyle)(CarBrandsSelect);
CarBrandsSelect = withQuery(CarBrandsQuery)(CarBrandsSelect);

export { CarBrandsSelect };
