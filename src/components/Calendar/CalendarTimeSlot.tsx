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
import { useContext } from 'react';
import type { ComponentType, ReactNode } from 'react';
import {
    AppStore,
    AUTH_KEY,
    HOUR_HEIGHT,
    MSG_TIME_PASSED,
    MSG_CAR_MISSING
} from '../../common';
// the car handed over here is the one `AppStore` keeps under `CAR_KEY`, which is
// a car of the user's garage as the `UserCars` fragment selects it
import type { GarageCar } from '../UserCar';
import type { AuthInfo } from '../../types';
import type { CalendarEventData } from './CalendarEvent';
import { TimeGutterContext } from './CalendarTimeGutter';

/** Props react-big-calendar renders a time slot wrapper with. */
interface CalendarTimeSlotProps {
    /** Date and time the slot starts at. */
    value: Date;
    children?: ReactNode;
}

function busy(date: Date, events: CalendarEventData[]) {
    const now = new Date();

    return date <= now || !!events.find(event => (
        event.start.getTime() <= date.getTime() &&
        event.end.getTime() > date.getTime()
    ));
}

function canReserve(
    max: Date,
    events: CalendarEventData[],
    time: Date,
    timeBlock: number,
    car: Partial<GarageCar>,
) {
    const now = new Date().getTime();
    const start = time.getTime();
    const end = time.getTime() + timeBlock * 60000;
    const maxTime = max.getTime();

    if (!(car && car.make && car.model && car.regNumber)) {
        return false;
    }

    return (start > now) && (end <= maxTime) && !events.some(event => {
        const eventStart = event.start.getTime();
        const eventEnd = event.end.getTime();

        return (end > eventStart && eventEnd > start);
    });
}

// the produced component is cast to a props-less one, because that is how
// react-big-calendar types `timeSlotWrapper` — even though it does render it
// with the slot value and the slot content
export const CalendarTimeSlot = (
    max: Date,
    events: CalendarEventData[],
    step: number,
    timeBlock: number,
    car: Partial<GarageCar>,
    onSelect?: (start: Date, end: Date) => void,
) => ((props: CalendarTimeSlotProps) => {
    // the left time gutter goes through this very same wrapper, and only its
    // own wrapper can tell us so - see `CalendarTimeGutter`
    const isTimeColumn = useContext(TimeGutterContext);
    const user = AppStore.get<AuthInfo>(AUTH_KEY)?.user;
    const start = moment(props.value);
    const end = moment(props.value.getTime() + timeBlock * 60 * 1000);
    const slotHeight = HOUR_HEIGHT / (60 / step);
    const eventHeight = timeBlock / step;
    const isSelectable = canReserve(max, events, props.value, timeBlock, car);
    const isBusy = busy(props.value, events);

    // the gutter is nothing but the hour labels, so it is handed over untouched
    // whether or not anybody is signed in
    if (isTimeColumn) {
        return props.children;
    }

    if (!user) {
        return null;
    }

    return <div
        style={{ height: '16px' }}
        className={'rbc-time-slot' + (isBusy ? ' disabled' : '')}
        title={isBusy ? MSG_TIME_PASSED : !car.regNumber ? MSG_CAR_MISSING : ''}
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
}) as ComponentType;
