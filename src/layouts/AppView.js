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
import { Route, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ExitToApp from '@material-ui/icons/ExitToApp';
import Person from '@material-ui/icons/Person';
import Timelapse from '@material-ui/icons/Timelapse';
import Avatar from '@material-ui/core/Avatar';
import Waves from '@material-ui/icons/Waves';
import Divider from '@material-ui/core/Divider';
import { logout } from '../relay/mutations';
import {
    TimeTable,
    Profile,
    WashingTypeSelector,
    CarSelector
} from '../components';
import { Gravatar } from '../components/Gravatar';
import { AppStore, AUTH_KEY, SLOT_KEY } from '../common';
import { AppRootQuery, withQuery } from '../relay/queries';

const drawerWidth = 350;

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
    },
    logo: {
        marginRight: '15px',
    },
    grow: {
        flexGrow: 1,
    },
    appBar: {
        background: '#333',
        zIndex: theme.zIndex.drawer + 1,
        '& *': {
            color: '#fff !important',
            textDecoration: 'none',
        },
    },
    appBarUser: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
        paddingTop: '5px'
    },
    content: {
        flexGrow: 1,
        backgroundColor: '#eee',
        padding: theme.spacing.unit * 3,
        minWidth: 0,
        overflow: 'auto',
    },
    toolbar: theme.mixins.toolbar,
    supTitle: {
        color: theme.palette.secondary.light + ' !important',
        marginLeft: '.5em',
    },
    selected: {
        backgroundColor: '#eee',
        boxShadow: '1px 1px 5px #999',
    },
});

function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
}

class AppView extends Component {
    state = {
        timeSlotDuration: AppStore.get(SLOT_KEY) | 0,
        reservations: null,
    };

    componentDidMount() {
        AppStore.on('change', this.storeChange);
    }

    componentWillUnmount() {
        AppStore.off('change', this.storeChange);
    }

    is(routePath) {
        return this.props.route === `/${routePath}`;
    }

    storeChange = (key, timeSlotDuration) => {
        timeSlotDuration = timeSlotDuration | 0;

        if (timeSlotDuration && key === SLOT_KEY) {
            this.setState({ timeSlotDuration });
        }
    }

    logout = () => {
        const token = (AppStore.get(AUTH_KEY) || {}).token;
        token && logout(token);
        AppStore.del(AUTH_KEY);
    };

    /**
     * This handler is required to handle reservations re-fetch to be saved
     * for time-table re-rendering without data loss, because in other case
     * it will be re-written by initial data obtained from a root query
     * fragment, which was cached during the initial page load.
     *
     * @param {object} reservations
     */
    timeTableChange = (reservations) => {
        this.setState({ reservations });
    };

    render() {
        const { classes, data } = this.props;
        const user = (AppStore.get(AUTH_KEY) || {}).user;
        const letters = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        const fullName = `${user.firstName} ${user.lastName}`;

        return (
            <div className={classes.root}>
                <AppBar
                    position="absolute"
                    className={classes.appBar}
                >
                    <Toolbar>
                        <Link to="/">
                            <Waves className={classes.logo}/>
                        </Link>
                        <Typography
                            variant="h6"
                            color="inherit"
                            className={classes.grow}
                            noWrap
                        >
                            Car Wash Tutorial App
                            <sup className={classes.supTitle}>for @imqueue</sup>
                        </Typography>
                        <div className={classes.appBarUser}>
                            <span>
                                {`Hello, ${fullName}`}
                            </span>
                            {user.email
                                ? <Gravatar user={user} size={40} />
                                : <Avatar>{letters}</Avatar>
                            }
                            <IconButton onClick={this.logout}>
                                <ExitToApp/>
                            </IconButton>
                        </div>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    classes={{paper: classes.drawerPaper}}
                >
                    <div className={classes.toolbar}/>
                    <List className={classes.menuList}>
                        <Divider/>
                        <ListItemLink
                            href="/"
                            className={this.is('') ? classes.selected : ''}
                        >
                            <ListItemIcon><Timelapse /></ListItemIcon>
                            <ListItemText primary="Washing Time Reservations" />
                        </ListItemLink>
                        <ListItemLink
                            href="/profile"
                            className={this.is('profile') ?
                                classes.selected : ''}
                        >
                            <ListItemIcon><Person /></ListItemIcon>
                            <ListItemText primary="User Profile" />
                        </ListItemLink>
                        <Divider/>
                    </List>
                    {this.is('') &&
                        <WashingTypeSelector options={data.options}/>
                    }
                    {this.is('') && <Divider/>}
                    {this.is('') && <CarSelector data={data.user} />}
                </Drawer>
                <main className={classes.content}>
                    <div className={classes.toolbar}/>
                    <Route
                        exact
                        path="/"
                        component={() => <TimeTable
                            data={data}
                            options={data.options}
                            timeSlotDuration={this.state.timeSlotDuration}
                            onChange={this.timeTableChange}
                            reservations={this.state.reservations}
                        />}
                    />
                    <Route
                        path="/profile"
                        component={() => <Profile data={data}/>}
                    />
                </main>
            </div>
        )
    }
}

AppView.propTypes = {
    classes: PropTypes.object.isRequired,
    route: PropTypes.string.isRequired,
};

AppView = withQuery(AppRootQuery)(withStyles(styles)(AppView));

export { AppView };
