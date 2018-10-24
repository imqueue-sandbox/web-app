import React, { Component } from 'react';
import Car from './Car';

import {createFragmentContainer, graphql} from 'react-relay';

/**
 * Cars
 */
class Cars extends Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    //console.log('Cars::', this.props)

    return (
      <div><Car/></div>
    );
  }
}

Cars = createFragmentContainer(Cars,
  graphql`
    fragment Cars on Car {
      id
      make
      model
      type
    }
`
);

export default Cars;
