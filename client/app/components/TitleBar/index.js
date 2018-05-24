import React from 'react';
import { Button } from 'antd';

const ipcRenderer = require('electron').ipcRenderer;

class TitleBar extends React.Component {
  constructor() {
    super();
    this.state = {
      isFullScreen: false
    };
  }

  render() {
    // max/shrink button
    let maxBtn;
    if (this.state.isFullScreen) {
      maxBtn = (
        <Button className="btn" ghost icon="shrink" onClick={this.handleMax} />
      );
    } else {
      maxBtn = (
        <Button className="btn" ghost icon="arrows-alt" onClick={this.handleMax} />
      );
    }

    return (
      <div className="btn-group">
        {this.props.children}
        <Button className="btn" ghost icon="minus" onClick={this.handleMin} />
        {maxBtn}
        <Button className="btn" ghost icon="close" onClick={this.handleClose} />
      </div>
    );
  }

  handleMin = () => {
    ipcRenderer.send('hide-window');
  }

  handleMax = () => {
    if (this.state.isFullScreen) {
      ipcRenderer.send('restore-window');
      this.setState({
        isFullScreen: !this.state.isFullScreen
      });
    } else {
      ipcRenderer.send('max-window');
      this.setState({
        isFullScreen: !this.state.isFullScreen
      });
    }
  }

  handleClose = () => {
    ipcRenderer.send('close-window');
  }
}
export default TitleBar;
