import { Network } from 'relay-runtime';

const network = Network.create((
    operation,
    variables,
) => fetch('http://localhost:8888/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: operation.text,
            variables,
        }),
    }).then(response => {
        return response.json();
    })
);

export default network;
