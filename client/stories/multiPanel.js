import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import MultiPanel from '../app/components/MultiPanel';

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

storiesOf('MultiPanel', module)
  .add('MultiPanel', () => (
    <MultiPanel />
  ))