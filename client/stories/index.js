import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Chatroom from '../app/components/Chatroom';
import UserList from '../app/components/UserList';
import ClassCtrl from '../app/components/ClassCtrl';

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

addDecorator(WrapperDecorator)

const defaultMessages = [
  {local: true, username: 'me', content: '123123'},
  {local: false, username: 'customer', content: '321321'},
  {local: true, username: 'me', content: '123123'},
  {local: false, username: 'customer', content: '321321'},
  {local: true, username: 'me', content: '123123'},
  {local: false, username: 'customer', content: '321321'},
]

const defaultUsers = [
  {  
    username: 'cczcyy',
    video: true,
    audio: true,
    uid: 1010
  }
]

storiesOf('Chatroom', module)
  .add('default', () => (
    <Chatroom 
      onSendMessage={action('sending message')} 
      messages={defaultMessages} 
      style={{width: '20rem', height: '24rem'}}
    />
  ));

storiesOf('UserList', module)
  .add('default', () => (
    <UserList 
      users={defaultUsers} 
      style={{width: '20rem', height: '24rem'}} 
    />
  ));

storiesOf('Composed Class Control', module)
  .add('default', () => (
    <ClassCtrl
      messages={defaultMessages} 
      users={defaultUsers} 
    />
  ));