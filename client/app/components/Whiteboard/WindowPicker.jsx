import React from 'react';
import {chunk} from 'lodash';
import PropTypes from 'prop-types';
import { Button, Card, Col, Row } from 'antd';
import { merge } from 'lodash';
import './WindowPicker.scss';

const {Meta} = Card

class WindowItem extends React.Component {
  componentDidMount() {
    // let img = document.querySelector(`#window-${this.props.windowId}`);
    // img.src = 'data:image/png;base64,'+this.props.image;
  }

  render() {
    const className = this.props.active ? 'screen-item active' : 'screen-item';
    let name = this.props.name || 'No Title';
    name = name.length > 15 ? `${name.substring(0, 15)}...` : name;
    return (
      <div className={className}>
        <div className="screen-image">
          <div className="content" style={{backgroundImage: `url(data:image/png;base64,${this.props.image})`}}>
          </div>
        </div>
        <div className="screen-meta">{name}</div>
      </div>
    );
  }
}

WindowItem.propTypes = {
  windowId: PropTypes.number,
  name: PropTypes.string,
  ownerName: PropTypes.string,
  active: PropTypes.bool,
  // bmpWidth: PropTypes.number,
  // bmpHeight: PropTypes.number,
  image: PropTypes.string
}

class WindowPicker extends React.Component {
  state = {
    currentWindowId: -1,
  }

  handleSelect = windowId => {
    this.setState({
      currentWindowId: windowId
    });
  }

  handleSubmit = () => {
    this.props.onSubmit && this.props.onSubmit(this.state.currentWindowId);
  }

  handleCancel = () => {
    this.props.onCancel && this.props.onCancel();
  }

  render() {
    let chunkList = chunk(this.props.windowList, 1);

    const content = chunkList.map((chunk, index) => {
      return (
        <Row key={index} style={{marginBottom:'10px'}}>
          {chunk.map(item => (
            <Col
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              key={item.windowId}
              onClick={() => this.handleSelect(item.windowId)}
              span={8}><WindowItem active={item.windowId === this.state.currentWindowId} {...item}/></Col>
          ))}
        </Row>
      )
    })

    return (
      <div className='window-picker' style={this.props.style || {}}>
        <div className='header'>
          <div className="title">请选择需要共享的内容</div>
          <div className="cancelBtn" onClick={this.props.onCancel}></div>
        </div>
        <div className='screen-container'>
          {content}
        </div>
        <div className='footer'>
          <div className="confirmBtn" onClick={() => this.props.onSubmit(this.state.currentWindowId)}>
            开始共享
          </div>
        </div>
      </div>
    )
  }
}

WindowPicker.propTypes = {
  windowList: PropTypes.arrayOf(
    PropTypes.objectOf({
      windowId: PropTypes.number,
      name: PropTypes.string,
      ownerName: PropTypes.string,
      image: PropTypes.string
    })
  ),
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
}

export default WindowPicker;