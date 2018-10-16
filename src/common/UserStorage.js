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
import { Storage } from './Storage';

export class UserStorage {

    /**
     * returns key used to store user data
     * @return {string}
     */
    static key() {
        return 'AuthUser';
    }

    /**
     * Saves user data locally
     * @param userData
     * @return {*}
     */
    static save(userData) {
        return Storage.set(UserStorage.key(), userData);
    }

    /**
     * Retrieves and returns user data stored locally
     * @return {*}
     */
    static fetch() {
        return Storage.get(UserStorage.key());
    }

    /**
     * Clears locally stored user data
     * @return {*}
     */
    static clear() {
        return Storage.del(UserStorage.key());
    }

    /**
     * Returns stored user token if any
     * @return {string|null}
     */
    static token() {
        const data = UserStorage.fetch();

        if (!data) {
            return null;
        }

        return data.token || null;
    }

}