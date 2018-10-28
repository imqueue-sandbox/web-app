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

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    menu: {
    },
});

class CarBrandsSelect extends Component {
    state = {
        brand: '',
        brands: [],
    }

    select = (event) => {
        this.setState({ brand: event.target.value });
        this.props.onChange && this.props.onChange(event.target.value);
    }

    render() {
        const { classes } = this.props;

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
        >
        {this.state.brands.map(option => (
            <MenuItem key={option.value} value={option.value}>
                {option.label}
            </MenuItem>
        ))}
        </TextField>;
    }
}

CarBrandsSelect.propTypes = {
    classes: PropTypes.object.isRequired,
    onChange: PropTypes.func,
};

CarBrandsSelect = withStyles(styles)(CarBrandsSelect);

export { CarBrandsSelect };
