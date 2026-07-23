/*!
 * ISC License
 *
 * Copyright (c) 2026, Imqueue Sandbox
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
import React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Drop-in replacement for the `withMobileDialog()` higher-order component that
 * was removed from Material-UI in v5. It injects a `fullScreen` prop that is
 * `true` on viewports narrower than the given breakpoint, so dialogs go full
 * screen on mobile just like they used to.
 *
 * @param {{ breakpoint?: string }} [options]
 * @return {function(React.ComponentType): React.ComponentType}
 */
export function withMobileDialog(options = {}) {
    const breakpoint = options.breakpoint || 'sm';

    return function withMobileDialogWrapper(WrappedComponent) {
        function WithMobileDialog(props) {
            const theme = useTheme();
            const fullScreen = useMediaQuery(theme.breakpoints.down(breakpoint));

            return <WrappedComponent {...props} fullScreen={fullScreen} />;
        }

        WithMobileDialog.displayName = `WithMobileDialog(${
            WrappedComponent.displayName || WrappedComponent.name || 'Component'
        })`;

        return WithMobileDialog;
    };
}
