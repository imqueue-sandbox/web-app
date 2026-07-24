/*!
 * ISC License
 *
 * Copyright (c) 2026, Imqueue Sandbox
 */
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { RelayEnvironmentProvider } from 'react-relay';
import { App } from './components';
import environment from './relay/Environment';
import './style.scss';

const theme = createTheme();

createRoot(document.getElementById('app')!).render(
    <RelayEnvironmentProvider environment={environment}>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ThemeProvider>
    </RelayEnvironmentProvider>,
);
