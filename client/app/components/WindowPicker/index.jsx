import React from 'react';
import {chunk} from 'lodash';
import PropTypes from 'prop-types';
import { Button, Card, Col, Row } from 'antd';
// import './index.scss'

const {Meta} = Card

class WindowItem extends React.Component {
  encode = (input) => {
    let keyStr =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = "";
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    let i = 0;

    while (i < input.length) {
      chr1 = input[i++];
      chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
      chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output +=
        keyStr.charAt(enc1) +
        keyStr.charAt(enc2) +
        keyStr.charAt(enc3) +
        keyStr.charAt(enc4);
    }
    return output;
  }

  componentDidMount() {
    let img = document.querySelector(`#window-${this.props.windowId}`);
    img.src = 'data:image/png;base64,'+this.encode(this.props.bmpData);
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
  bmpData: PropTypes.array
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
    {
      windowId: PropTypes.number,
      name: PropTypes.string,
      ownerName: PropTypes.string,
      bmpData: PropTypes.object
    }
  ),
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
}

export default WindowPicker;