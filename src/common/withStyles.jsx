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
import { css, cx } from '@emotion/css';
import { useTheme } from '@mui/material/styles';

/**
 * Drop-in replacement for the `withStyles()` higher-order component that was
 * removed from Material-UI in v5. It keeps the classic `classes` API alive so
 * the existing view components do not need to be rewritten to `sx`/`styled`.
 *
 * A style rule set (either a plain object or a `theme => object` factory) is
 * turned into a map of generated Emotion class names, injected into the
 * wrapped component via the `classes` prop. Any `classes` prop passed from the
 * outside is merged on top of the generated ones (mirroring the legacy
 * behavior).
 *
 * @param {object|function} stylesArg - style rules or a theme-aware factory
 * @param {{ withTheme?: boolean }} [options] - when `withTheme` is set the
 *        resolved theme is injected as a `theme` prop, matching the old option
 * @return {function(React.ComponentType): React.ComponentType}
 */
export function withStyles(stylesArg, options = {}) {
    return function withStylesWrapper(WrappedComponent) {
        function WithStyles(props) {
            const theme = useTheme();
            const rules = typeof stylesArg === 'function'
                ? stylesArg(theme)
                : stylesArg;
            const generated = {};

            for (const key of Object.keys(rules)) {
                generated[key] = css(rules[key]);
            }

            const { classes: overrides, ...rest } = props;
            const classes = overrides
                ? mergeClasses(generated, overrides)
                : generated;
            const extra = options.withTheme ? { theme } : {};

            return <WrappedComponent {...rest} {...extra} classes={classes} />;
        }

        WithStyles.displayName = `WithStyles(${
            WrappedComponent.displayName || WrappedComponent.name || 'Component'
        })`;

        return WithStyles;
    };
}

/**
 * Merges generated class names with externally provided overrides.
 *
 * @param {object} base - generated class name map
 * @param {object} overrides - external `classes` prop
 * @return {object}
 */
function mergeClasses(base, overrides) {
    const merged = { ...base };

    for (const key of Object.keys(overrides)) {
        merged[key] = base[key]
            ? cx(base[key], overrides[key])
            : overrides[key];
    }

    return merged;
}
