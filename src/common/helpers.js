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
/**
 * Builds and returns generic error handler
 *
 * @param {string} key - data key in response to bypass its value to success handler
 * @param {Function} success - success callback
 * @param {Function} failure - failure callback
 * @return {Function}
 */
export function resultHandler(key, success, failure) {
    return (response, errors) => {
        if (errors && errors.length) {
            return failure && failure(errors);
        }

        success && success(key ? response[key] : response);
    }
}

/**
 * Returns presentation string for a given car type
 *
 * @param {string} type - db stored type
 * @return {string} - presentational type
 */
export function carType(type) {
    switch (type) {
        case 'mini': return 'Small Car';
        case 'large': return 'Large Car';
        default: return 'Regular Car';
    }
}

/**
 * Returns copy of the given array without an element at position pos
 * in that array
 *
 * @param {*[]} arr - source array of elements
 * @param {number} pos - element position to remove
 * @return {*[]} - copy of a source array without an element at the given source position
 */
export function withoutElement(arr, pos) {
    arr = arr.slice(0);
    arr.splice(pos, 1);

    return arr;
}
