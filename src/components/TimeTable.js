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
import React, { Component } from 'react';
import BigCalendar  from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AuthStorage } from '../common';
import { CalendarToolbar } from '.';

moment.locale(navigator.userLanguage || navigator.language);


export class TimeTable extends Component {
    state = {
        calendarDate: new Date(),
    };
    timeout = null;
    interval = null;

    constructor(props) {
        super(props);
        this.initTimers();
    }

    componentWillUnmount() {
        this.clearTimers();
    }

    closest5Minutes() {
        const now = new Date();
        const minutes = 5 - now.getMinutes() % 5 + now.getMinutes();
        return new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            minutes,
            0
        );
    }

    initTimers = () => {
        if (this.timeout || this.interval) {
            return;
        }

        this.timeout = setTimeout(() => {
            this.setState({ calendarDate: new Date() });
            this.interval = setInterval(
                () => this.setState({ calendarDate: new Date() }),
                300000, // each 5 minutes
            );
        }, this.closest5Minutes().getTime() - Date.now());
    };

    clearTimers = () => {
        this.timeout && clearTimeout(this.timeout);
        this.interval && clearInterval(this.interval);
        this.timeout = this.interval = null;
    };

    customSlot = (date) => {
        if (date < Date.now()) {
            return { className: 'disabled' };
        }

        return {};
    };

    onSelect = (event) => {
        return event.start >= Date.now();
    };

    render() {
        const isAdmin = (AuthStorage.user() || {}).isAdmin;
        const localizer = BigCalendar.momentLocalizer(moment);
        const events = [];
        const resources = isAdmin ? [
            { id: '1', title: 'Box #1' },
            { id: '2', title: 'Box #2' },
            { id: '3', title: 'Box #3' },
            { id: '4', title: 'Box #4' },
        ] : [{ id: 'user-box', title: 'Choose desirable washing time'}];

        return <BigCalendar
            className="time-table"
            localizer={localizer}
            events={events}
            defaultView="day"
            startAccessor="start"
            endAccessor="end"
            resources={resources}
            defaultDate={this.state.calendarDate}
            scrollToTime={this.state.calendarDate}
            components={{
                toolbar: CalendarToolbar(this.initTimers, this.clearTimers),
            }}
            step={15}
            timeslots={4}
            views={[BigCalendar.Views.DAY]}
            slotPropGetter={this.customSlot}
            onSelecting={this.onSelect}
            // min={new Date(0,0,0,9,0)}
            // max={new Date(0,0,0,20,0)}
            selectable
        />;
    }
}
