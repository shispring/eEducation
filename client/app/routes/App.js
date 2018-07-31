import React, { Component } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

import Index from './Index';
import DeviceTesting from './DeviceTesting';
import NetworkTesting from './NetworkTesting';
import Classroom from './Classroom';
import AdapterClient from '../utils/Adapter'

class App extends Component {
  constructor() {
    super()
    this.client = new AdapterClient()
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
          <Route exact path="/" render={() => <Index adapter={this.client} />} />
          <Route path="/device_testing" render={() => <DeviceTesting adapter={this.client} />} />
          {/* <Route path="/network_testing" component=(<NetworkTesting adapter={this.client} />) /> */}
          <Route path="/classroom" render={() => <Classroom adapter={this.client} />} />
        </div>
      </Router>
    );
  }
}

export default App;
