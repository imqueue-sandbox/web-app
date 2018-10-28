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
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Slide from '@material-ui/core/Slide';
import Add from '@material-ui/icons/Add';
import Clear from '@material-ui/icons/Clear';
import Done from '@material-ui/icons/Done';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles } from '@material-ui/core';
import { CarModelSelect, CarBrandsSelect } from '../Form';
import { AppMessage } from '../AppMessage';
import { clone } from '../../common';

const styles = theme => ({
    carForm: {
        paddingRight: 40,
        overflow: 'hidden',
    },
    carActions: {
    },
    invisible: {
        visibility: 'hidden',
    },
});

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class AddCar extends Component {

    state = {
        loading: false,
        open: false,
        brand: '',
        model: '',
        regNumber: ''
    }

    initialState = clone(this.state)

    close = () => {
        this.setState({ open: false });
    }

    open = () => {
        this.setState({
            ...this.initialState,
            open: true,
        });
    }

    select = (what) => {
        switch (what) {
            case 'brand':
                return (brand) => this.setState({ brand });
            case 'model':
                return (model) => this.setState({ model });
            default:
                return () => false;
        }
    }

    addCar = () => {
        this.close();
    }

    render() {
        const { fullScreen, classes } = this.props;

        return (<>
            <Button onClick={this.open}><Add/> Add car</Button>
            <Dialog
                fullScreen={fullScreen}
                TransitionComponent={Transition}
                open={this.state.open}
                onClose={this.close}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                    Choose your car
                </DialogTitle>
                <LinearProgress
                    color="secondary"
                    className={!this.state.loading ? classes.invisible : ''}
                />
                <DialogContent className={classes.carForm}>
                    <CarBrandsSelect
                        childProps={{
                            onChange: this.select('brand'),
                            disabled: this.state.loading,
                        }}
                        onError={error => <AppMessage
                            message={error.message}
                            variant="error"
                        />}
                    />
                    <CarModelSelect
                        childProps={{
                            onChange: this.select('model'),
                            disabled: !this.state.brand || this.state.loading,
                            brand: this.state.brand,
                        }}
                        vars={{ brand: this.state.brand }}
                    />
                    <TextField
                        fullWidth
                        required={true}
                        id="car-reg-number"
                        label="Car registration number"
                        className={classes.textField}
                        margin="normal"
                        value={this.state.regNumber}
                        onChange={(event) => this.setState({
                            regNumber: event.target.value
                        })}
                    />
                </DialogContent>
                <DialogActions className={classes.carActions}>
                    <Button
                        onClick={this.close}
                        color="primary"
                    ><Clear/> Cancel</Button>
                    <Button
                        disabled={!(
                            this.state.brand &&
                            this.state.model &&
                            this.state.regNumber
                        )}
                        onClick={this.addCar}
                        autoFocus
                        color="primary"
                    ><Done/> Add</Button>
                </DialogActions>
            </Dialog>
        </>);
    }
}

AddCar.propTypes = {
    classes: PropTypes.object.isRequired,
    fullScreen: PropTypes.bool.isRequired,
    userId: PropTypes.string.isRequired,
};

AddCar = withMobileDialog()(AddCar);
AddCar = withStyles(styles)(AddCar);

export { AddCar };
