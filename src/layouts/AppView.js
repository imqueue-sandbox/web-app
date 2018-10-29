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
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ExitToApp from '@material-ui/icons/ExitToApp';
import Avatar from '@material-ui/core/Avatar';
import Waves from '@material-ui/icons/Waves';

import { logout } from '../relay/mutations';
import { TimeTable, Profile } from '../components';
import { AuthStorage } from '../common';
import { AppRootQuery, withQuery } from '../relay/queries';

const drawerWidth = 240;

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
        zIndex: theme.zIndex.drawer + 1,
        '& *': {
            color: '#fff !important',
            textDecoration: 'none',
        },
    },
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        minWidth: 0,
        overflow: 'auto',
    },
    toolbar: theme.mixins.toolbar,
    supTitle: {
        color: theme.palette.primary.light + ' !important',
        marginLeft: '.5em',
    },
});

function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
}

class AppView extends Component {
    logout = () => {
        const token = AuthStorage.token();
        token && logout(token);
        AuthStorage.clear();
    }

    render() {
        const { classes } = this.props;
        const user = AuthStorage.user();
        const letters = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
        const fullName = `${user.firstName} ${user.lastName}`

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
                        <div>
                            <span>
                                {`Hello, ${fullName}`}
                            </span>
                            <IconButton disableRipple>
                                { user.avatarUrl ?
                                    <Avatar
                                        alt={fullName}
                                        src={user.avatarUrl}
                                    /> : <Avatar>{letters}</Avatar>
                                }
                            </IconButton>
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
                    <List>
                        <ListItemLink href="/">
                            <ListItemText primary="Car Wash Bookings" />
                        </ListItemLink>
                        <ListItemLink href="/profile">
                            <ListItemText primary="My Profile" />
                        </ListItemLink>
                    </List>
                </Drawer>
                <main className={classes.content}>
                    <div className={classes.toolbar}/>
                    <Route
                        exact
                        path="/"
                        component={() => <TimeTable data={this.props.data}/>}
                    />
                    <Route
                        path="/profile"
                        component={() => <Profile data={this.props.data}/>}
                    />
                </main>
            </div>
        )
    }
}

AppView.propTypes = {
    classes: PropTypes.object.isRequired,
};

AppView = withQuery(AppRootQuery)(withStyles(styles)(AppView));

export { AppView };
