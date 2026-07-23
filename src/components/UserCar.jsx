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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import LocalCarWash from '@mui/icons-material/LocalCarWash';
import Delete from '@mui/icons-material/Delete';
import { removeCar } from '../relay/mutations';
import { carType, withStyles } from '../common';

const styles = theme => ({
    card: {
        display: 'flex',
        marginRight: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
        minWidth: '30em',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        textAlign: 'center',
    },
    content: {
        flex: '1 0 auto',
        paddingBottom: 0,
        padding: 0,
        margin: 0,
    },
    controls: {
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        justifyContent: 'flex-start',
    },
    carIcon: {
        height: 'initial !important',
        width: '3em',
        background: '#333',
        alignSelf: 'stretch',
        padding: '0 1em 0 1em',
        color: '#fff',
    },
    carNumber: {
        fontSize: '1em',
        marginTop: '.5em',
        fontWeight: 'bold',
        '& span': {
            display: 'inline-block',
            border: '.2rem solid #666',
            borderRadius: '.5em',
            padding: '.2em .5em',
            textTransform: 'uppercase',
        },
    },
    carModel: {
        fontSize: '1.3em',
        marginTop: '1.2em',
    },
    carType: {
        fontSize: '.9em',
        color: '#777',
    },
});

export class UserCar extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        car: PropTypes.shape({
            id: PropTypes.string.isRequired,
            make: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            regNumber: PropTypes.string.isRequired,
        }),
    };

    remove = () => {
        const carId = this.props.car && this.props.car.id;
        carId && removeCar({ carId });
    };

    render() {
        const { classes, car } = this.props;

        return <Card className={classes.card}>
            <LocalCarWash className={classes.carIcon}/>
            <div className={classes.details}>
                <CardContent className={classes.content}>
                    <Typography className={classes.carModel}>
                        <b>{car.make}</b><br/>
                        <i>{car.model}</i>
                    </Typography>
                    <Typography className={classes.carType}>
                        {carType(car.type)}
                    </Typography>
                    <Typography className={classes.carNumber}>
                        <span>{car.regNumber}</span>
                    </Typography>
                </CardContent>
                <CardActions className={classes.controls}>
                    <IconButton
                        onClick={this.remove}
                        title="Remove this car from garage"
                    >
                        <Delete/>
                    </IconButton>
                </CardActions>
            </div>
        </Card>;
    }
}

UserCar = withStyles(styles)(UserCar);
