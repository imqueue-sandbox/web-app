import { Environment } from 'relay-runtime';
import network from './Network';
import store from './Store';

const environment = new Environment({
    network,
    store,
});

export default environment;
