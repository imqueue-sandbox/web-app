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
export class Storage {
    /**
     * Stores given json data under a given key
     *
     * @param {string} key
     * @param {*} jsonData
     * @return {*}
     */
    static set(key, jsonData) {
        return localStorage.set(key, JSON.stringify(jsonData));
    }

    /**
     * Returns unpacked data stored under given key
     *
     * @param {string} key
     * @return {*}
     */
    static get(key) {
        let data = localStorage.get(key);

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
    static del(key) {
        return localStorage.del(key);
    }
}