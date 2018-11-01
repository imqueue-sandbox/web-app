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
import React from 'react';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import { AppStore, AUTH_KEY } from '../common';

export const CalendarToolbar = (
    onToday,
    onOther,
    onChange,
    noToday = false,
) => (toolbar) => {
    const isAdmin = ((AppStore.get(AUTH_KEY) || {}).user || {}).isAdmin;
    const hasPast = () => {
        if (isAdmin) {
            return true;
        }

        const toolDate = moment(toolbar.date).format('YYYYMMDD') | 0;
        let current = moment().format('YYYYMMDD') | 0;

        if (noToday) {
            current = moment().add(1, 'days').format('YYYYMMDD') | 0;
        }

        return current < toolDate;
    };

    const isToday = (diff) => {
        const toolDate = (moment(toolbar.date).format('YYYYMMDD') | 0) + diff;
        const current = moment().format('YYYYMMDD') | 0;

        return toolDate === current;
    };

    const goToBack = () => {
        toolbar.onNavigate('PREV');
        isToday(-1) ? onToday && onToday() : onOther && onOther();
        onChange && onChange(toolbar.date, -1);
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
        isToday(1) ? onToday && onToday() : onOther && onOther();
        onChange && onChange(toolbar.date, 1);
    };

    const goToCurrent = () => {
        toolbar.onNavigate('TODAY');
        onToday && onToday();
        onChange && onChange(new Date(), 0);
    };

    const cantGoBack = !hasPast();

    return <div className={`rbc-toolbar${noToday ? ' no-today' : ''}`}>
        <span className="rbc-toolbar-group">
            <Button
                size="small"
                onClick={goToBack}
                disabled={cantGoBack}
            >
                &larr;
            </Button>
            <Button
                size="small"
                onClick={goToCurrent}
                disabled={noToday}
                className="today"
            >
                Today
            </Button>
            <Button size="small" onClick={goToNext}>&rarr;</Button>
        </span>
        <span className="rbc-toolbar-label">
            {moment(toolbar.date).format('dddd, LL')}
        </span>
    </div>;
};
