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
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { logger } from '../config';

/**
 * Renders a fallback when a child throws, instead of letting the failure unmount
 * the whole app.
 *
 * Relay's `useLazyLoadQuery` reports a failed request by throwing during render
 * and a pending one by suspending, so a query's two unhappy paths are expressed
 * as an error boundary plus a `<Suspense>` fallback rather than as callbacks.
 * React only supports catching a render error in a class component, which is why
 * this is the one class left in the app.
 */
export interface ErrorBoundaryProps {
    children: ReactNode;
    /** Rendered instead of the children once one of them has thrown. */
    fallback: ReactNode | ((error: Error) => ReactNode);
    /**
     * Changing this value clears a caught error and re-renders the children —
     * pass something identifying the attempt (a route, a retry counter) so the
     * user is not stuck with the fallback forever.
     */
    resetKey?: unknown;
}

interface ErrorBoundaryState {
    error: Error | null;
}

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
            this.setState({ error: null });
        }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        logger.error('ErrorBoundary:caught', error, info.componentStack);
    }

    render() {
        const { error } = this.state;
        const { children, fallback } = this.props;

        if (!error) {
            return children;
        }

        return typeof fallback === 'function' ? fallback(error) : fallback;
    }
}
