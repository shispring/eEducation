import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Row } from 'antd';
// import './index.scss'

class WindowItem extends React.Component {
  componentDidMount() {
    let canvas = document.querySelector(`#window-${this.props.windowId}`);
    let ctx = canvas.getContext('2d');
    ctx.drawImageData(this.props.bmpData)
  }

  render() {
    return (
      <Card
        hoverable
        style={{ width: 240 }}
        cover={<canvas id={`window-${this.props.windowId}`}/>}
      >
        <Meta
          title={props.name}
          description={props.ownerName}
        />
      </Card>
    )
  }
}

WindowItem.propTypes = {
  windowId: PropTypes.number,
  name: PropTypes.string,
  ownerName: PropTypes.string,
  bmpWidth: PropTypes.number,
  bmpHeight: PropTypes.number,
  bmpData: PropTypes.array
}

class WindowPicker extends React.Component {
  render() {

    const content = this.props.windowList.map(item => {
      return (<WindowItem {...item}/>)
    })

    return (
      <Card title="Pick a window for sharing" bordered={false} style={{width: '600px'}}>
        <Row>
          {content}
        </Row>
      </Card>
    )
  }
}