/*!
 * ISC License
 *
 * Copyright (c) 2026, Imqueue Sandbox
 */
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { App } from './components/index.js';
import './style.scss';

const theme = createTheme();

// Legacy Material-UI v3 style rules across the app reference `theme.spacing.unit`
// (the fixed 8px base that was removed when spacing became a function in v4).
// Re-expose it so those rules keep producing the same pixel values.
theme.spacing.unit = 8;

createRoot(document.getElementById('app')).render(
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ThemeProvider>,
);
