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
 * Map of event names to the argument tuple their handlers receive.
 */
type EventMap = Record<string, unknown[]>;

/** Handler of a single event of an {@link EventMap}. */
type EventHandler<E extends EventMap, K extends keyof E> = (
    ...args: E[K]
) => void;

/**
 * Minimal browser-friendly event emitter. Replaces the Node.js `events`
 * module the store used to extend, which is not available in the browser.
 */
class EventEmitter<E extends EventMap> {
    private _listeners: { [K in keyof E]?: Array<EventHandler<E, K>> } =
        Object.create(null);

    on<K extends keyof E>(event: K, handler: EventHandler<E, K>): this {
        (this._listeners[event] || (this._listeners[event] = [])).push(handler);

        return this;
    }

    removeListener<K extends keyof E>(
        event: K,
        handler: EventHandler<E, K>,
    ): this {
        const handlers = this._listeners[event];

        if (handlers) {
            this._listeners[event] = handlers.filter(fn => fn !== handler);
        }

        return this;
    }

    removeAllListeners<K extends keyof E>(event?: K): this {
        if (event) {
            delete this._listeners[event];
        } else {
            this._listeners = Object.create(null);
        }

        return this;
    }

    emit<K extends keyof E>(event: K, ...args: E[K]): boolean {
        const handlers = this._listeners[event];

        if (handlers) {
            for (const handler of handlers.slice()) {
                handler(...args);
            }
        }

        return !!(handlers && handlers.length);
    }
}

/**
 * Events emitted by the {@link Storage}.
 *
 * Fires any time value for a key changed in storage; whenever a delete is
 * performed it will provide `undefined` as the new value for this event. The
 * old value is given as the raw string as it was stored.
 */
export interface StorageEvents extends EventMap {
    change: [key: string, newData: unknown, oldData: string | null];
}

/** Handler of the {@link Storage} `change` event. */
export type StorageChangeHandler = EventHandler<StorageEvents, 'change'>;

class Storage extends EventEmitter<StorageEvents> {
    /**
     * Removes given handler from a given event listeners.
     * If handler is not provided will remove all listeners from a specified
     * event.
     */
    off<K extends keyof StorageEvents>(
        event: K,
        handler?: EventHandler<StorageEvents, K>,
    ): void {
        if (handler) {
            this.removeListener(event, handler);
        }

        else {
            this.removeAllListeners(event);
        }
    }

    /**
     * Stores given json data under a given key
     */
    set(key: string, jsonData: unknown): void {
        const oldData = localStorage.getItem(key);

        localStorage.setItem(key, JSON.stringify(jsonData));
        this.emit('change', key, jsonData, oldData);
    }

    /**
     * Returns unpacked data stored under given key
     */
    get<T = unknown>(key: string): T | null {
        const data = localStorage.getItem(key);

        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data) as T;
        } catch (err) {
            return null;
        }
    }

    /**
     * Removes data stored under given key
     */
    del(key: string): void {
        this.emit('change', key, undefined, localStorage.getItem(key));
        localStorage.removeItem(key);
    }

}

export const AppStore = new Storage();
