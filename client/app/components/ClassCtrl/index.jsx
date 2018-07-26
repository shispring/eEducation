import React from 'react';
import { Tabs } from 'antd';
import PropTypes from 'prop-types';
import Chatroom, { messagesType } from '../Chatroom';
import UserList, { usersType } from '../UserList';
import './index.scss'

const TabPane = Tabs.TabPane;

class ClassCtrl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: "1"
    }
  }

  callback = (key) => {
    console.log(key);
    this.setState({ 
      activeKey: key 
    });
  }

  render() {
    return (
      <Tabs
        className="classroom-control"
        activeKey={this.state.activeKey} 
        onChange={this.callback}
        tabBarStyle={{margin: '0', width: '20rem'}}
        type="card"
      >
        <TabPane tab="Chatroom" key="1">
          <Chatroom 
            messages={this.props.messages} 
            style={{width: '20rem', height: '24rem'}}
          />
        </TabPane>
        <TabPane tab="Student List" key="2">
          <UserList 
            users={this.props.users} 
            style={{width: '20rem', height: '24rem'}} 
          />
        </TabPane>
      </Tabs>
    )
  }
}

ClassCtrl.propTypes = {
  messages: messagesType,
  users: usersType
};

export default ClassCtrl