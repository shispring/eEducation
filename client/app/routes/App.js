import React, { Component } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'mobx-react';

import Index from './Index';
import DeviceTesting from './DeviceTesting';
import NetworkTesting from './NetworkTesting';
import Classroom from './Classroom';
import ClientStore from '../store/client.store.js';

class App extends Component {
  state = {
    style: { visibility: 'hidden' }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        style: { visibility: 'visible' }
      });
    }, 300);
  }

  render() {
    return (
      <Provider ClientStore={ClientStore}>
        <Router>
          <div className="full" style={this.state.style}>
            <Route exact path="/" component={Index} />
            <Route path="/device_testing" component={DeviceTesting} />
            <Route path="/network_testing" component={NetworkTesting} />
            <Route path="/classroom" component={Classroom} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
