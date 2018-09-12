import React from 'react';
import { Button } from 'antd';
import './index.scss';

class ToolBar extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div class="sidebar">
        <div class="bar-container">
          <div class="sidebar-btn select">
            <div class="sidebar-btn-content"></div>
          </div>
        </div>
      </div>
    );
  }
}
export default ToolBar;
