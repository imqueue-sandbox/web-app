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
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ExpansionPanelSummary
    from '@material-ui/core/ExpansionPanelSummary/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography/Typography';
import ExpansionPanelDetails
    from '@material-ui/core/ExpansionPanelDetails/ExpansionPanelDetails';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel/ExpansionPanel';
import User from './User';
import UserCars from './UserCars';
import { withStyles } from "@material-ui/core";

const styles = theme => ({
    root: {
        width: '100%',
    },
    right: {
        justifyContent: 'flex-start',
    },
    grey: {
        background: '#f5f5f5',
    },
    summary: {
        background: theme.palette.secondary.main,
        '& *': {
            color: theme.palette.primary.contrastText + ' !important',
        },
    },
    heading: {
        fontSize: theme.typography.pxToRem(18),
    },
    icon: {
        verticalAlign: 'bottom',
        height: 20,
        width: 20,
    },
    details: {
        alignItems: 'center',
        marginTop: 40 + 'px',
    },
    column: {
        flexBasis: '33.33%',
    },
    helper: {
        borderLeft: `2px solid ${theme.palette.divider}`,
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    link: {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'underline',
        },
    },
});

class Profile extends PureComponent {
    render() {
        const { classes, data } = this.props;

        return <div>
            <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMore />}
                    className={classes.summary}
                >
                    <div className={classes.column}>
                        <Typography className={classes.heading}>
                            Customer Details
                        </Typography>
                    </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                    <User data={data.user} />
                </ExpansionPanelDetails>
            </ExpansionPanel>

            <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMore />}
                    className={classes.summary}
                >
                    <div className={classes.column}>
                        <Typography className={classes.heading}>
                            Garage
                        </Typography>
                    </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails className={classes.details}>
                    <UserCars data={data.user}  />
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </div>;
    }
}

Profile.propTypes = {
    classes: PropTypes.object.isRequired
};

Profile = withStyles(styles)(Profile);

export { Profile };
