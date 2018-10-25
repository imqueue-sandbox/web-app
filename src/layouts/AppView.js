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
import Avatar from '@material-ui/core/Avatar';
import Waves from '@material-ui/icons/Waves';

import { logout } from '../relay/mutations';
import { TimeTable, Profile } from '../components';
import { UserStorage } from '../common';
import { withAppRootQuery } from '../relay/queries';

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
        minWidth: 0, // So the Typography noWrap works
    },
    toolbar: theme.mixins.toolbar,
});

function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
}

class AppView extends PureComponent {
    state = {
        auth: true
    }

    logout = () => {
        const token = (UserStorage.fetch() || {}).token;
        token && logout(token);
        UserStorage.clear();
    }

    render() {
        const { classes } = this.props;
        const {user} = UserStorage.fetch();
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
                            component={Link} to="/"
                            variant="h6"
                            color="inherit"
                            className={classes.grow}
                            noWrap
                        >
                            CarWash Reservations
                        </Typography>
                        <div>
                            <span>{`Hello ${user['firstName']}`}</span>
                            <IconButton
                                disableRipple={true}
                            >
                                { user.avatarUrl ?
                                    <Avatar
                                        alt={fullName}
                                        src={user.avatarUrl}
                                    /> : <Avatar>{letters}</Avatar>
                                }
                            </IconButton>
                            <IconButton
                                onClick={this.logout}
                            >
                                <svg style={{'width': 24, 'height':24}} viewBox="0 0 24 24">
                                    <path fill="white" d="M17,17.25V14H10V10H17V6.75L22.25,12L17,17.25M13,2A2,2 0 0,1 15,4V8H13V4H4V20H13V16H15V20A2,2 0 0,1 13,22H4A2,2 0 0,1 2,20V4A2,2 0 0,1 4,2H13Z" />
                                </svg>
                            </IconButton>
                        </div>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <div className={classes.toolbar}/>
                    <List>
                        <ListItemLink href="/">
                            <ListItemText primary="TimeTable" />
                        </ListItemLink>
                        <ListItemLink href="/profile">
                            <ListItemText primary="Profile" />
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

AppView = withAppRootQuery(withStyles(styles)(AppView));

export { AppView };
