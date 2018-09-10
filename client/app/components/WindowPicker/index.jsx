import React from 'react';
import {chunk} from 'lodash';
import PropTypes from 'prop-types';
import { Button, Card, Col, Row } from 'antd';
// import './index.scss'

const {Meta} = Card

class WindowItem extends React.Component {
  componentDidMount() {
    let img = document.querySelector(`#window-${this.props.windowId}`);
    img.src = 'data:image/png;base64,'+this.props.image;
  }

  render() {
    let style = {width: 240}
    if(this.props.active) {
      style.borderColor = 'blue';
    }
    return (
      <Card
        hoverable
        style={style}
        cover={<img style={{height: '150px'}} id={`window-${this.props.windowId}`}/>}
      >
        <Meta
          // title={this.props.ownerName}
          description={this.props.name}
        />
      </Card>
    )
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
    let chunkList = chunk(this.props.windowList, 3);

    const content = chunkList.map((chunk, index) => {
      return (
        <Row key={index} style={{marginBottom:'10px'}}>
          {chunk.map(item => (
            <Col
              key={item.windowId}
              onClick={() => this.handleSelect(item.windowId)}
              span={8}><WindowItem active={item.windowId === this.state.currentWindowId} {...item}/></Col>
          ))}
        </Row>
      )
    })

    return (
      <div style={
        {
          width: '100%', height: '100%', position: 'fixed', zIndex: '9999', 
          backgroundColor: 'rgba(222, 222, 222, .3)', display: 'flex',
          justifyContent: 'center', alignItems: 'center'
        }
      }>
        <Card 
          title="Pick a window for sharing" 
          bordered={false} 
          style={{width: '800px'}}
          bodyStyle={{ height: '300px', overflowY: 'auto'}}
          extra={[
            <Button key="cancel" onClick={this.handleCancel} style={{marginRight: '10px'}}>Cancel</Button>, 
            <Button key="submit" disabled={this.state.currentWindowId === -1} onClick={this.handleSubmit} type="primary">Confirm</Button>
          ]}>
          {content}
        </Card>
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