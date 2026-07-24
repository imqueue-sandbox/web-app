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
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useLazyLoadQuery } from 'react-relay';
import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import type { ListItemButtonProps } from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import MuiTypography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Person from '@mui/icons-material/Person';
import Timelapse from '@mui/icons-material/Timelapse';
import MuiWaves from '@mui/icons-material/Waves';
import ExitToApp from '@mui/icons-material/ExitToApp';

import {
    AppMessage,
    AuthUser,
    CarSelector,
    Profile,
    TimeTable,
    WashingTypeSelector,
} from '../components';
import {
    AppStore,
    AUTH_KEY,
    CAR_KEY,
    ErrorBoundary,
    SLOT_KEY,
} from '../common';
import type { StorageChangeHandler } from '../common';
import { APP_API_PROTOCOL } from '../config';
import { AppRootQuery } from '../relay/queries';
import { useLogout } from '../relay/mutations';
import type {
    AppRootQuery as AppRootQueryType,
    AppRootQuery$data,
} from '../relay/queries/__generated__/AppRootQuery.graphql';
import type {
    Options_options$key,
} from '../relay/queries/fragments/__generated__/Options_options.graphql';
import type {
    UserCars$data,
} from '../relay/queries/fragments/__generated__/UserCars.graphql';
import type { AuthInfo } from '../types';

const drawerWidth = 320;

/** A single car of the user's garage, as the `UserCars` fragment selects it. */
type GarageCar = NonNullable<NonNullable<UserCars$data['cars']>[number]>;

/**
 * Props of a drawer navigation entry - a `ListItemButton` rendered as a router
 * link, so it accepts `to` along with the button's own props. Routing stays on
 * the client this way, which is what the `<Routes>` below expects.
 */
type ListItemLinkProps = ListItemButtonProps<typeof Link>;

function ListItemLink(props: ListItemLinkProps) {
    return <ListItemButton component={Link} {...props}/>;
}

/** Highlight of the drawer entry matching the current route. */
const selectedItem = {
    backgroundColor: '#eee',
    boxShadow: '1px 1px 5px #999',
};

const Root = styled('div')({
    flexGrow: 1,
    zIndex: 1,
    position: 'relative',
    display: 'flex',
    flex: 1,
});

const AppBar = styled(MuiAppBar)(({ theme }) => ({
    width: '100%',
    // override MUI's built-in colorPrimary background (higher insertion
    // order) to keep the tutorial's charcoal app bar
    background: '#333 !important',
    zIndex: theme.zIndex.drawer + 1,
    '& *': {
        color: '#fff',
        textDecoration: 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
}));

const ToolbarContent = styled('div')({
    flexDirection: 'row',
    display: 'flex',
});

/** Spacer keeping the content below the fixed app bar. */
const ToolbarSpacer = styled('div')(({ theme }) => theme.mixins.toolbar);

const Waves = styled(MuiWaves)({
    marginRight: '5px',
});

const Title = styled(MuiTypography)({
    display: 'flex',
    flexGrow: 1,
    textDecoration: 'none',
    minHeight: '64px',
    justifyContent: 'center',
    alignItems: 'center',
});

const SupTitle = styled('sup')(({ theme }) => ({
    color: theme.palette.secondary.light + ' !important',
    marginLeft: '.5em',
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
}));

const User = styled('div')(({ theme }) => ({
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },
    flexDirection: 'row',
}));

const Content = styled('main')(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(2),
    backgroundColor: '#eee',
}));

const DrawerRoot = styled('div')({
    display: 'flex',
});

const DrawerNav = styled('nav')(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        width: drawerWidth,
        flexShrink: 0,
    },
}));

interface DrawerContentProps {
    data: AppRootQuery$data;
    route: string;
}

/**
 * Body of both drawers - the navigation entries plus, on the reservations
 * route, the pickers the time table reads its input from.
 */
function DrawerContent({ data, route }: DrawerContentProps) {
    const isTimeTable = route === '/';

    return (
        <div>
            <List>
                <ListItemLink
                    to="/"
                    sx={isTimeTable ? selectedItem : undefined}
                >
                    <ListItemIcon><Timelapse /></ListItemIcon>
                    <ListItemText primary="Washing Time Reservations" />
                </ListItemLink>
                <ListItemLink
                    to="/profile"
                    sx={route === '/profile' ? selectedItem : undefined}
                >
                    <ListItemIcon><Person /></ListItemIcon>
                    <ListItemText primary="User Profile" />
                </ListItemLink>
                <Divider/>
            </List>
            {isTimeTable &&
                <WashingTypeSelector options={data.options}/>
            }
            {isTimeTable && <Divider/>}
            {isTimeTable && <CarSelector data={data.user} />}
        </div>
    );
}

interface ResponsiveDrawerProps extends DrawerContentProps {
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
}

/**
 * Renders the navigation twice: as a temporary drawer toggled by the app bar
 * button on small screens, and as a permanent one from the `md` breakpoint up.
 */
function ResponsiveDrawer(props: ResponsiveDrawerProps) {
    const { mobileOpen, handleDrawerToggle, ...contentProps } = props;
    const theme = useTheme();

    return (
        <DrawerRoot>
            <DrawerNav>
                {/* Temporary drawer, shown on small screens only */}
                <Drawer
                    variant="temporary"
                    anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    // Better open performance on mobile.
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            paddingTop: '5px',
                        },
                    }}
                >
                    <DrawerContent {...contentProps}/>
                </Drawer>
                {/* Permanent drawer, shown from the md breakpoint up */}
                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            paddingTop: '60px',
                        },
                    }}
                >
                    <DrawerContent {...contentProps}/>
                </Drawer>
            </DrawerNav>
        </DrawerRoot>
    );
}

interface AppRootProps {
    route: string;
}

/**
 * The authenticated application itself.
 *
 * It is a component of its own because `useLazyLoadQuery()` suspends while the
 * root query is in flight, so whoever calls it has to sit *inside* the
 * `<Suspense>` boundary rendering the loading indicator - which is what
 * {@link AppView} below mounts.
 */
function AppRoot({ route }: AppRootProps) {
    const isTimeTable = route === '/';
    const data = useLazyLoadQuery<AppRootQueryType>(AppRootQuery, {
        withUser: true,
        withUserCars: true,
        withOptions: isTimeTable,
        withReservations: isTimeTable,
    });
    const [logout] = useLogout();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [timeSlotDuration, setTimeSlotDuration] = useState(
        () => (AppStore.get<number>(SLOT_KEY) ?? 0) | 0,
    );
    const [car, setCar] = useState<GarageCar | null>(
        () => AppStore.get<GarageCar>(CAR_KEY),
    );

    useEffect(() => {
        const storeChange: StorageChangeHandler = (key, item) => {
            if (!item) {
                return ;
            }

            if (key === SLOT_KEY) {
                setTimeSlotDuration(Number(item) | 0);
            }

            else if (key === CAR_KEY) {
                // the store keeps whatever JSON was put into it, so the shape
                // of a stored value is only known to the code reading it back
                setCar(item as GarageCar);
            }
        };

        AppStore.on('change', storeChange);

        return () => AppStore.off('change', storeChange);
    }, []);

    const handleDrawerToggle = useCallback(() => {
        setMobileOpen(open => !open);
    }, []);

    const handleLogout = useCallback(() => {
        const token = AppStore.get<AuthInfo>(AUTH_KEY)?.token;

        token && logout(token);
        // dropped locally right away, without waiting for the gateway: the
        // stored session is what keeps this view mounted at all
        AppStore.del(AUTH_KEY);
        AppStore.del(CAR_KEY);
    }, [logout]);

    return (
        <Root>
            <AppBar position="fixed">
                <Toolbar>
                    <ToolbarContent>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            onClick={handleDrawerToggle}
                            sx={{ display: { md: 'none' } }}
                        >
                            <Waves/>
                        </IconButton>
                        <Title variant="h6" color="inherit" noWrap>
                            Car Wash Tutorial App
                            <SupTitle>for @imqueue</SupTitle>
                        </Title>
                        {/* tells this front-end apart from its REST twin,
                            which serves the very same views off :3001 */}
                        <Chip
                            size="small"
                            variant="outlined"
                            label={APP_API_PROTOCOL}
                            sx={{
                                color: 'inherit',
                                borderColor: 'currentColor',
                                ml: 1.5,
                            }}
                        />
                    </ToolbarContent>
                    <ToolbarContent>
                        <User>
                            <AuthUser data={data.user}/>
                        </User>
                        <IconButton onClick={handleLogout}>
                            <ExitToApp/>
                        </IconButton>
                    </ToolbarContent>
                </Toolbar>
            </AppBar>
            <ResponsiveDrawer
                data={data}
                route={route}
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
            />
            <Content>
                <ToolbarSpacer />
                <Routes>
                    <Route
                        path="/"
                        element={(
                            <TimeTable
                                data={data}
                                // the root query selects `options` for this
                                // route only, where the gateway always returns
                                // it, while the generated type has to declare
                                // every field of a conditional selection
                                // nullable
                                options={data.options as Options_options$key}
                                car={car}
                                timeSlotDuration={timeSlotDuration}
                            />
                        )}
                    />
                    <Route
                        path="/profile"
                        element={<Profile data={data}/>}
                    />
                </Routes>
            </Content>
        </Root>
    );
}

export interface AppViewProps {
    /**
     * Path of the route being displayed. Defaults to the router location, so
     * the shell can also be mounted without threading it through.
     */
    route?: string;
}

/**
 * Application layout of a signed-in user.
 *
 * This is the shell around the data-loading {@link AppRoot}: Relay reports a
 * root query which is still in flight by suspending and a failed one by
 * throwing during render, so the two unhappy paths of the page are an
 * `<ErrorBoundary>` and a `<Suspense>` fallback here rather than callbacks the
 * caller passes in. The boundary resets on a route change, since a route which
 * failed to load is not the route the user asks for next.
 */
export function AppView({ route }: AppViewProps) {
    const location = useLocation();
    const path = route ?? location.pathname;

    return (
        <ErrorBoundary
            resetKey={path}
            fallback={err =>
                <AppMessage variant="error" message={err.message}/>
            }
        >
            <Suspense fallback={<LinearProgress color="secondary"/>}>
                <AppRoot route={path}/>
            </Suspense>
        </ErrorBoundary>
    );
}
