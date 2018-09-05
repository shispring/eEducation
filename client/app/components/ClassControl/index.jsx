import React from 'react';
import { Tabs } from 'antd';
import PropTypes from 'prop-types';
import Chatroom, { messagesType } from '../Chatroom';
import UserList, { usersType } from '../UserList';
import './index.sass'

const TabPane = Tabs.TabPane;

class ClassCtrl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: "1"
    }
  }

  callback = (key) => {
    this.setState({ 
      activeKey: key 
    });
  }

  handleSendMessage = (msg) => {
    this.props.onSendMessage && this.props.onSendMessage(msg)
  }

  handleAction = (type, action, uid) => {
    this.props.onAction && this.props.onAction(type, action, uid)
  }

  render() {
    const className = (this.props.className || '') + ' classroom-control';

    return (
      <Tabs
        className={className}
        activeKey={this.state.activeKey} 
        onChange={this.callback}
        tabBarStyle={{margin: '0', width: '100%'}}
        type="card"
      >
        <TabPane tab="Chatroom" key="1">
          <Chatroom 
            onSendMessage={this.handleSendMessage}
            messages={this.props.messages} 
            style={{width: '100%', height: '100%'}}
          />
        </TabPane>
        <TabPane tab="Student List" key="2">
          <UserList 
            controllable={this.props.controllable}
            onAction={this.handleAction}
            users={this.props.users} 
            style={{width: '100%', height: '100%'}} 
          />
        </TabPane>
      </Tabs>
    )
  }
}

ClassCtrl.propTypes = {
  messages: messagesType,
  users: usersType,
  controllable: PropTypes.bool,
  onSendMessage: PropTypes.func,
  onAction: PropTypes.func
};

export default ClassCtrl;