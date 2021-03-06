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
import classNames from 'classnames';
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
import { clone, withoutElement } from '../../common';
import { addCar } from '../../relay/mutations';

const styles = () => ({
    carForm: {
        paddingRight: 40,
        overflow: 'hidden',
    },
    error: {
        flexGrow: 0,
        margin: '0 20px',
    },
    regNumber: {
        '& input': {
            textTransform: 'uppercase',
        },
    },
});

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

export class AddCarDialog extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        fullScreen: PropTypes.bool.isRequired,
        userId: PropTypes.string.isRequired,
    };

    state = {
        loading: false,
        open: false,
        brand: '',
        model: '',
        regNumber: '',
        errors: [],
    };

    initialState = clone(this.state);

    close = () => {
        this.setState({ open: false });
    };

    open = () => {
        this.setState({
            ...this.initialState,
            open: true,
        });
    };

    errorClose = (i) => () => {
        this.setState({ errors: withoutElement(this.state.errors, i) });
    };

    select = (what) => {
        switch (what) {
            case 'brand':
                return (brand) => this.setState({ brand });
            case 'model':
                return (model) => this.setState({ model });
            default:
                return () => false;
        }
    };

    addCar = () => {
        addCar({
            idOrEmail: this.props.userId,
            carId: this.state.model,
            regNumber: this.state.regNumber
        }, this.close, errors => this.setState({ errors }));
    };

    render() {
        const { fullScreen, classes } = this.props;

        return (<>
            <Button onClick={this.open}><Add/>&nbsp;Add car</Button>
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
                    className={!this.state.loading ? "invisible" : ""}
                />
                {this.state.errors.length > 0 &&
                 this.state.errors.map((error, i) =>
                    <AppMessage
                        className={classes.error}
                        key={i}
                        variant="error"
                        message={error.message}
                        onClose={this.errorClose(i)}
                    />
                )}
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
                        className={classNames(
                            classes.textField,
                            classes.regNumber,
                        )}
                        margin="normal"
                        value={this.state.regNumber}
                        onChange={(event) => this.setState({
                            regNumber: event.target.value
                        })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.close}><Clear/> Cancel</Button>
                    <Button
                        disabled={!(
                            this.state.brand &&
                            this.state.model &&
                            this.state.regNumber
                        )}
                        onClick={this.addCar}
                        autoFocus
                    ><Done/> Add</Button>
                </DialogActions>
            </Dialog>
        </>);
    }
}

AddCarDialog = withMobileDialog()(AddCarDialog);
AddCarDialog = withStyles(styles)(AddCarDialog);
