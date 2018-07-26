import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'antd';
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
    if(this.props.onSendMessage) {
      this.props.onSendMessage(msg);
    }
  }

  scrollToBottom = () => {
    const box = this.messageBoxRef;
    box.scrollTop = box.scrollHeight - box.clientHeight;
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  render() {
    const MessageList = this.props.messages && this.props.messages.map((item, index) => (
      <MessageItem 
        key={index}
        username={item.username}
        local={item.local}
        content={item.content}>
      </MessageItem>
    ));

    const className = this.props.className || '' + ' message-container';

    return (
      <div style={this.props.style} className={className}>
        <div className="message-box" ref={el => this.messageBoxRef = el}>
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

MessageItem.propTypes = {
  content: PropTypes.string,
  local: PropTypes.bool,
  username: PropTypes.string
};

Chatroom.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape(MessageItem.propTypes)
  ),
  onSendMessage: PropTypes.func
};

export default Chatroom;

export const messagesType = Chatroom.propTypes.messages;
