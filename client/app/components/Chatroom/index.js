import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Input, Divider } from 'antd';
import './index.scss'

function MessageItem(props) {
  const align = props.local ? 'right' : 'left';
  return (
    <div className={`message-item ${align}`}>
      <div className="arrow" style={{ float: align }} />
      <div className="message-content" style={{ textAlign: align, float: align }}>
        {props.content}
      </div>
      <div className="message-sender" style={{ textAlign: align }}>{props.username}</div>
    </div>
  );
};

class Chatroom extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef()
  }
  componentDidUpdate() {
    const box = document.querySelector('.message-box');
    box.scrollTop = box.scrollHeight - box.clientHeight;
  }

  handleSendMessage = () => {
    let dom = document.querySelector('.message-container #message')
    if (!dom) {
      throw new Error('.message-container #message Not Found')
      return
    }
    let msg = dom.value
    if (!msg) {
      console.warn('Message to send cannot be empty.')
      return;
    }
    dom.value = '';
    this.props.onSendMessage(msg)
  }

  render() {
    const MessageList = this.props.messages.map((item, index) => (
      <MessageItem 
        key={index}
        username={item.username}
        local={item.local}
        content={item.content}>
      </MessageItem>
    ))

    const className = this.props.className || '' + ' message-container'

    return (
      <div style={this.props.style} className={className}>
        <div className="message-box">
          {MessageList}
        </div>
        <div className="message-input">
          <Input id="message" placeholder="Input messages..." />
          <Button 
            onClick={this.handleSendMessage} 
            icon="notification" 
            id="sendBtn" 
            type="primary">Send
          </Button>
        </div>
      </div>
    )
  }
};

Chatroom.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.string,
      local: PropTypes.bool,
      username: PropTypes.string
    })
  ),
  onSendMessage: PropTypes.func
};

MessageItem.propTypes = {
  content: PropTypes.string,
  local: PropTypes.bool,
  username: PropTypes.string
}

export default Chatroom;