import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Chatroom from '../app/components/Chatroom';

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

const defaultMessages = [
  {local: false, username: 'me', content: '123123'},
  {local: true, username: 'customer', content: '321321'},
  {local: false, username: 'me', content: '123123'},
  {local: true, username: 'customer', content: '321321'},
  {local: false, username: 'me', content: '123123'},
  {local: true, username: 'customer', content: '321321'},
]

storiesOf('Chatroom', module)
  .add('normal', () => (
    <Chatroom onSendMessage={action('sending message')} messages={defaultMessages} style={{width: '20rem'}}></Chatroom>
  ))