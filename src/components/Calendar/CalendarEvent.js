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
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Delete';
import {
    AppStore,
    AUTH_KEY,
    HOUR_HEIGHT,
    MSG_TIME_PASSED,
    MSG_TIME_RESERVED,
} from '../../common';

export const CalendarEvent = (timeStart, step, onCancel) => props => {
    const authUser = (AppStore.get(AUTH_KEY) || { user: null }).user;
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
    const canCancel = !hasPassed && authUser && (authUser.isAdmin ||
        authUser.id === (props.event.user || { id: '' }).id);

    return <div
        title={hint}
        style={{
            top: eventTop * slotHeight - 1 + 'px',
            height: eventHeight * slotHeight + 1 + 'px',
            left: props.style.left + 'px',
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
