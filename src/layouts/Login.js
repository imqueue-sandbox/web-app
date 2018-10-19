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
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withStyles } from "@material-ui/core";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import LockOpen from '@material-ui/icons/LockOpen';
import NotInterested from '@material-ui/icons/NotInterested';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Visibility from '@material-ui/icons/Visibility';
import PersonAdd from '@material-ui/icons/PersonAdd';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
import green from '@material-ui/core/colors/green';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import { login, register } from '../relay/mutations/index';
import { AppMessage } from '../components';
import { clone, uuid } from '../common';

const styles = () => ({
    buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
});

/**
 * Login page layout component - displays login form
 */
class Login extends PureComponent {
    /**
     * Initializes component
     *
     * @constructor
     * @param {*} props
     */
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            errors: [],
            canSubmit: false,
            canReset: false,
            shrink: false,
            showPassword: false,
            wrongPassword: '',
            wrongEmail: '',
            wrongFirstName: '',
            wrongLastName: '',
            isRegForm: false,
            inProgress: false,
        };

        this.initialState = clone(this.state);
    }

    /**
     * handling component insertion into DOM
     */
    componentDidMount() {
        window.requestAnimationFrame(() => {
            const node = ReactDOM.findDOMNode(this);

            if (node) {
                const onAutoFillStart = () => {
                    this.setState({
                        shrink: true,
                        ...this.checkActions(this.state)
                    });
                }
                const onAnimationStart = ({ target, animationName }) => {
                    if (animationName === 'onAutoFillStart') {
                        return onAutoFillStart(target);
                    }
                };

                document.querySelectorAll('input').forEach(el =>
                    el.addEventListener(
                        'animationstart',
                        onAnimationStart,
                        false
                    )
                );
            }
        });
    }

    /**
     * Handles close login dialog box. Actually it exists specially to prevent
     * close behavior
     *
     * @return {boolean}
     */
    handleClose = () => false;

    /**
     * Returns error messages mapped to state fields
     *
     * @param {Error[]} errors
     * @return {*}
     */
    mapErrors(errors) {
        return errors.reduce((prev, next) => {
            const key = ((next.extensions || {}).code || '')
                .replace(/^user_|_error$/i)
                .split('_')
                .map((part, i) => i
                    ? part.substr(0, 1) + part.substr(1).toLowerCase()
                    : part.toLowerCase()
                );

            return Object.assign(prev, { [key]: next.message });
        }, {});
    }

    /**
     * Performs login action
     */
    login = () => {
        this.setState({ inProgress: true })
        login(this.state,
            () => this.setState({ inProgress: false }),
            (errors) => this.setState({
                ...this.mapErrors(errors),
                errors: errors,
                inProgress: false
            }),
        );
    }

    /**
     * Performs new user registration action
     */
    register = () => {
        const { firstName, lastName, email, password } = this.state;

        this.setState({ inProgress: true });

        register(
            { firstName, lastName, email, password, isActive: true },
            (data) => {
                let state = { // come back to login form
                    ...this.initialState,
                    email: data.user.email,
                    shrink: true,
                    inProgress: false,
                };
                state = { ...state, ...this.checkActions(state) };
                this.setState(state);
            },
            (errors) => this.setState({ // display errors
                ...this.mapErrors(errors),
                errors: errors,
                inProgress: false,
            }),
        );
    }

    /**
     * Resets the login form to initial state
     */
    reset = () => {
        const newState = clone(this.initialState);
        newState.isRegForm = this.state.isRegForm;
        this.setState(newState);
    }

    /**
     * Clears errors off
     */
    clearErrors = () => this.setState({ errors: [] });

    /**
     * Returns flags for button state actions build from a given state
     *
     * @param {*} state
     * @return {{canReset: boolean, canSubmit: boolean}}
     */
    checkActions = (state) => {
        const canReset = !!(state.email || state.password ||
            state.errors.length || state.firstName || state.lastName);
        const canSubmit = !!(state.isRegForm
            ? state.email && state.password && state.firstName &&
            state.lastName
            : state.email && state.password);

        return { canReset, canSubmit };
    }

    /**
     * Handles changes on a form fields and updates local state
     *
     * @param {string} name - field name
     * @param {CustomEvent} event - react event
     */
    handleChange = (name, event) => {
        let newState = {...this.state, [name]: event.target.value };
        newState = { ...newState, ...this.checkActions(newState) };
        this.setState(newState);
    }

    /**
     * Handles show password button click
     */
    handleClickShowPassword = () => {
        this.setState({ showPassword: !this.state.showPassword });
    }

    /**
     * Handles switch to login form link click
     */
    handleLoginFormClick = () => {
        this.setState({
            isRegForm: false,
            ...this.checkActions(this.state)
        });
    }

    /**
     * Handles registration link click
     */
    handleRegistrationClick = () => {
        this.setState({
            isRegForm: true,
            ...this.checkActions(this.state)
        });
    }

    render() {
        const { fullScreen } = this.props;

        return <Dialog
            fullScreen={fullScreen}
            open={true}
            onClose={this.handleClose}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">{
                this.state.isRegForm
                    ? "Customer Registration"
                    : "Customer Login"
            }</DialogTitle>
            <LinearProgress color="secondary" className={
                this.state.inProgress ? "" : "invisible"
            } />
            <DialogContent className="login-content">
                {this.state.errors.map(error =>
                    <AppMessage
                        className="app-message"
                        variant="error"
                        message={error.message}
                        onClose={this.clearErrors}
                        key={(error.extensions || {}).code || uuid()}
                    />)
                }
                <TextField
                    id="email"
                    error={!!this.state.wrongEmail}
                    required
                    label="E-mail"
                    fullWidth
                    type="email"
                    name="email"
                    autoComplete="email"
                    margin="normal"
                    variant="outlined"
                    value={this.state.email}
                    InputLabelProps={{
                        shrink: this.state.shrink || !!this.state.email
                    }}
                    onChange={this.handleChange.bind(this, 'email')}
                />
                <TextField
                    id="password"
                    required
                    error={!!this.state.wrongPassword}
                    label="Password"
                    fullWidth
                    type={this.state.showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    margin="normal"
                    variant="outlined"
                    className="adornment-end"
                    value={this.state.password}
                    InputLabelProps={{
                        shrink: this.state.shrink || !!this.state.password
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="Toggle password visibility"
                                    onClick={this.handleClickShowPassword}
                                >
                                    {this.state.showPassword
                                        ? <VisibilityOff />
                                        : <Visibility />
                                    }
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    onChange={this.handleChange.bind(this, 'password')}
                />
                {this.state.isRegForm && (<>
                    <TextField
                        id="firstName"
                        error={!!this.state.wrongFirstName}
                        required
                        label="First Name"
                        fullWidth
                        type="text"
                        name="firstName"
                        autoComplete="firstName"
                        margin="normal"
                        variant="outlined"
                        value={this.state.firstName}
                        InputLabelProps={{
                            shrink: this.state.shrink || !!this.state.firstName
                        }}
                        onChange={this.handleChange.bind(this, 'firstName')}
                    />
                    <TextField
                        id="lastName"
                        error={!!this.state.wrongFirstName}
                        required
                        label="Last Name"
                        fullWidth
                        type="text"
                        name="lastName"
                        autoComplete="lastName"
                        margin="normal"
                        variant="outlined"
                        value={this.state.lastName}
                        InputLabelProps={{
                            shrink: this.state.shrink || !!this.state.lastName
                        }}
                        onChange={this.handleChange.bind(this, 'lastName')}
                    />
                </>)}
            </DialogContent>
            <DialogActions className="left-right login-actions">
                <button
                    className="link-button left"
                    onClick={this.state.isRegForm
                        ? this.handleLoginFormClick
                        : this.handleRegistrationClick}
                >
                    {this.state.isRegForm
                        ? "I have an account"
                        : "Need an account?"
                    }
                </button>
                <Button
                    variant={fullScreen ? "text" : "contained"}
                    onClick={this.reset}
                    color="default"
                    size={"large"}
                    disabled={!this.state.canReset}
                >
                    Reset
                    <NotInterested />
                </Button>
                <Button
                    variant={fullScreen ? "text" : "contained"}
                    onClick={this.state.isRegForm
                        ? this.register
                        : this.login}
                    color="primary"
                    autoFocus
                    size={"large"}
                    disabled={!this.state.canSubmit || this.state.inProgress}
                >
                    {this.state.isRegForm
                        ? <>Register <PersonAdd /></>
                        : <>Login <LockOpen /></>
                    }
                    {this.state.inProgress &&
                        <CircularProgress
                            size={24}
                            className={this.props.classes.buttonProgress}
                        />
                    }
                </Button>
            </DialogActions>
        </Dialog>
    }
}

Login.propTypes = {
    fullScreen: PropTypes.bool.isRequired,
};

Login = withMobileDialog()(withStyles(styles)(Login));

export { Login };
