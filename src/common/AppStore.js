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
import { EventEmitter } from 'events';

class Storage extends EventEmitter {
    /**
     * Fires any time value for a key changed in storage
     * whenever delete is performed it will provide undefined as a new value
     * for this event
     *
     * @event change
     * @param {(key, newData, oldData) => *}
     */

    /**
     * Removes given handler from a given event listeners.
     * If handler is not provided will remove all listeners from a specified
     * event.
     *
     * @param {string} event
     * @param {Function} [handler]
     */
    off(event, handler) {
        if (handler) {
            this.removeListener(event, handler);
        }

        else {
            this.removeAllListeners(event);
        }
    }

    /**
     * Stores given json data under a given key
     *
     * @param {string} key
     * @param {*} jsonData
     * @return {*}
     */
    set(key, jsonData) {
        const retVal = localStorage.setItem(key, JSON.stringify(jsonData));
        this.emit('change', key, jsonData, localStorage.getItem(key));
        return retVal;
    }

    /**
     * Returns unpacked data stored under given key
     *
     * @param {string} key
     * @return {*}
     */
    get(key) {
        let data = localStorage.getItem(key);

        if (!data) {
            return null;
        }

        try {
            data = JSON.parse(data);
        } catch (err) {
            return null;
        }

        return data;
    }

    /**
     * Removes data stored under given key
     *
     * @param {string} key
     * @return {*}
     */
    del(key) {
        this.emit('change', key, undefined, localStorage.getItem(key));
        return localStorage.removeItem(key);
    }

}

export const AppStore = new Storage();
