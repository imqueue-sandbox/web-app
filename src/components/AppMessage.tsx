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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import IconButton from '@mui/material/IconButton';
import MuiSnackbarContent from '@mui/material/SnackbarContent';
import type { SnackbarContentProps } from '@mui/material/SnackbarContent';
import { styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { green, amber } from '@mui/material/colors';

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

/** Message flavours the component knows how to render. */
export type AppMessageVariant = keyof typeof variantIcon;

/** Background of the message body, per flavour. */
const variantBackground = (
    theme: Theme,
): Record<AppMessageVariant, string> => ({
    success: green[600],
    error: theme.palette.error.dark,
    info: theme.palette.primary.dark,
    warning: amber[700],
});

const SnackbarContent = styled(MuiSnackbarContent, {
    shouldForwardProp: prop => prop !== '$variant',
})<{ $variant: AppMessageVariant }>(({ theme, $variant }) => ({
    backgroundColor: variantBackground(theme)[$variant],
}));

const Message = styled('span')({
    display: 'flex',
    alignItems: 'center',
});

/** Size shared by the flavour icon and the close button icon. */
const iconSx = { fontSize: 20 } as const;

export interface AppMessageProps extends Omit<
    SnackbarContentProps,
    'action' | 'classes' | 'onClose' | 'variant'
> {
    /** Selects both the icon and the background colour of the message. */
    variant: AppMessageVariant;
    /** When given, a close button is rendered and this is its handler. */
    onClose?: () => void;
    /**
     * React strips `key` before the props reach the component, so this is
     * always `undefined` — it is only kept because the original propTypes
     * declared it and the id of the message span is built out of it.
     */
    key?: string | number;
}

/** A snackbar-styled message of one of the {@link AppMessageVariant}s. */
export function AppMessage({
    message,
    onClose,
    variant,
    key,
    ...other
}: AppMessageProps) {
    const Icon = variantIcon[variant];

    return (
        <SnackbarContent
            $variant={variant}
            aria-describedby="client-snackbar"
            message={
                <Message id={`client-snackbar${key ? `-${key}` : ''}`}>
                    <Icon sx={{ ...iconSx, opacity: 0.9, mr: 1 }}/>
                    {message}
                </Message>
            }
            action={onClose ? [
                <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    onClick={onClose}
                >
                    <CloseIcon sx={iconSx}/>
                </IconButton>,
            ]: []}
            {...other}
        />
    );
}
