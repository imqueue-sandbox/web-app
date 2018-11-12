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
import { Route } from 'react-router-dom';
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
import Person from '@material-ui/icons/Person';
import Timelapse from '@material-ui/icons/Timelapse';
import Waves from '@material-ui/icons/Waves';
import Divider from '@material-ui/core/Divider';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import ExitToApp from '@material-ui/icons/ExitToApp';

import {
    TimeTable,
    Profile,
    WashingTypeSelector,
    CarSelector,
    AuthUser,
} from '../components';
import { AppStore, CAR_KEY, SLOT_KEY } from '../common';
import { AppRootQuery, withQuery } from '../relay/queries';

const drawerWidth = 320;

function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
}

const drawerStyles = theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('md')]: {
            width: drawerWidth,
            flexShrink: 0,
        }
    },
    drawerPaper: {
        width: drawerWidth,
        paddingTop: '60px',
    },
    drawerPaperMobile: {
        width: drawerWidth,
        paddingTop: '5px',
    },
    selected: {
        backgroundColor: '#eee',
        boxShadow: '1px 1px 5px #999',
    },
});

class ResponsiveDrawer extends React.Component {
  is(routePath) {
      return this.props.route === `/${routePath}`;
  }

  _getDrawer() {
      const { classes, data } = this.props;

      return (
          <div>
              <List>
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
          </div>
      );
  }

  render() {
    const { classes, theme, mobileOpen, handleDrawerToggle } = this.props;

    return (
      <div className={classes.root}>
        <CssBaseline />
        <nav className={classes.drawer}>
          {/* The implementation can be swap with js to avoid SEO duplication of links. */}
          <Hidden mdUp implementation="css">
            <Drawer
              variant="temporary"
              anchor={theme.direction === 'rtl' ? 'right' : 'left'}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{ paper: classes.drawerPaperMobile }}
              ModalProps={{ keepMounted: true }} // Better open performance on mobile.
            >
              {this._getDrawer()}
            </Drawer>
          </Hidden>
          <Hidden smDown implementation="css">
            <Drawer
              classes={{ paper: classes.drawerPaper }}
              variant="permanent"
              open
            >
              {this._getDrawer()}
            </Drawer>
          </Hidden>
        </nav>
      </div>
    );
  }
}

const ResponsiveDrawerComponent = withStyles(
    drawerStyles,
    { withTheme: true },
)(ResponsiveDrawer);

const styles = theme => ({
    root: {
        flexGrow: 1,
        zIndex: 1,
        position: 'relative',
        display: 'flex',
        flex: 1,
    },
    appBar: {
        width: '100%',
        background: '#333',
        zIndex: theme.zIndex.drawer + 1,
        '& *': {
            color: '#fff',
            textDecoration: 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
    },
    toolbar: theme.mixins.toolbar,
    toolbarContent: {
        flexDirection: 'row',
        display: 'flex',
    },
    menuButton: {
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    logo: {
        marginRight: '5px',
    },
    grow: {
        display: 'flex',
        flexGrow: 1,
        textDecoration: 'none',
        minHeight: '64px',
        justifyContent: 'center',
        alignItems: 'center',
    },
    supTitle: {
        color: theme.palette.secondary.light + ' !important',
        marginLeft: '.5em',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        }
    },
    user: {
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
        flexDirection: 'row',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 2,
        backgroundColor: '#eee',
    },
});

export class AppView extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        route: PropTypes.string.isRequired,
    };

    state = {
        timeSlotDuration: AppStore.get(SLOT_KEY) | 0,
        reservations: null,
        currentDate: new Date(),
        car: AppStore.get(CAR_KEY),
        mobileOpen: false
    };

    componentDidMount() {
        AppStore.on('change', this.storeChange);
    }

    componentWillUnmount() {
        AppStore.off('change', this.storeChange);
    }

    storeChange = (key, item) => {
        if (!item) {
            return ;
        }

        if (key === SLOT_KEY) {
            this.setState({ timeSlotDuration: item | 0 });
        }

        else if (key === CAR_KEY) {
            this.setState({ car: item });
        }
    };

    handleDrawerToggle = () => {
        this.setState(state => ({ mobileOpen: !state.mobileOpen }));
    };

    /**
     * This handler is required to handle reservations re-fetch to be saved
     * for time-table re-rendering without data loss, because in other case
     * it will be re-written by initial data obtained from a root query
     * fragment, which was cached during the initial page load.
     *
     * @param {object} reservations
     */
    timeTableChange = (reservations, currentDate) => {
        this.setState({ currentDate, reservations });
    };

    render() {
        const { classes, data, route } = this.props;
        const { mobileOpen, car, timeSlotDuration } = this.state;

        return (
            <div className={classes.root}>
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <div className={classes.toolbarContent}>
                            <IconButton
                                color="inherit"
                                aria-label="Open drawer"
                                onClick={this.handleDrawerToggle}
                                className={classes.menuButton}
                            >
                                <Waves className={classes.logo}/>
                            </IconButton>
                            <Typography
                                variant="h6"
                                color="inherit"
                                className={classes.grow}
                                noWrap
                            >
                                Car Wash Tutorial App
                                <sup className={classes.supTitle}>for @imqueue</sup>
                            </Typography>
                        </div>
                        <div className={classes.toolbarContent}>
                            <div className={classes.user}>
                                <AuthUser data={data.user}/>
                            </div>
                            <IconButton onClick={this.logout}><ExitToApp/></IconButton>
                        </div>
                    </Toolbar>
                </AppBar>
                <ResponsiveDrawerComponent
                    data={data}
                    route={route}
                    mobileOpen={mobileOpen}
                    timeTableChange={this.timeTableChange}
                    handleDrawerToggle={this.handleDrawerToggle}
                />
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <Route
                        exact
                        path="/"
                        render={() => (
                            <TimeTable
                                data={data}
                                options={data.options}
                                car={car}
                                timeSlotDuration={timeSlotDuration}
                            />
                        )}
                    />
                    <Route
                        path="/profile"
                        render={() => <Profile data={data}/>}
                    />
                </main>
            </div>
        );
    }
}

AppView = withQuery(AppRootQuery)(withStyles(styles)(AppView));
