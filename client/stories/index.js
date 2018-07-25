import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ClassroomCtrl from '../app/components/ClassroomCtrl';

const styles = {
  position: 'fixed',
  top: '0px',
  left: '0px',
  right: '0px',
  bottom: '0px',
  padding: '24px 48px',
  boxSizing: 'border-box',
  background: '#F5F5F5'
}

const WrapperDecorator = storyFn => (
  <div style={styles}>
    { storyFn() }
  </div>
)

addDecorator(WrapperDecorator)

storiesOf('Classroom Control', module)
  .add('normal', () => (
    <ClassroomCtrl style={{width: '20rem'}}></ClassroomCtrl>
  ))