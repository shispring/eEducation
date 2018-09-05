import { configure } from '@storybook/react';
import 'antd/dist/antd.css';

function loadStories() {
  require('../stories/index.js');
  require('../stories/windowPicker.js')
  require('../stories/iconButton.js')
  require('../stories/multiPanel.js')
  // You can require as many stories as you need.
}

configure(loadStories, module);