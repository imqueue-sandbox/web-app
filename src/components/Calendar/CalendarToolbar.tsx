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
import Button from '@mui/material/Button';
import type { NavigateAction } from 'react-big-calendar';
import { AppStore, AUTH_KEY } from '../../common';
import type { AuthInfo } from '../../types';

/** The part of the react-big-calendar toolbar props this toolbar makes use of. */
interface CalendarToolbarProps {
    /** Date the calendar currently shows. */
    date: Date;
    onNavigate: (action: NavigateAction) => void;
}

export const CalendarToolbar = (
    onChange?: (date: Date) => void,
) => (toolbar: CalendarToolbarProps) => {
    const isAdmin = AppStore.get<AuthInfo>(AUTH_KEY)?.user?.isAdmin;
    const hasPast = () => {
        if (isAdmin) {
            return true;
        }

        const toolDate = Number(moment(toolbar.date).format('YYYYMMDD')) | 0;
        const current = Number(moment().format('YYYYMMDD')) | 0;

        return current < toolDate;
    };

    const goToBack = () => {
        onChange && onChange(moment(toolbar.date).add(-1, 'days').toDate());
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        onChange && onChange(moment(toolbar.date).add(1, 'days').toDate());
        toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
        onChange && onChange(new Date());
        toolbar.onNavigate('TODAY');
    };

    const cantGoBack = !hasPast();

    return <div className="rbc-toolbar">
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
                disabled={cantGoBack}
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
