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
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import type { EventWrapperProps } from 'react-big-calendar';
import {
    AppStore,
    AUTH_KEY,
    HOUR_HEIGHT,
    MSG_TIME_PASSED,
    MSG_TIME_RESERVED,
} from '../../common';
import type { Reservations$data }
    from '../../relay/queries/fragments/__generated__/Reservations.graphql';
import type { AuthInfo } from '../../types';

/** A single reservation, as the `Reservations` fragment selects it. */
type Reservation =
    NonNullable<NonNullable<Reservations$data['reservations']>[number]>;

/**
 * A washing reservation as react-big-calendar renders it. Assembled by
 * `TimeTable` out of a reservation the `Reservations` fragment selected, with
 * the ISO date/time strings turned into `Date` objects the calendar can lay out.
 */
export interface CalendarEventData {
    id: string;
    /** Human-readable reservation summary, e.g. `AA0000AA, Audi A6, John Doe`. */
    title: string;
    user?: Reservation['user'];
    car?: Reservation['car'];
    start: Date;
    end: Date;
}

export const CalendarEvent = (
    timeStart: Date,
    step: number,
    onCancel?: (id: string, start: Date) => void,
) => (props: EventWrapperProps<CalendarEventData>) => {
    const authUser = AppStore.get<AuthInfo>(AUTH_KEY)?.user;
    const slotHeight = HOUR_HEIGHT / (60 / step);
    const eventHeight = (
        props.event.end.getTime() -
        props.event.start.getTime()
    ) / (1000 * 60 * step);
    const eventTop = (
        props.event.start.getTime() -
        timeStart.getTime()
    ) / (1000 * 60 * step);
    const hasPassed = new Date() >= props.event.start;
    const hint = hasPassed ? MSG_TIME_PASSED : MSG_TIME_RESERVED;
    const canCancel = authUser && (authUser.isAdmin ||
        (!hasPassed && authUser.id === (props.event.user?.id ?? '')));
    // react-big-calendar types the wrapper style as CSS properties, while the
    // time grid always computes the horizontal offset as a number of pixels
    const { left } = props.style as { left: number };

    return <div
        title={hint}
        style={{
            top: eventTop * slotHeight - 1 + 'px',
            height: eventHeight * slotHeight + 1 + 'px',
            left: left + 'px',
        }}
        className={`rbc-event-box${hasPassed ? ' past' : ''}`}
    >
        <strong>
            {moment(props.event.start).format('HH:mm')}&nbsp;&ndash;&nbsp;
            {moment(props.event.end).format('HH:mm')}&nbsp;&nbsp;
        </strong>
        <em>{props.event.title}</em>
        {canCancel && <span className="rbc-event-cancel">
            <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => onCancel && onCancel(
                    props.event.id,
                    props.event.start,
                )}
            >
                <Delete/>
            </IconButton>
        </span>}
    </div>;
};
