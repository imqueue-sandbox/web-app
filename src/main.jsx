/*!
 * ISC License
 *
 * Copyright (c) 2026, Imqueue Sandbox
 */
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './components/index.js';
import './style.scss';

createRoot(document.getElementById('app')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
);
