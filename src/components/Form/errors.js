
import React from 'react';
import {AppMessage} from '../AppMessage';

export function errorList(errors, cls) {
    return errors && errors.length ? errors.map((err, i) =>
        <AppMessage
            key={i}
            variant="error"
            message={err.message}
            className="errorMsg"
        />
    ): null
}
