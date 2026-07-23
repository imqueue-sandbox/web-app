# Tutorial Web Application for @imqueue

The front-end of the [@imqueue](https://github.com/imqueue) Car-Wash tutorial — a React 19 app
built with **Relay** on top of the GraphQL gateway
[`api`](https://github.com/imqueue-sandbox/api).

Customers register and log in, manage a garage of cars, and book washing slots on an
interactive calendar. Its REST-backed twin,
[`web-app-rest`](https://github.com/imqueue-sandbox/web-app-rest), is visually and functionally
identical but talks to the REST gateway `api-rest` instead — the two front-ends demonstrate that
the same fleet can be consumed through completely different API styles.

## About the tutorial

This repo is one piece of the **imqueue-sandbox** tutorial — a complete car-wash booking app
built from independent RPC microservices that communicate over a Redis-backed message queue.

| Repo | Role | Store |
|------|------|-------|
| [user](https://github.com/imqueue-sandbox/user) | Customer accounts & their garage | MongoDB |
| [auth](https://github.com/imqueue-sandbox/auth) | Login, JWT issuing & revocation | Redis |
| [car](https://github.com/imqueue-sandbox/car) | Car catalog (makes / models / types) | in-memory |
| [time-table](https://github.com/imqueue-sandbox/time-table) | Washing reservations & schedule | PostgreSQL |
| [api](https://github.com/imqueue-sandbox/api) | GraphQL gateway orchestrating the fleet | — |
| [api-rest](https://github.com/imqueue-sandbox/api-rest) | REST/OpenAPI gateway over the same fleet | — |
| **[web-app](https://github.com/imqueue-sandbox/web-app)** | React front-end on `api` (GraphQL/Relay) | — |
| [web-app-rest](https://github.com/imqueue-sandbox/web-app-rest) | React front-end on `api-rest` (REST) | — |

## Tech stack

- **React 19** + **react-router-dom 7**, bundled with **Vite 8**.
- **Relay** (`react-relay` / `relay-runtime` / `relay-compiler` via `vite-plugin-relay`) for
  GraphQL data fetching, fragments and mutations.
- **MUI 9** (+ Emotion) for the UI, **react-big-calendar** + **moment** for the reservation
  calendar, **blueimp-md5** for Gravatar avatars.

## Data layer

- The Relay environment (`src/relay/`) POSTs GraphQL operations to the `api` gateway and adds the
  auth token as the `X-Auth-User` header.
- Queries and fragments live in `src/relay/queries/`; mutations (`login`, `logout`, `register`,
  `updateUser`, `addCar`, `removeCar`, `reserve`, `cancelReservation`) in `src/relay/mutations/`.
- The `{ token, user }` session is kept in `localStorage` via `AppStore` under the `AuthUser`
  key; the Relay store provides automatic UI reactivity after mutations.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_WEB_API_URL` | `http://localhost:8888/` | URL of the `api` GraphQL gateway. |

## Running

~~~bash
npm start
~~~

This compiles the Relay artifacts (`relay-compiler`) and starts the Vite dev server on port
**3000**. Point it at a running `api` gateway (and, behind it, the backend fleet).

Other scripts: `npm run build` (production build to `build/`), `npm run relay` (regenerate Relay
artifacts only), `npm run preview` (serve the production build).

## License

[ISC License](LICENSE)
