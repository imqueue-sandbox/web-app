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
import { CalendarToolbar } from '.';
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

// const CalendarTimeSlot = events => props => {
//     if (busy(props.value, events)) {
//     }
//     // return <div className="rbc-time-slot"></div>
//     return props.children;
// };

const CalendarEvent = timeStart => props => {
    const slotHeight = (document.querySelector(
        '.rbc-day-slot .rbc-time-slot'
    ) || {}).offsetHeight || 16;
    const eventHeight = (
        props.event.end.getTime() -
        props.event.start.getTime()
    ) / (1000 * 60 * 15);
    const eventTop = (
        props.event.start.getTime() -
        timeStart.getTime()
    ) / (1000 * 60 * 15);

    return <div style={{
        position: 'relative',
        // border: '1px dotted red',
        padding: '5px 10px',
        top: eventTop * slotHeight + 'px',
        height: eventHeight * slotHeight + 'px',
        left: props.style.left + 'px',
        color: '#666',
    }}>
        <b>{moment(props.event.start).format('HH:mm')}&nbsp;&ndash;&nbsp;{
        moment(props.event.end).format('HH:mm')}&nbsp;&nbsp;</b>
        {props.event.title.split(/\r?\n/).map((line, key) =>
            <i key={key}>{line + (key ? '' : ';')}</i>)}
    </div>;
};

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

    busy(date, events) {
        return !!events.find(event => (
            event.start.getTime() <= date.getTime() &&
            event.end.getTime() > date.getTime()
        ));
    }

    slotPropGetter = events => (date) => {
        const props = {};
        const isBusy = this.busy(date, events);

        if (isBusy) {
            props.className = "disabled";
        }

        return props;
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
        // const today = new Date();
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
        // const resources = [
        //     { id: 1, title: 'Box #1' },
        //     { id: 2, title: 'Box #2' },
        //     { id: 3, title: 'Box #3' },
        // ];
        // console.log(events);
        // const events = [];

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
                eventWrapper: CalendarEvent(min),
                // timeSlotWrapper: CalendarTimeSlot(events),
            }}
            slotPropGetter={this.slotPropGetter(events)}
            step={15}
            timeslots={4}
            views={[BigCalendar.Views.DAY]}
            // slotPropGetter={this.customSlot}
            min={min}
            max={max}
        />;

        // return (<div>
        //     <button onClick={this.refetch}>refetch</button>
        //     <pre>options: {JSON.stringify(this.props.options, null, 2)}</pre>
        //     <pre>data: {JSON.stringify(reservations, null, 2)}</pre>
        // </div>);
    }
}

TimeTable = createRefetchContainer(
    TimeTable,
    ReservationsFragment,
    ReservationsQuery,
);
TimeTable = createFragmentContainer(TimeTable, OptionsFragment);
