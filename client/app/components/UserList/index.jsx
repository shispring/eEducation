import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'antd';
import './index.scss'

class UserItem extends React.Component {
  handleAction = (type) => {
    this.props.onAction && this.props.onAction(
      type,
      this.props[type] ? 'disable' : 'enable',
      this.props.uid
    );
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
              type={this.props.chat?'primary':'default'} 
              shape="circle" 
              icon="message" 
            />
            <Button 
              onClick={_ => this.handleAction('video')}
              type={this.props.video?'primary':'default'} 
              shape="circle" 
              icon="video-camera" 
            />
            <Button 
              onClick={_ => this.handleAction('audio')}
              type={this.props.audio?'primary':'default'} 
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
  state = {
    allVideo: true,
    allAudio: true
  }

  handleAction = (type, action, uid) => {
    this.props.onAction && this.props.onAction(type, action, uid)
  }

  toggleAllVideo = () => {
    let action = this.state.allVideo ? 'disableAll' : 'enableAll';
    let type = 'video';
    this.handleAction(type, action);
    this.setState({
      allVideo: !this.state.allVideo
    });
  }

  toggleAllAudio = () => {
    let action = this.state.allAudio ? 'disableAll' : 'enableAll';
    let type = 'audio';
    this.handleAction(type, action);
    this.setState({
      allAudio: !this.state.allAudio
    });
  }

  render() {
    const MessageList = this.props.users && this.props.users.map((item, index) => (
      <UserItem 
        key={index}
        uid={item.uid}
        username={item.username}
        video={item.video}
        audio={item.audio}
        chat={item.chat}
        ring={item.ring}
        controllable={this.props.controllable}
        onAction={this.handleAction}
      />
    ))

    const className = (this.props.className || '') + ' user-list-container';

    return (
      <div style={this.props.style} className={className}>
        <div className="user-list-box">{MessageList}</div>
        <div className="user-list-button-group">
          <Button 
            onClick={this.toggleAllVideo}
            type={this.state.allVideo?"primary":"default"}
            icon="video-camera" 
          >{this.state.allVideo?"Mute ":"Unmute"}</Button>
          <Button 
            onClick={this.toggleAllAudio}
            type={this.state.allAudio?"primary":"default"}
            icon="sound" 
          >{this.state.allAudio?"Mute ":"Unmute"}</Button>
        </div>
      </div>
    )
  }
};

UserItem.propTypes = {
  username: PropTypes.string,
  uid: PropTypes.number,
  onAction: PropTypes.func,
  controllable: PropTypes.bool,
  video: PropTypes.bool,
  audio: PropTypes.bool,
  chat: PropTypes.bool,
  ring: PropTypes.bool,
};

UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string,
      uid: PropTypes.number,
      video: PropTypes.bool,
      audio: PropTypes.bool,
      chat: PropTypes.bool,
      ring: PropTypes.bool,
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
    video: PropTypes.bool,
    audio: PropTypes.bool,
    chat: PropTypes.bool,
    ring: PropTypes.bool,
  })
);
