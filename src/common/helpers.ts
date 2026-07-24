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
import type { AppError, FailureHandler, SuccessHandler } from '../types';

/**
 * Builds an `onCompleted` handler for a mutation which unwraps the single
 * payload field of its response and routes it to `success`, or routes any errors
 * to `failure`.
 *
 * `R` is the mutation's generated `$data` type and `K` one of its fields, so the
 * value handed to `success` is exactly what the mutation document selects —
 * every payload field relay-compiler generates is nullable, and a response that
 * carries neither payload nor errors is reported as a failure rather than passed
 * on as `null`.
 *
 * @param key - payload field of the mutation response
 * @param success - success callback
 * @param failure - failure callback
 */
export function mutationResult<R, K extends keyof R>(
    key: K,
    success?: SuccessHandler<NonNullable<R[K]>>,
    failure?: FailureHandler,
): (response: R, errors?: readonly AppError[] | null) => void {
    return (response, errors) => {
        if (errors && errors.length) {
            failure && failure([...errors]);

            return;
        }

        const payload = response[key];

        if (payload === null || payload === undefined) {
            failure && failure([{
                message: `Mutation response carries no \`${
                    String(key)}\` payload!`,
            }]);

            return;
        }

        success && success(payload);
    };
}

/**
 * Returns presentation string for a given car type
 *
 * @param type - db stored type
 * @return - presentational type
 */
export function carType(type?: string): string {
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
 * @param arr - source array of elements
 * @param pos - element position to remove
 * @return - copy of a source array without an element at the given source position
 */
export function withoutElement<T>(arr: readonly T[], pos: number): T[] {
    const copy = arr.slice(0);

    copy.splice(pos, 1);

    return copy;
}
