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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFragment, useRefetchableFragment } from 'react-relay';
import moment from 'moment';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import {
    CalendarToolbar,
    CalendarTimeGutter,
    CalendarTimeSlot,
    CalendarEvent,
} from './Calendar';
import type { CalendarEventData } from './Calendar';
import { OptionsFragment, ReservationsFragment } from '../relay/queries';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import { useReserve, useCancelReservation } from '../relay/mutations';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    AppStore,
    AUTH_KEY,
    CAR_KEY,
    SLOT_KEY,
    withoutElement,
} from '../common';
import { AppMessage } from '.';
import type { AppError } from '../types';
import type {
    Options_options$key,
} from '../relay/queries/fragments/__generated__/Options_options.graphql';
import type {
    Reservations$data,
    Reservations$key,
} from '../relay/queries/fragments/__generated__/Reservations.graphql';
import type {
    ReservationsRefetchQuery,
} from '../relay/queries/fragments/__generated__/ReservationsRefetchQuery.graphql';
import type {
    UserCars$data,
} from '../relay/queries/fragments/__generated__/UserCars.graphql';

moment.locale(
    (navigator as Navigator & { userLanguage?: string }).userLanguage
        || navigator.language,
);

const RX_UNAUTHORIZED = /\bunauthorized\b/i;

/** Minutes of a single calendar row. */
const STEP = 15;

/**
 * The reservations of one day. Both the `Reservations` fragment and the
 * `reserve`/`cancelReservation` payloads select the very same fields, so the
 * list a mutation answers with can replace the one the fragment holds.
 */
type ReservationList = Reservations$data['reservations'];

/** A single reservation out of such a list. */
type Reservation = NonNullable<NonNullable<ReservationList>[number]>;

/** A car of the user's garage — what `AppStore` keeps under `CAR_KEY`. */
type GarageCar = NonNullable<NonNullable<UserCars$data['cars']>[number]>;

/** The upcoming whole minute, which is when the view has to re-render next. */
function closestMinute(now = new Date()): Date {
    return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        60, 0,
    );
}

/** Turns an `HH:mm` opening hour into a point in time of the given day. */
function toTime(time: string | null | undefined, date: Date): Date {
    const [hours, minutes] = (time || '')
        .split(':')
        .map(item => Number(item) | 0);

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours, minutes, 0, 0,
    );
}

/** Describes a reservation the way react-big-calendar wants to render it. */
function buildEvent(item: Reservation): CalendarEventData {
    const { car, user, id } = item;
    const userTitle = user ? `${user.firstName} ${user.lastName}` : '';
    const carTitle = car ?
        `${car.regNumber}, ${car.make} ${car.model}` : '';
    const start = moment.parseZone(item.start).toDate();
    const end = moment.parseZone(item.end).toDate();
    let title = carTitle + (carTitle && userTitle ? ', ' : '') + userTitle;

    if (!title) {
        title = 'Reserved';
    }

    return {
        id,
        title,
        user: user ?? undefined,
        car: car ?? undefined,
        start,
        end,
    };
}

interface Props {
    /**
     * Washing duration, minutes — the length of the block a click on a free
     * slot reserves. Required because the time-slot wrapper computes the block
     * geometry out of it; `AppView` always resolves it to a number.
     */
    timeSlotDuration: number;
    /** Reference to the reservations to show; re-fetched on date navigation. */
    data: Reservations$key;
    /** Reference to the opening hours and washing types of the car wash. */
    options: Options_options$key;
    /** The car a new reservation is made for; `null` until one is picked. */
    car?: GarageCar | null;
}

/**
 * Day view of the washing reservations: shows what is already booked, lets a
 * free slot be reserved for the selected car and an own reservation be
 * cancelled again, and re-fetches itself whenever another day is navigated to.
 */
export function TimeTable(props: Props) {
    const { car, timeSlotDuration } = props;
    const [reservationsData, refetch] = useRefetchableFragment<
        ReservationsRefetchQuery,
        Reservations$key
    >(ReservationsFragment, props.data);
    const options = useFragment<Options_options$key>(
        OptionsFragment,
        props.options,
    );
    const [reserveWashing] = useReserve();
    const [cancelWashing] = useCancelReservation();
    const [errors, setErrors] = useState<AppError[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentDate, setCurrentDate] = useState(() => new Date());
    /**
     * Whether the minute timer runs, which it does exactly while today is the
     * day on display — any other day has no moving "now" to follow.
     */
    const [ticking, setTicking] = useState(true);
    /**
     * The list a `reserve`/`cancelReservation` answer has just delivered, boxed
     * so that a payload carrying no list still counts as an answer. `null` means
     * "show what the fragment holds", which a re-fetch restores.
     */
    const [saved, setSaved] = useState<{ list: ReservationList } | null>(null);
    const interval = useRef<ReturnType<typeof setInterval> | null>(null);
    const reservations = saved ? saved.list : reservationsData.reservations;

    // Re-renders on every minute boundary, so that the split between passed and
    // still bookable slots keeps up with the clock.
    useEffect(() => {
        if (!ticking) {
            return;
        }

        const tick = () => setCurrentDate(new Date());
        const timeout = setTimeout(() => {
            tick();
            interval.current = setInterval(tick, 60000);
        }, closestMinute().getTime() - Date.now());

        return () => {
            clearTimeout(timeout);

            if (interval.current) {
                clearInterval(interval.current);
                interval.current = null;
            }
        };
    }, [ticking]);

    const onError = useCallback((requestErrors: AppError[]) => {
        if (requestErrors.some(error => RX_UNAUTHORIZED.test(error.message))) {
            AppStore.del(AUTH_KEY);
        }

        setLoading(false);
        setErrors(requestErrors);
    }, []);

    const onUpdate = useCallback((list: ReservationList, date: Date) => {
        setSaved({ list });
        setLoading(false);
        setCurrentDate(date);
    }, []);

    const onDateChange = useCallback((date: Date) => {
        const given = Number(moment(date).format('YYYYMMDD')) | 0;
        const current = Number(moment().format('YYYYMMDD')) | 0;

        setTicking(given === current);
        setLoading(true);
        // the fragment argument is a `String`, and an ISO date is what the
        // legacy container ended up sending for a `Date` variable anyway
        refetch({ date: date.toISOString() }, {
            fetchPolicy: 'network-only',
            onComplete: () => {
                setSaved(null);
                setLoading(false);
                setCurrentDate(date);
            },
        });
    }, [refetch]);

    const reserve = useCallback((start: Date, end: Date) => {
        // the selected car is read from the store rather than from the props,
        // so that a car picked after this handler was built is still honoured
        const selected = AppStore.get<GarageCar>(CAR_KEY);
        const slot = Number(AppStore.get<number>(SLOT_KEY));

        setLoading(true);
        reserveWashing({
            carId: selected?.id ?? '',
            type: options.baseTime?.find(
                item => Number(item?.duration) === slot,
            )?.key ?? '',
            duration: [moment(start), moment(end)],
        }, {
            success: payload => onUpdate(payload.reservations, start),
            failure: onError,
        });
    }, [reserveWashing, options.baseTime, onUpdate, onError]);

    const cancelReservation = useCallback((
        reservationId: string,
        date: Date,
    ) => {
        setLoading(true);
        cancelWashing(reservationId, {
            success: payload => onUpdate(payload.reservations, date),
            failure: onError,
        });
    }, [cancelWashing, onUpdate, onError]);

    const errorClose = useCallback((key: number) => () => {
        setErrors(current => withoutElement(current, key));
    }, []);

    const events = useMemo(() => (reservations || [])
        .filter((item): item is Reservation => !!item)
        .map(buildEvent),
    [reservations]);
    const localizer = useMemo(() => momentLocalizer(moment), []);
    const min = toTime(options.start, currentDate);
    const max = toTime(options.end, currentDate);
    const hasErrors = errors.length > 0;

    return <>
        <Calendar<CalendarEventData>
            localizer={localizer}
            events={events}
            defaultView="day"
            startAccessor="start"
            endAccessor="end"
            defaultDate={currentDate}
            components={{
                toolbar: CalendarToolbar(onDateChange),
                // marks the gutter so that `CalendarTimeSlot` can tell its
                // slots from the reservable ones of the day column
                timeGutterWrapper: CalendarTimeGutter,
                eventWrapper: CalendarEvent(
                    min,
                    STEP,
                    cancelReservation,
                ),
                timeSlotWrapper: CalendarTimeSlot(
                    max,
                    events,
                    STEP,
                    timeSlotDuration,
                    car || {},
                    reserve,
                ),
            }}
            step={STEP}
            timeslots={60 / STEP}
            views={[Views.DAY]}
            min={min}
            // the whole working day is on display, up to its very last minute:
            // a reservation is allowed to end exactly at `max`, so cutting the
            // closing hour here would let the slot being booked stretch below
            // the last row rendered, over the empty space past the day
            max={max}
        />
        <CircularProgress
            style={{ display: loading ? 'block' : 'none' }}
            size={50}
            className="rbc-loader"
        />
        {hasErrors && errors.map((error, key) =>
            <Snackbar
                key={key}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={hasErrors}
                autoHideDuration={5000}
                onClose={errorClose(key)}
            >
                <AppMessage
                    key={key}
                    variant="error"
                    message={error.message}
                    onClose={errorClose(key)}
                />
            </Snackbar>
        )}
    </>;
}
