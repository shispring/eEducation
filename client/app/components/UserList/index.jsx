import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'antd';
import './index.scss'

function UserItem(props) {
  return (
    <div className="user-item">
      <div className="user-info">
        {props.username}
      </div>
      <div className="user-control">
        <Button 
          type={props.video?'primary':'default'} 
          shape="circle" 
          icon="video-camera" 
        />
        <Button 
          type={props.audio?'primary':'default'} 
          shape="circle" 
          icon="sound" 
        />
      </div>
    </div>
  );
}

class UserList extends React.Component {
  render() {
    const MessageList = this.props.users && this.props.users.map((item, index) => (
      <UserItem 
        key={index}
        uid={item.uid}
        username={item.username}
        video={item.video}
        audio={item.audio}
      />
    ))

    const className = this.props.className || '' + ' user-list-container';

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
  video: PropTypes.bool,
  audio: PropTypes.bool,
};

UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape(UserItem.propTypes)
  ),
};

export default UserList;

export const usersType = UserList.propTypes.users;
