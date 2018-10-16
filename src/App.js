import React, { Component } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment from './Environment';
import './App.css';

class App extends Component {
  render() {
    return (
        <QueryRenderer
            environment={environment}
            query={graphql`
                query AppBrandsQuery {
                    brands
                }
            `}
            variables={{}}
            render={({error, props}) => {
                if (error) {
                    return <div>Error!</div>;
                }
                if (!props) {
                    return <div>Loading...</div>;
                }

                return <div>Known brands: {props.brands.join(', ')}</div>;
            }}
        />
    );
  }
}

export default App;
