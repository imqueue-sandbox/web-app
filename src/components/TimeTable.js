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
import { createFragmentContainer, createRefetchContainer } from 'react-relay';
import moment from 'moment';
import BigCalendar  from 'react-big-calendar';
import { CalendarToolbar, CalendarTimeSlot, CalendarEvent } from './Calendar';
import {
    OptionsFragment,
    ReservationsQuery,
    ReservationsFragment,
} from '../relay/queries';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import { reserve, cancelReservation } from '../relay/mutations';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AppStore, AUTH_KEY, CAR_KEY, SLOT_KEY } from '../common';
import { AppMessage } from '.';

moment.locale(navigator.userLanguage || navigator.language);

const RX_UNAUTHORIZED = /\bunauthorized\b/i;

export class TimeTable extends Component {
    static propTypes = {
        timeSlotDuration: PropTypes.number,
        data: PropTypes.shape({
            reservations: PropTypes.arrayOf(PropTypes.shape({
                id: PropTypes.string.isRequired,
                start: PropTypes.string.isRequired,
                end: PropTypes.string.isRequired,
                type: PropTypes.string.isRequired,
                car: PropTypes.object,
                user: PropTypes.object,
            })),
        }).isRequired,
        options: PropTypes.object.isRequired,
        car: PropTypes.object,
    };

    state = {
        reservations: null,
        errors: [],
        loading: false,
        currentDate: new Date(),
    };
    timeout = null;
    interval = null;

    initTimers = () => {
        if (this.timeout || this.interval) {
            return;
        }

        this.timeout = setTimeout(() => {
            this.timerUpdate();
            this.interval = setInterval(this.timerUpdate, 60000);
        }, this.closestMinute().getTime() - Date.now());
    };

    timerUpdate = () => {
        this.setState({ currentDate: new Date() });
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
        this.setState({ loading: true }, () =>
            this.props.relay.refetch({ date }, null, () => {
                this.onUpdate(date)(this.props.data);
            }, { force: true })
        );
    };

    onUpdate = (currentDate) => ({ reservations }) => {
        this.setState({ loading: false, reservations, currentDate });
    };

    onError = errors => {
        if (errors.some(error => RX_UNAUTHORIZED.test(error.message))) {
            AppStore.del(AUTH_KEY);
        }

        this.setState({ loading: false, errors });
    };

    reserve = (start, end) => {
        const car = AppStore.get(CAR_KEY);
        const duration = [start, end];
        const mutationInput = {
            carId: car.id,
            type: this.props.options.baseTime.find(item =>
                Number(item.duration) === Number(AppStore.get(SLOT_KEY))
            ).key,
            duration,
        };

        this.setState({ loading: true });
        reserve(mutationInput, this.onUpdate(start), this.onError);
    };

    cancelReservation = (reservationId, date) => {
        this.setState({ loading: true }, () =>
            cancelReservation(reservationId, this.onUpdate(date), this.onError)
        );
    };

    errorClose = key => () => {
        const errors = this.state.errors.slice(0);

        errors.splice(key, 1);
        this.setState({ errors });
    };

    componentDidMount() {
        this.setState({ reservations: this.props.data.reservations });
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

    toTime(time, date = this.state.currentDate || new Date()) {
        const [hours, minutes] = time.split(':').map(item => item | 0);

        return new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            hours, minutes, 0, 0,
        );
    }

    buildEvent(item) {
        const { car, user, id } = item;
        const userTitle = user ? `${user.firstName} ${user.lastName}` : '';
        const carTitle = item.car ?
            `${car.regNumber}, ${car.make} ${car.model}` : '';
        const start = moment.parseZone(item.start).toDate();
        const end = moment.parseZone(item.end).toDate();
        let title = carTitle + (carTitle && userTitle ? ', ' : '') + userTitle;

        if (!title) {
            title = 'Reserved';
        }

        return { id, title, user, car, start, end };
    }

    buildEvents() {
        return (this.state.reservations || []).map(this.buildEvent);
    }

    render() {
        const events = this.buildEvents();
        const localizer = BigCalendar.momentLocalizer(moment);
        const min = this.toTime(this.props.options.start);
        const max = this.toTime(this.props.options.end);
        const step = 15;
        const slots = 60 / step;
        const { car, timeSlotDuration } = this.props;
        const { errors } = this.state;
        const hasErrors = errors && errors.length > 0;

        return <>
            <BigCalendar
                className="time-table"
                localizer={localizer}
                events={events}
                defaultView="day"
                startAccessor="start"
                endAccessor="end"
                defaultDate={this.state.currentDate}
                components={{
                    toolbar: CalendarToolbar(this.onDateChange),
                    eventWrapper: CalendarEvent(
                        min,
                        step,
                        this.cancelReservation,
                    ),
                    timeSlotWrapper: CalendarTimeSlot(
                        max,
                        events,
                        step,
                        timeSlotDuration,
                        car || {},
                        this.reserve
                    ),
                }}
                step={step}
                timeslots={slots}
                views={[BigCalendar.Views.DAY]}
                min={min}
                max={new Date(max.getTime() - 3600 * 1000)}
            />
            <CircularProgress
                style={{ display: this.state.loading ? 'block' : 'none' }}
                size={50}
                className="rbc-loader"
            />
            {hasErrors && errors.map((error, key) =>
                <Snackbar
                    key={key}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    open={hasErrors}
                    autoHideDuration={5000}
                    onClose={this.errorClose(key)}
                >
                    <AppMessage
                        key={key}
                        variant="error"
                        message={error.message}
                        onClose={this.errorClose(key)}
                    />
                </Snackbar>
            )}
        </>;
    }
}

TimeTable = createRefetchContainer(
    TimeTable,
    ReservationsFragment,
    ReservationsQuery,
);
TimeTable = createFragmentContainer(TimeTable, OptionsFragment);
