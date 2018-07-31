import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'antd';
import './index.scss'

class UserItem extends React.Component {
  state = {
    video: true,
    audio: true,
    chat: true
  }

  handleAction = (type) => {
    this.props.onAction && this.props.onAction(
      type,
      this.state[type] ? 'disable' : 'enable',
      this.props.uid
    );
    this.setState({
      [type]: !this.state[type]
    })
  }

  render() {
    return (
      <div className="user-item">
        <div className="user-info">
          {this.props.username}
        </div>
        {
          this.props.controllable ? (      
          <div className="user-control">
            <Button 
              onClick={_ => this.handleAction('chat')}
              type={this.state.chat?'primary':'default'} 
              shape="circle" 
              icon="message" 
            />
            <Button 
              onClick={_ => this.handleAction('video')}
              type={this.state.video?'primary':'default'} 
              shape="circle" 
              icon="video-camera" 
            />
            <Button 
              onClick={_ => this.handleAction('audio')}
              type={this.state.audio?'primary':'default'} 
              shape="circle" 
              icon="sound" 
            />
          </div>
        ) : ""
      }
      </div>
    )
  }
}

class UserList extends React.Component {
  handleAction = (type, action, uid) => {
    this.props.onAction && this.props.onAction(type, action, uid)
  }

  render() {
    const MessageList = this.props.users && this.props.users.map((item, index) => (
      <UserItem 
        key={index}
        uid={item.uid}
        username={item.username}
        controllable={this.props.controllable}
        onAction={this.handleAction}
      />
    ))

    const className = (this.props.className || '') + ' user-list-container';

    return (
      <div style={this.props.style} className={className}>
        {MessageList}
      </div>
    )
  }
};

UserItem.propTypes = {
  username: PropTypes.string,
  uid: PropTypes.number,
  onAction: PropTypes.func,
  controllable: PropTypes.bool
};

UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string,
      uid: PropTypes.number,
    })
  ),
  onAction: PropTypes.func,
  controllable: PropTypes.bool
};

export default UserList;

export const usersType = PropTypes.arrayOf(
  PropTypes.shape({
    username: PropTypes.string,
    uid: PropTypes.number,
  })
);
