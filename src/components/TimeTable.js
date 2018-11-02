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
import PropTypes from 'prop-types';
import {createFragmentContainer} from 'react-relay';
import moment from 'moment';
import { CalendarToolbar } from '.';
import { AppStore, AUTH_KEY } from '../common';
import { OptionsFragment } from '../relay/queries/fragments';

import 'react-big-calendar/lib/css/react-big-calendar.css';

/* these constants below are the things which should be obtained
from a service and/or from a user choice (like car type, washing type) */
const WORKING_TIME_START = '08:00';
const WORKING_TIME_END = '19:00';
const TIME_SLOT_DURATION = 45;
/* end of config constants */

const RX_DISABLED = /\bdisabled\b/;

moment.locale(navigator.userLanguage || navigator.language);

export class TimeTable extends Component {
    static propTypes = {
        timeSlotDuration: PropTypes.number,
    };

    state = {
        calendarDate: this.closestSlot(),
        // scrollTime: new Date(),
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

    closestSlot(date = new Date()) {
        const start = this.toTime(date, WORKING_TIME_START);
        const endTime = this.toTime(date, WORKING_TIME_END);
        const current = new Date();
        let startTime = moment(start);

        while (true) {
            const next = moment(startTime).add(TIME_SLOT_DURATION, 'minutes');

            if (next > endTime) {
                const tomorrow = moment(start).add(1, 'days').toDate();

                Object.assign(this.state || {}, {
                    calendarDate: tomorrow,
                });

                return tomorrow;
            }

            if (current < start) {
                return start;
            }

            if (next.toDate() >= endTime) {
                return startTime;
            }

            if (next.toDate() > current) {
                return next.toDate();
            }

            startTime = next;
        }
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

    onDateChange = (date, dir) => {
        const newDate = moment(date).add(dir, 'days');
        const current = moment().format('YYYYMMDD') | 0;
        const calendarDate = (newDate.format('YYYYMMDD') | 0) === current
            ? this.closestSlot()
            : this.toTime(new Date(newDate.toISOString()), WORKING_TIME_START);

        this.setState({ calendarDate });
    };

    onSlotSelect = date => event => {
        if (RX_DISABLED.test((event.currentTarget || {}).className || '')) {
            return false;
        }

        console.log(`Slot clicked: ${date}`);
    };

    customSlot = (date) => {
        const now = new Date();
        const start = this.toTime(date, WORKING_TIME_START);
        const end = this.toTime(date, WORKING_TIME_END);
        const props = {
            className: 'active',
            onClick: this.onSlotSelect(date),
            title: "Click to reserve this time..."
        };

        if (date < now || date < start || date > end) {
            Object.assign(props, {
                className: 'disabled',
                title: date < now
                    ? 'This time has been already passed'
                    : 'Car Wash is closed at this time',
            });
        }

        return props;
    };

    onSelect = (event) => {
        const start = this.toTime(event.start, WORKING_TIME_START);
        const end = this.toTime(event.start, WORKING_TIME_END);

        return event.start >= Date.now() &&
            event.start >= start &&
            event.end <= end
        ;
    };

    toTime(date, timeStr, subtract = 0) {
        const [hours, minutes] = timeStr.split(':');

        return moment(new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hours | 0,
            minutes | 0,
            0,
        )).add(subtract, 'minutes').toDate();
    }

    render() {
        const { data, timeSlotDuration } = this.props;
        const { boxes } = data;
        const isAdmin = ((AppStore.get(AUTH_KEY) || {}).user || {}).isAdmin;
        const localizer = BigCalendar.momentLocalizer(moment);
        const events = [];
        const resources = isAdmin
            ? new Array(boxes).fill({}).map((_, i) =>
                Object.assign(_, { id: i, title: `Box #${i + 1}` }))
            : [{ id: 'user-box', title: 'Choose desirable washing time'}];
        const start = this.toTime(this.state.calendarDate, WORKING_TIME_START);
        const now = this.closestSlot();
        const min = start > now ? start : now;
        const max = this.toTime(
            this.state.calendarDate,
            WORKING_TIME_END,
            -1 * (timeSlotDuration || TIME_SLOT_DURATION));

        return <BigCalendar
            className="time-table"
            localizer={localizer}
            events={events}
            defaultView="day"
            startAccessor="start"
            endAccessor="end"
            resources={resources}
            defaultDate={this.state.calendarDate}
            components={{
                toolbar: CalendarToolbar(
                    this.initTimers,
                    this.clearTimers,
                    this.onDateChange,
                    max < new Date().getTime(),
                ),
            }}
            step={timeSlotDuration || TIME_SLOT_DURATION}
            timeslots={1}
            views={[BigCalendar.Views.DAY]}
            slotPropGetter={this.customSlot}
            onSelecting={this.onSelect}
            min={min}
            max={max}
        />;
    }
}

TimeTable = createFragmentContainer(TimeTable, OptionsFragment);
