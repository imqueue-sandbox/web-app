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
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Lock from '@material-ui/icons/Lock';
import Waves from '@material-ui/icons/Waves';
import Person from '@material-ui/icons/Person';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { logout } from '../relay/mutations';
import { TimeTable, Profile } from '../components';
import { UserStorage } from "../common";

import environment from '../relay/Environment';
import { QueryRenderer, graphql } from 'react-relay';

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

class AppView extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            auth: true,
            anchorEl: null
        };
    }

    handleMenu = event => {
        this.setState({ anchorEl: event.currentTarget });
    }

    handleClose = () => {
        this.setState({ anchorEl: null });
    }

    logout = () => {
        const token = (UserStorage.fetch() || {}).token;
        this.handleClose();
        token && logout(token);
    }

    render() {
      // TODO: here can be QueryRenderer which is fetching: users, cars, brands
        const { classes } = this.props;
        const open = Boolean(this.state.anchorEl);
        return (
          <QueryRenderer
              environment={environment}
              query={graphql`
                query AppViewQuery($brand: String!) {
                  ...User_user
                  cars(brand: $brand) {
                    ...Cars_cars
                  }
                  brands
                }
              `}
              variables={{
                brand: "Renault"
              }}
              render={({error, props}) => {
                if (error) {
                  return <div>{error.message}</div>;
                } else if (props) {

                  console.log('AppView::', props);

                  return (
                    <Router>
                        <div className={classes.root}>
                            <AppBar position="absolute" className={classes.appBar}>
                                <Toolbar>
                                    <Link to="/">
                                        <Waves className={classes.logo} />
                                    </Link>
                                    <Typography component={Link} to="/"
                                        variant="h6"
                                        color="inherit"
                                        className={classes.grow}
                                        noWrap
                                    >
                                        CarWash Reservations
                                    </Typography>
                                    <div>
                                        <IconButton
                                            aria-owns={open ? 'menu-appbar' : null}
                                            aria-haspopup="true"
                                            onClick={this.handleMenu}
                                            color="inherit"
                                        >
                                            <AccountCircle />
                                        </IconButton>
                                            <Menu
                                                id="menu-appbar"
                                                anchorEl={this.state.anchorEl}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={open}
                                                onClose={this.handleClose}
                                            >
                                                <MenuItem
                                                    component={Link}
                                                    to="/profile"
                                                    onClick={this.handleClose}
                                                >
                                                    <Person/>
                                                    Profile
                                                </MenuItem>
                                                <Divider/>
                                                <MenuItem onClick={this.logout}>
                                                    <Lock/>
                                                    Logout
                                                </MenuItem>
                                            </Menu>
                                    </div>
                                </Toolbar>
                            </AppBar>
                            <Drawer
                                variant="permanent"
                                classes={{
                                    paper: classes.drawerPaper,
                                }}
                            >
                                <div className={classes.toolbar} />
                                <List></List>
                                <Divider />
                                <List></List>
                            </Drawer>
                            <main className={classes.content}>
                                <div className={classes.toolbar} />
                                <Route
                                  exact
                                  path="/"
                                  component={ (prop) => <TimeTable {...prop}/> }
                                />
                                <Route
                                  path="/profile"
                                  component={ (props) => <Profile {...props}/> }
                                />
                            </main>
                        </div>
                    </Router>
                  )
                }
                return <div>Loading...</div>;
              }}
          />
        )
    }
}

AppView.propTypes = {
    classes: PropTypes.object.isRequired,
};

AppView = withStyles(styles)(AppView);

export { AppView };
