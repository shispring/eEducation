import React from 'react';
import { Button, Card, Input, Tabs, Divider } from 'antd';
import './index.scss'

const TabPane = Tabs.TabPane;
/**
 * Component Chatting related 
 */

function MessageItem(props) {
  const align = props.local ? 'right' : 'left';
  return (
    <div className={`message-item ${align}`}>
      <div className="arrow" style={{ float: align }} />
      <div className="message-content" style={{ textAlign: align, float: align }}>
        {props.message}
      </div>
      <div className="message-sender" style={{ textAlign: align }}>{props.username}</div>
    </div>
  );
}

class Chatting extends React.Component {
  render() {
    return (
      <div className="message-container">
        <div className="message-box">
          
        </div>
        <div className="message-input">
          <Input placeholder="Input messages..."></Input>
          <Button id="sendBtn">Send</Button>
        </div>
      </div>
    )
  }
}

/**
 * Component ClassroomCtrl 
 */

const tabListNoTitle = [{
  key: 'chatting',
  tab: 'Chatting',
}, {
  key: 'studentList',
  tab: 'Student List',
}];

const contentListNoTitle = {
  chatting: (<Chatting />),
  studentList: <p>app content</p>,
};

export default class ClassroomCtrl extends React.Component {
  state = {
    noTitleKey: 'chatting',
  }

  onTabChange = (key, type) => {
    console.log(key, type);
    this.setState({ [type]: key });
  }

  render() {
    return (
      <Card
        {...this.props}
        tabList={tabListNoTitle}
        activeTabKey={this.state.noTitleKey}
        onTabChange={(key) => { this.onTabChange(key, 'noTitleKey'); }}
      >
        {contentListNoTitle[this.state.noTitleKey]}
      </Card>
    )
  }
}