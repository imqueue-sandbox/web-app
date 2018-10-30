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

const events = {};

function emit(event, ...args) {
    if (events[event]) {
        for (let i = 0, s = events[event].length; i < s; i++) {
            events[event] && events[event][i](...args);
        }
    }
}

export class AuthStorage {

    /**
     * Attaches given handler to an event
     *
     * @param {string} event
     * @param {() => *} handler
     */
    static on(event, handler) {
        if (!(events[event] instanceof Array)) {
            events[event] = [];
        }

        events[event].push(handler);
    }

    /**
     * Removes given handler from an event. If handler is not provided
     * will remove all handler for given event.
     *
     * @param {string} event
     * @param (() => *) [handler]
     */
    static off(event, handler) {
        if (!events[event]) {
            return ;
        }

        if (handler) {
            let pos;

            while (~(pos = events[event].indexOf(handler))) {
                events[event].splice(pos, 1);
            }
        }

        else {
            events[event] = [];
        }
    }

    /**
     * returns key used to store user data
     * @return {string}
     */
    static key() {
        return 'AuthUser';
    }

    /**
     * Saves user data locally
     * @param authData
     * @return {*}
     */
    static save(authData) {
        const oldData = AuthStorage.fetch();
        const res = Storage.set(AuthStorage.key(), authData);

        emit('change', authData, oldData);

        return res;
    }

    /**
     * Retrieves and returns user data stored locally
     * @return {*}
     */
    static fetch() {
        return Storage.get(AuthStorage.key());
    }

    /**
     * Clears locally stored user data
     * @return {*}
     */
    static clear() {
        const oldData = AuthStorage.fetch();
        const res = Storage.del(AuthStorage.key());

        emit('change', null, oldData);

        return res;
    }

    /**
     * Returns stored user token if any
     * @return {string|null}
     */
    static user() {
        const data = AuthStorage.fetch();

        if (!data) {
            return null;
        }

        return data.user || null;
    }

    /**
     * Returns stored user token if any
     * @return {string|null}
     */
    static token() {
        const data = AuthStorage.fetch();

        if (!data) {
            return null;
        }

        return data.token || null;
    }

    static update(user) {
        const data = AuthStorage.fetch();

        for (let field of Object.keys(user)) {
            if (user[field]) {
                data[field] = user[field];
            }
        }

        AuthStorage.save(data);
    }

}