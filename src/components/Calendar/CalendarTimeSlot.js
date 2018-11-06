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
import { AppStore, AUTH_KEY, HOUR_HEIGHT, MSG_TIME_PASSED } from '../../common';

const RX_TIME_COLUMN = /\brbc-time-gutter\b/;

function busy(date, events) {
    const now = new Date();

    return date <= now || !!events.find(event => (
        event.start.getTime() <= date.getTime() &&
        event.end.getTime() > date.getTime()
    ));
}

function canReserve(max, events, time, timeBlock) {
    const now = new Date().getTime();
    const start = time.getTime();
    const end = time.getTime() + timeBlock * 60000;
    const maxTime = max.getTime();

    return (start > now) && (end <= maxTime) && !events.some(event => {
        const eventStart = event.start.getTime();
        const eventEnd = event.end.getTime();

        return (end > eventStart && eventEnd > start);
    });
}

export const CalendarTimeSlot = (
    max,
    events,
    step,
    timeBlock,
    car,
    onSelect,
) => props => {
    const className = (props.children._owner.return.stateNode ||
        { className: '' }).className;
    const user = (AppStore.get(AUTH_KEY) || { user: null }).user;
    const start = moment(props.value);
    const end = moment(props.value.getTime() + timeBlock * 60 * 1000);
    const slotHeight = HOUR_HEIGHT / (60 / step);
    const eventHeight = timeBlock / step;
    const isSelectable = canReserve(max, events, props.value, timeBlock);
    const isBusy = busy(props.value, events);

    if (!user) {
        return null;
    }

    if (RX_TIME_COLUMN.test(className)) {
        return props.children;
    }

    return <div
        style={{ height: '16px' }}
        className={'rbc-time-slot' + (isBusy ? ' disabled' : '')}
        title={isBusy ? MSG_TIME_PASSED : ''}
        onClick={() => isSelectable && onSelect && onSelect(
            start.toDate(),
            end.toDate(),
        )}
        >{isSelectable &&
            <div
                className="rbc-reservation"
                style={{
                    height: eventHeight * slotHeight + 'px',
                    pointerEvents: 'none',
                }}
            >
                <strong>
                    {start.format('HH:mm')}&nbsp;&ndash;&nbsp;
                    {end.format('HH:mm')}&nbsp;&nbsp;
                </strong>
                <em>{car.regNumber}, {car.make} {car.model}</em>
            </div>}
        </div>;
};