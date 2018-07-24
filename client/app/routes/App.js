import React, { Component } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

import Index from './Index';
import DeviceTesting from './DeviceTesting';
import NetworkTesting from './NetworkTesting';
import Classroom from './Classroom';
import BarrelClient from '../utils/Adapter'

class App extends Component {
  constructor() {
    super()
    this.client = new BarrelClient()
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
      <Router>
        <div className="full" style={this.state.style}>
          <Route exact path="/" render={() => <Index barrel={this.client} />} />
          <Route path="/device_testing" render={() => <DeviceTesting barrel={this.client} />} />
          {/* <Route path="/network_testing" component=(<NetworkTesting barrel={this.client} />) /> */}
          <Route path="/classroom" render={() => <Classroom barrel={this.client} />} />
        </div>
      </Router>
    );
  }
}

export default App;
