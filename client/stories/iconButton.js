import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import IconButton from '../app/components/IconButton';
import SimpleIconButton from '../app/components/SimpleIconButton';

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

storiesOf('Icon Buttons', module)
  .add('pencil', () => (
    <IconButton 
      type="pencil"
    />
  ))
  .add('active pencil', () => (
    <IconButton type="pencil" active={true}/>
  ))
  .add('hand-up', () => (
    <SimpleIconButton 
      type="hand-up"
    />
  ))
  .add('active hand-up', () => (
    <SimpleIconButton type="hand-up" active={true}/>
  ));