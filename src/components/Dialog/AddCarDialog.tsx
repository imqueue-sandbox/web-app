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
import { forwardRef, Suspense, useCallback, useState } from 'react';
import type { ChangeEvent, ReactElement, Ref } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import MuiDialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import type { TransitionProps } from '@mui/material/transitions';
import MuiTextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Add from '@mui/icons-material/Add';
import Clear from '@mui/icons-material/Clear';
import Done from '@mui/icons-material/Done';
import { CarModelSelect, CarBrandsSelect } from '../Form';
import { AppMessage } from '../AppMessage';
import { ErrorBoundary, withoutElement } from '../../common';
import { useAddCar } from '../../relay/mutations';
import type { AppError } from '../../types';

const DialogContent = styled(MuiDialogContent)({
    paddingRight: 40,
    overflow: 'hidden',
});

const RegNumberField = styled(MuiTextField)({
    '& input': {
        textTransform: 'uppercase',
    },
});

/** Margins of an error message inside the dialog. */
const errorSx = { flexGrow: 0, margin: '0 20px' } as const;

const Transition = forwardRef(function Transition(
    props: TransitionProps & { children: ReactElement },
    ref: Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export interface AddCarDialogProps {
    /** Owner of the garage the car is added to. */
    userId: string;
}

/**
 * The "Add car" control of the garage panel, along with the dialog it opens:
 * the user picks a make and a model out of the car catalog and types in the
 * registration number of their car.
 *
 * The catalog selects load their own data, so they are wrapped into a boundary
 * pair here — a failed request used to be reported through the query HOC's
 * `onError`, which rendered exactly the message the fallback renders now.
 */
export function AddCarDialog({ userId }: AddCarDialogProps) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(false);
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [regNumber, setRegNumber] = useState('');
    const [errors, setErrors] = useState<AppError[]>([]);
    const [addCar, loading] = useAddCar();

    const close = useCallback(() => {
        setOpen(false);
    }, []);

    // re-opening starts over, as it did when the initial state was cloned back
    const show = useCallback(() => {
        setBrand('');
        setModel('');
        setRegNumber('');
        setErrors([]);
        setOpen(true);
    }, []);

    const errorClose = useCallback((i: number) => () => {
        setErrors(current => withoutElement(current, i));
    }, []);

    const changeRegNumber = useCallback((
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRegNumber(event.target.value);
    }, []);

    const submit = useCallback(() => {
        addCar({ idOrEmail: userId, carId: model, regNumber }, {
            success: close,
            failure: errors => setErrors(errors),
        });
    }, [addCar, close, model, regNumber, userId]);

    return (<>
        <Button onClick={show}><Add/>&nbsp;Add car</Button>
        <Dialog
            fullScreen={fullScreen}
            slots={{ transition: Transition }}
            open={open}
            onClose={close}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">
                Choose your car
            </DialogTitle>
            <LinearProgress
                color="secondary"
                className={!loading ? "invisible" : ""}
            />
            {errors.map((error, i) =>
                <AppMessage
                    sx={errorSx}
                    key={i}
                    variant="error"
                    message={error.message}
                    onClose={errorClose(i)}
                />
            )}
            <DialogContent>
                <ErrorBoundary
                    resetKey={open}
                    fallback={err => <AppMessage
                        message={err.message}
                        variant="error"
                    />}
                >
                    <Suspense
                        fallback={<LinearProgress color="secondary"/>}
                    >
                        <CarBrandsSelect
                            onChange={setBrand}
                            disabled={loading}
                        />
                        <CarModelSelect
                            onChange={setModel}
                            disabled={!brand || loading}
                            brand={brand}
                        />
                    </Suspense>
                </ErrorBoundary>
                <RegNumberField
                    fullWidth
                    required={true}
                    id="car-reg-number"
                    label="Car registration number"
                    margin="normal"
                    value={regNumber}
                    onChange={changeRegNumber}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={close}><Clear/> Cancel</Button>
                <Button
                    disabled={!(brand && model && regNumber)}
                    onClick={submit}
                    autoFocus
                ><Done/> Add</Button>
            </DialogActions>
        </Dialog>
    </>);
}
