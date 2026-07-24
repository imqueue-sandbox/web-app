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
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppStore, AUTH_KEY } from '../common';
import type { StorageChangeHandler } from '../common';
import { Login, AppView } from '../layouts';
import type { AuthInfo } from '../types';

/** The signed-in identity as the persisted session record carries it. */
type SessionUser = AuthInfo['user'];

/**
 * Application shell: shows the login form until a session is stored and the
 * application itself once one is, and keeps following the stored session so a
 * logout (or a token invalidated by any view) drops straight back to the login
 * form.
 *
 * The root data of the application is loaded by `AppView`, which also owns the
 * error boundary and the `<Suspense>` fallback that load needs, so all this
 * component contributes is the current route and the session it watches.
 */
export function App() {
    const location = useLocation();
    const [user, setUser] = useState<SessionUser>(
        () => AppStore.get<AuthInfo>(AUTH_KEY)?.user,
    );

    useEffect(() => {
        const onUserChange: StorageChangeHandler = (key, auth) => {
            if (key === AUTH_KEY) {
                // the store keeps arbitrary JSON, but under `AUTH_KEY` it only
                // ever holds an `AuthInfo` — or nothing at all, after a logout
                setUser((auth as AuthInfo | null | undefined)?.user);
            }
        };

        AppStore.on('change', onUserChange);

        return () => AppStore.off('change', onUserChange);
    }, []);

    if (!user) {
        return <Login/>;
    }

    return <AppView route={location.pathname}/>;
}
