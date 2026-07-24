# Tutorial Web Application for @imqueue

The front-end of the [@imqueue](https://github.com/imqueue) Car-Wash tutorial — a React 19 +
TypeScript app built with **Relay hooks** on top of the GraphQL gateway
[`api`](https://github.com/imqueue-sandbox/api).

Customers register and log in, manage a garage of cars, and book washing slots on an
interactive calendar. A sibling front-end,
[`web-app-rest`](https://github.com/imqueue-sandbox/web-app-rest), offers the same features over
the REST/OpenAPI gateway `api-rest`. The two are deliberately *not* one codebase with a swapped
transport: each is written natively for its own API style, which is what the pair demonstrates —
a single `@imqueue` service fleet can be fronted by whatever gateway protocol a client wants, and
the client is free to be idiomatic about it. To keep them apart while both run, the app bar and
the login dialog carry a protocol badge (`GraphQL` here, `REST` there).

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

- **TypeScript 5** in `strict` mode — every module is `.ts`/`.tsx`, no `any` and no
  `@ts-ignore` in application code.
- **React 19**: function components and hooks throughout. The single class in the codebase is
  `common/ErrorBoundary.tsx`, because error boundaries have no hook equivalent.
- **react-router-dom 7** (`useLocation`, `useNavigate`, `<Link>`), bundled with **Vite 8**.
- **Relay** (`react-relay` / `relay-runtime`, artifacts by `relay-compiler` through
  `vite-plugin-relay` + `babel-plugin-relay`) for GraphQL data fetching, fragments and mutations.
- **MUI 9** (+ Emotion) styled with `styled()` and the `sx` prop, **react-big-calendar** +
  **moment** for the reservation calendar, **blueimp-md5** for Gravatar avatars.

## Data layer

- `src/main.tsx` mounts a `RelayEnvironmentProvider`; the environment (`src/relay/`) POSTs
  GraphQL operations to the `api` gateway and adds the auth token as the `X-Auth-User` header.
- **The route owns the data.** `layouts/AppView.tsx` calls `useLazyLoadQuery` for `AppRootQuery`
  once and passes fragment references down; children read their own slice with `useFragment`, and
  `TimeTable` re-reads the schedule through `useRefetchableFragment` (the `Reservations` fragment
  is `@refetchable`, so relay-compiler generates the refetch query). The only other queries are
  the car-catalog lookups in `Form/CarBrandsSelect` and `Form/CarModelSelect`, which fetch on
  their own because they are driven by what the user picks, not by the route.
- Loading and error states are **`<Suspense>` + `<ErrorBoundary>`**, not callbacks or flags.
- Queries and fragments live in `src/relay/queries/`; each mutation in `src/relay/mutations/`
  (`login`, `logout`, `register`, `updateUser`, `addCar`, `removeCar`, `reserve`,
  `cancelReservation`) exports a `useXxx()` hook over `useMutation`, returning the commit
  function plus an in-flight flag for disabling submit controls.
- **The generated artifacts are the domain model.** `src/types.ts` declares no entity shapes at
  all — components are typed by the `$data` / `$key` types under `src/relay/**/__generated__/`,
  so a change to a query or fragment surfaces as a compile error rather than a runtime surprise.
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

Other scripts:

| Script | What it does |
|---|---|
| `npm run build` | Relay artifacts → `tsc --noEmit` → production build into `build/` |
| `npm run typecheck` | Relay artifacts → `tsc --noEmit`, no bundle |
| `npm run relay` | Regenerate Relay artifacts only |
| `npm run preview` | Serve the production build |

Note that `relay-compiler` runs before every typecheck and build: the generated types are what
the components are checked against, so they must never be stale.

## License

[ISC License](LICENSE)
