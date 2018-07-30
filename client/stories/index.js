import React from 'react';
import { storiesOf, addDecorator } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Chatroom from '../app/components/Chatroom';
import UserList from '../app/components/UserList';
import ClassControl from '../app/components/ClassControl';

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
    uid: 1010
  }
]

storiesOf('Chatroom', module)
  .add('default', () => (
    <Chatroom 
      onSendMessage={action('message from chatroom')} 
      messages={defaultMessages} 
      style={{width: '20rem', height: '24rem'}}
    />
  ));

storiesOf('UserList', module)
  .add('default', () => (
    <UserList 
      onAction={action('action from user list')}
      users={defaultUsers} 
      style={{width: '20rem', height: '24rem'}} 
    />
  ));

storiesOf('Composed Class Control', module)
  .add('default', () => (
    <ClassControl
      controllable={true}
      onSendMessage={action('message from class ctrl')} 
      onAction={action('action from class ctrl')}
      messages={defaultMessages} 
      users={defaultUsers} 
    />
  ));