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
import PropTypes from 'prop-types';
import {
    createFragmentContainer,
    createRefetchContainer,
} from 'react-relay';
import moment from 'moment';
import BigCalendar  from 'react-big-calendar';
import {
    CalendarToolbar,
    CalendarTimeSlot,
    CalendarEvent,
} from './Calendar';
import {
    OptionsFragment,
    ReservationsQuery,
    ReservationsFragment,
} from '../relay/queries';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale(navigator.userLanguage || navigator.language);

const ReservationsType = PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    car: PropTypes.object,
    user: PropTypes.object,
}));

export class TimeTable extends Component {
    /**
     * Reservations will be either bypassed as a reservations property or
     * through a relay data fragment from a root query.
     */
    static propTypes = {
        timeSlotDuration: PropTypes.number,
        data: PropTypes.shape({ reservations: ReservationsType }).isRequired,
        reservations: ReservationsType,
        options: PropTypes.object.isRequired,
        onChange: PropTypes.func,
        currentDate: PropTypes.instanceOf(Date),
        car: PropTypes.object,
    };

    state = {
        reservations: null,
    };
    timeout = null;
    interval = null;

    initTimers = () => {
        if (this.timeout || this.interval) {
            return;
        }

        this.timeout = setTimeout(() => {
            this.setState({ currentDate: new Date() });
            this.interval = setInterval(
                () => this.setState({ currentDate: new Date() }),
                300000, // each 5 minutes
            );
        }, this.closestMinute().getTime() - Date.now());
    };

    clearTimers = () => {
        this.timeout && clearTimeout(this.timeout);
        this.interval && clearInterval(this.interval);
        this.timeout = this.interval = null;
    };

    onDateChange = date => {
        const given = moment(date).format('YYYYMMDD') | 0;
        const current = moment().format('YYYYMMDD') | 0;

        this[`${given === current ? 'init' : 'clear'}Timers`]();
        this.refetch(date);
    };

    refetch = date => {
        /**
         * When refetch is done we need to pass-back reservations data to a
         * parent component to make sure it will be able to pass it back
         * during this component re-rendering and make sure re-fetched data
         * will not be override by initial data from a root query fragment
         * which is required only on initial page load.
         */
        this.props.relay.refetch({ date }, null, () => {
            const { onChange } = this.props;
            onChange && onChange(this.props.data.reservations, date);
        }, { force: true });
    }

    componentDidMount() {
        this.initTimers();
    }

    componentWillUnmount() {
        this.clearTimers();
    }

    closestMinute(now = new Date()) {
        return new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes(),
            60, 0,
        );
    }

    toTime(time, date = this.props.currentDate || new Date()) {
        const [hours, minutes] = time.split(':').map(item => item | 0);
        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hours, minutes, 0, 0,
        );
    }

    render() {
        const events = (this.props.reservations ||
            this.props.data.reservations).map(item => ({
            title: `Customer: ${item.user.firstName} ${item.user.lastName}
                Car: ${item.car.regNumber}, ${item.car.make} ${item.car.model}`,
            start: moment.parseZone(item.start).toDate(),
            end: moment.parseZone(item.end).toDate(),
        }));
        const localizer = BigCalendar.momentLocalizer(moment);
        const min = this.toTime(this.props.options.start);
        const max = this.toTime(this.props.options.end);
        const step = 15;
        const slots = 60 / step;
        const timeBlock = this.props.timeSlotDuration;
        const { car } = this.props;
        // const resources = [
        //     { id: 1, title: 'Box #1' },
        //     { id: 2, title: 'Box #2' },
        //     { id: 3, title: 'Box #3' },
        // ];

        return <BigCalendar
            className="time-table"
            localizer={localizer}
            events={events}
            defaultView="day"
            startAccessor="start"
            endAccessor="end"
            // resources={resources}
            defaultDate={this.props.currentDate || new Date()}
            components={{
                toolbar: CalendarToolbar(this.onDateChange),
                eventWrapper: CalendarEvent(min, step),
                timeSlotWrapper: CalendarTimeSlot(events, step, timeBlock, car),
            }}
            step={step}
            timeslots={slots}
            views={[BigCalendar.Views.DAY]}
            min={min}
            max={new Date(max.getTime() - 3600 * 1000)}
        />;
    }
}

TimeTable = createRefetchContainer(
    TimeTable,
    ReservationsFragment,
    ReservationsQuery,
);
TimeTable = createFragmentContainer(TimeTable, OptionsFragment);
