import React, { Component } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'mobx-react';

import Index from './Index';
import DeviceTesting from './DeviceTesting';
import NetworkTesting from './NetworkTesting';
import Classroom from './Classroom';
import ClientStore from '../store/client.store';
import BarrelClient from '../utils/Barrel'

class App extends Component {
  constructor() {
    super()
    this.client = new BarrelClient('aab8b8f5a8cd4469a63042fcfafe7063')
    this.state = {
      style: { visibility: 'hidden' }
    }
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
            <Route exact path="/" render={() => <Index barrel={this.client} />} />
            <Route path="/device_testing" render={() => <DeviceTesting barrel={this.client} />} />
            {/* <Route path="/network_testing" component=(<NetworkTesting barrel={this.client} />) /> */}
            <Route path="/classroom" render={() => <Classroom barrel={this.client} />} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
