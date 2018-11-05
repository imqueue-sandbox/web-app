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
import moment from 'moment';
import React from 'react';
import {AppStore, AUTH_KEY} from '../../common';

const RX_TIME_COLUMN = /\brbc-time-gutter\b/;

function busy(date, events) {
    return !!events.find(event => (
        event.start.getTime() <= date.getTime() &&
        event.end.getTime() > date.getTime()
    ));
}

function canReserve(events, time, timeBlock) {
    return !events.length || !!events.find(event =>
        event.start.getTime() - time.getTime() >= timeBlock * 60 * 1000 ||
        event.end.getTime() <= time.getTime()
    );
}

export const CalendarTimeSlot = (events, step, timeBlock, car) => props => {
    const className = (props.children._owner.return.stateNode ||
        { className: '' }).className;
    const user = (AppStore.get(AUTH_KEY) || { user: null }).user;
    const start = moment(props.value).format('HH:mm');
    const end = moment(props.value.getTime() + timeBlock * 60 * 1000)
        .format('HH:mm');

    if (!user) {
        return null;
    }

    if (RX_TIME_COLUMN.test(className)) {
        return props.children;
    }

    return <div
        style={{
            height: '16px',
        }}
        className={
            'rbc-time-slot' + (busy(props.value, events)
                    ? ' disabled'
                    : ''
            )}>{canReserve(events, props.value, timeBlock) &&
    <div style={{
        height: (timeBlock / step) * 16 + 'px',
        pointerEvents: 'none',
    }}
         className="rbc-reservation"
    >
        <b>{start}&nbsp;&ndash;&nbsp;{end}&nbsp;&nbsp;</b>
        <em>{car.make} {car.model}, {car.regNumber}</em>
    </div>}
    </div>;
};