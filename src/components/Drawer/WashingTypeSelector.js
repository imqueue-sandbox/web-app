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
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { createFragmentContainer } from 'react-relay';
import { OptionsFragment } from '../../relay/queries/fragments';
import { AppStore, SLOT_KEY } from '../../common';

const styles = theme => ({
    root: {
        display: 'flex',
    },
    formControl: {
        margin: theme.spacing.unit * 3,
    },
    group: {
        margin: `${theme.spacing.unit}px 0`,
    },
});

export class WashingTypeSelector extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        options: PropTypes.object.isRequired,
    };

    state = {
        value: AppStore.get(SLOT_KEY) || '30',
    };

    change = (event) => {
        AppStore.set(SLOT_KEY, event.target.value);
        this.setState({ value: event.target.value });
    }

    render() {
        const { classes, options } = this.props;
        const baseTime = (options || {}).baseTime || [];

        return <div className={classes.root}>
            <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel component="legend">
                    Choose preferred washing type
                </FormLabel>
                <RadioGroup
                    aria-label="Choose preferred washing type"
                    name="washing-type"
                    className={classes.group}
                    value={this.state.value}
                    onChange={this.change}
                >{baseTime && baseTime.length && baseTime.map(option =>
                    <FormControlLabel
                        key={option.key}
                        value={option.duration+''}
                        control={<Radio />}
                        label={option.title}
                    />
                )}
                </RadioGroup>
            </FormControl>
        </div>;
    }
}

WashingTypeSelector = withStyles(styles)(WashingTypeSelector);
WashingTypeSelector = createFragmentContainer(
    WashingTypeSelector,
    OptionsFragment,
);
