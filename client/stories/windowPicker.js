import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import WindowPicker from '../app/components/WindowPicker';

const styles = {
  position: 'fixed',
  top: '0px',
  left: '0px',
  right: '0px',
  bottom: '0px',
  padding: '12px 24px',
  boxSizing: 'border-box',
  background: '#F5F5F5'
}

const WrapperDecorator = storyFn => (
  <div style={styles}>
    { storyFn() }
  </div>
)

addDecorator(WrapperDecorator);


const windowList = [
  {ownerName:'hy', name: '1test', windowId: 1, image: []},
  {ownerName:'hy', name: '2test', windowId: 2, image: []},
  {ownerName:'hy', name: '3test', windowId: 3, image: []},
  {ownerName:'hy', name: '4test', windowId: 4, image: []},
]

storiesOf('WindowPicker', module)
  .add('default', () => (
    <WindowPicker 
      windowList={windowList}
    />
  ));