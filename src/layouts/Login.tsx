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
import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import MuiCircularProgress from '@mui/material/CircularProgress';
import LockOpen from '@mui/icons-material/LockOpen';
import NotInterested from '@mui/icons-material/NotInterested';
import PersonAdd from '@mui/icons-material/PersonAdd';
import { green } from '@mui/material/colors';
import { APP_API_PROTOCOL } from '../config';
import { useLogin, useRegister } from '../relay/mutations';
import type { RegisterPayload } from '../relay/mutations';
import { AppMessage, PasswordEye } from '../components';
import { withoutElement } from '../common';
import type { AppError } from '../types';

const ButtonProgress = styled(MuiCircularProgress)({
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
});

const ActionButton = styled(Button)({
    backgroundColor: '#333',
    color: '#fff',
    '& :hover': {
        color: '#333',
    },
});

/** Per-input error messages, keyed by the input they belong to. */
interface FieldErrors {
    wrongEmail?: string;
    wrongPassword?: string;
    wrongFirstName?: string;
    wrongLastName?: string;
}

/**
 * The only keys an error code may be mapped onto. A code naming anything else
 * belongs to no input of this form and is dropped.
 */
const FIELD_ERROR_KEYS = [
    'wrongEmail',
    'wrongPassword',
    'wrongFirstName',
    'wrongLastName',
] as const satisfies ReadonlyArray<keyof FieldErrors>;

/** Name of a {@link FieldErrors} member. */
type FieldErrorKey = typeof FIELD_ERROR_KEYS[number];

/**
 * Maps a machine-readable gateway error code onto the input it complains
 * about: `USER_FIRST_NAME_ERROR` becomes `wrongFirstName`, by dropping the
 * `USER_` prefix and the `_ERROR` suffix, PascalCasing what is left and
 * prefixing it with `wrong`.
 *
 * Codes which name no input of this form - `USER_LOGIN_ERROR`, say - map onto
 * nothing: they are reported through the general error list instead, and are
 * deliberately not turned into a field name nothing renders.
 */
function fieldErrorKey(code?: string): FieldErrorKey | undefined {
    const field = (code || '')
        .replace(/^user_/i, '')
        .replace(/_error$/i, '')
        .split('_')
        .map(word =>
            word.substring(0, 1).toUpperCase()
                + word.substring(1).toLowerCase()
        )
        .join('');

    return FIELD_ERROR_KEYS.find(known => known === `wrong${ field }`);
}

/**
 * Returns error messages of the given errors mapped to the inputs they belong
 * to, skipping those which belong to none.
 */
function mapErrors(errors: AppError[]): FieldErrors {
    return errors.reduce<FieldErrors>((mapped, error) => {
        const key = fieldErrorKey(error.extensions?.code);

        if (key) {
            mapped[key] = error.message;
        }

        return mapped;
    }, {});
}

/**
 * Login page layout component - displays login form
 */
export function Login() {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [login, loginInProgress] = useLogin();
    const [register, registerInProgress] = useRegister();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [errors, setErrors] = useState<AppError[]>([]);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [shrink, setShrink] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isRegForm, setIsRegForm] = useState(false);
    const inProgress = loginInProgress || registerInProgress;
    // both flags are a pure function of what the user typed, so they are
    // derived on every render instead of being mirrored into state
    const canReset = !!(email || password || errors.length
        || firstName || lastName);
    const canSubmit = !!(isRegForm
        ? email && password && firstName && lastName
        : email && password);

    /**
     * Handles Chrome filling the form in on its own: the browser fires the
     * `onAutoFillStart` animation declared in the stylesheet instead of a
     * change event, so the labels have to be told to shrink by hand.
     */
    useEffect(() => {
        const onAutoFillStart = () => setShrink(true);
        const onAnimationStart = ({ animationName }: AnimationEvent) => {
            if (animationName === 'onAutoFillStart') {
                return onAutoFillStart();
            }
        };
        const frame = window.requestAnimationFrame(() => {
            document.querySelectorAll('input').forEach(el =>
                el.addEventListener(
                    'animationstart',
                    onAnimationStart,
                    false,
                )
            );
        });

        return () => {
            window.cancelAnimationFrame(frame);
            document.querySelectorAll('input').forEach(el =>
                el.removeEventListener(
                    'animationstart',
                    onAnimationStart,
                )
            );
        };
    }, []);

    /**
     * Handles close login dialog box. Actually it exists specially to prevent
     * close behavior
     */
    const handleClose = useCallback(() => false, []);

    /**
     * Displays the errors of a failed submit, both as the general list and on
     * the inputs they name
     */
    const handleFailure = useCallback((failed: AppError[]) => {
        setFieldErrors(mapErrors(failed));
        setErrors(failed);
    }, []);

    /**
     * Performs login action
     */
    const handleLogin = useCallback(() => {
        login({ email, password }, { failure: handleFailure });
    }, [login, email, password, handleFailure]);

    /**
     * Performs new user registration action
     */
    const handleRegister = useCallback(() => {
        register({ firstName, lastName, email, password, isActive: true }, {
            success: (payload: RegisterPayload) => { // come back to login form
                setEmail(payload.user?.email ?? '');
                setPassword('');
                setFirstName('');
                setLastName('');
                setErrors([]);
                setFieldErrors({});
                setShowPassword(false);
                setShrink(true);
                setIsRegForm(false);
            },
            failure: handleFailure,
        });
    }, [register, firstName, lastName, email, password, handleFailure]);

    /**
     * Resets the login form to initial state
     */
    const reset = useCallback(() => {
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setErrors([]);
        setFieldErrors({});
        setShrink(false);
        setShowPassword(false);
    }, []);

    /**
     * Clears errors off
     */
    const clearError = useCallback((i: number) => () => {
        setErrors(current => withoutElement(current, i));
    }, []);

    const handleEmailChange = useCallback((
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setEmail(event.target.value), []);

    const handlePasswordChange = useCallback((
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setPassword(event.target.value), []);

    const handleFirstNameChange = useCallback((
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setFirstName(event.target.value), []);

    const handleLastNameChange = useCallback((
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setLastName(event.target.value), []);

    /**
     * Handles show password button click
     */
    const toggleShowPassword = useCallback(() => {
        setShowPassword(shown => !shown);
    }, []);

    /**
     * Handles switch to login form link click
     */
    const handleLoginFormClick = useCallback(() => setIsRegForm(false), []);

    /**
     * Handles registration link click
     */
    const handleRegistrationClick = useCallback(() => setIsRegForm(true), []);

    return <Dialog
        fullScreen={fullScreen}
        open={true}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
    >
        <DialogTitle id="responsive-dialog-title">
          {isRegForm
              ? "Customer Registration"
              : "Customer Login"
          }
          {/* the app bar is not mounted yet on this screen, so the badge
              telling this front-end apart from its REST twin lives here */}
          <Chip
              size="small"
              variant="outlined"
              label={APP_API_PROTOCOL}
              sx={{
                  color: 'inherit',
                  borderColor: 'currentColor',
                  ml: 1,
                  verticalAlign: 'middle',
              }}
          />
        </DialogTitle>
        <LinearProgress
          color="secondary"
          className={inProgress ? "" : "invisible"}
        />
        <DialogContent className="login-content">
            {errors.length > 0 &&
             errors.map((error, i) =>
                <AppMessage
                    className="app-message"
                    variant="error"
                    message={error.message}
                    onClose={clearError(i)}
                    key={i}
                />)
            }
            <form>
                <TextField
                    id="email"
                    error={!!fieldErrors.wrongEmail}
                    required
                    label="E-mail"
                    fullWidth
                    type="email"
                    name="email"
                    autoComplete="email"
                    margin="normal"
                    variant="outlined"
                    value={email}
                    slotProps={{
                        inputLabel: {
                            shrink: shrink || !!email
                        }
                    }}
                    onChange={handleEmailChange}
                />
                <TextField
                    id="password"
                    required
                    error={!!fieldErrors.wrongPassword}
                    label="Password"
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    margin="normal"
                    variant="outlined"
                    className="adornment-end"
                    value={password}
                    slotProps={{
                        inputLabel: {
                            shrink: shrink || !!password
                        },
                        input: {
                            endAdornment: <PasswordEye
                                onClick={toggleShowPassword}
                                enabled={showPassword}
                            />,
                        },
                    }}
                    onChange={handlePasswordChange}
                />
            </form>
            {isRegForm && (<>
                <TextField
                    id="firstName"
                    error={!!fieldErrors.wrongFirstName}
                    required
                    label="First Name"
                    fullWidth
                    type="text"
                    name="firstName"
                    autoComplete="firstName"
                    margin="normal"
                    variant="outlined"
                    value={firstName}
                    slotProps={{
                        inputLabel: {
                            shrink: shrink || !!firstName
                        }
                    }}
                    onChange={handleFirstNameChange}
                />
                <TextField
                    id="lastName"
                    error={!!fieldErrors.wrongLastName}
                    required
                    label="Last Name"
                    fullWidth
                    type="text"
                    name="lastName"
                    autoComplete="lastName"
                    margin="normal"
                    variant="outlined"
                    value={lastName}
                    slotProps={{
                        inputLabel: {
                            shrink: shrink || !!lastName
                        }
                    }}
                    onChange={handleLastNameChange}
                />
            </>)}
        </DialogContent>
        <DialogActions className="left-right login-actions">
            <button
                className="link-button left"
                onClick={isRegForm
                    ? handleLoginFormClick
                    : handleRegistrationClick}
            >
                {isRegForm
                    ? "I have an account"
                    : "Need an account?"
                }
            </button>
            <Button
                variant={fullScreen ? "text" : "contained"}
                onClick={reset}
                color="inherit"
                size={"large"}
                disabled={!canReset}
            >
                Reset
                <NotInterested />
            </Button>
            <ActionButton
                variant={fullScreen ? "text" : "contained"}
                onClick={isRegForm
                    ? handleRegister
                    : handleLogin}
                autoFocus
                size={"large"}
                disabled={!canSubmit || inProgress}
            >
                {isRegForm
                    ? <>Register <PersonAdd /></>
                    : <>Login <LockOpen /></>
                }
                {inProgress &&
                    <ButtonProgress size={24}/>
                }
            </ActionButton>
        </DialogActions>
    </Dialog>;
}
