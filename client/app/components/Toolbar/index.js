import React, { PropTypes } from 'react';
import { Popover, InputNumber } from 'antd';
import { merge } from 'lodash';
import { SketchPicker } from 'react-color';
import Whiteboard from '../../utils/Whiteboard';
import './index.scss';

class ToolBarBtn extends React.Component {
  getCategory() {
    let category = this.props.name;
    if (this.props.type === 'share') {
      category = 'share';
    } else if (this.props.type === 'color') {
      category = 'color';
    } else if (this.props.type === 'font') {
      category = 'font';
    } else if (this.props.type === 'add') {
      category = 'add';
    }
    return category;
  }
  onClick = () => {
    const category = this.getCategory();
    const { room } = Whiteboard;
    if (this.props.type === 'tool') {
      //update member state applicance name if type of tool
      room.setMemberState({
        currentApplianceName: category
      });
    }
    this.props.onToolSelected(category, this.props.type);
  };
  render() {
    const category = this.getCategory();
    const className = `sidebar-btn ${category} ${this.props.selected ? 'selected' : ''}`;
    return (
      <div className={className} onClick={this.onClick}>
        <div className="sidebar-btn-content" />
      </div>
    )
  }
}


class ToolBar extends React.Component {
  constructor() {
    super();
    this.state = {
      selected: 'pencil',
      colorPickerVisible: false,
      fontPickerVisible: false
    };
  }

  onToolSelected = (category, type) => {
    let state = {
      colorPickerVisible: false,
      fontPickerVisible: false
    };
    if (type === 'tool') {
      state = merge(state, {
        selected: category
      });
    } else if (type === 'share') {
      this.props.handleShareScreen();
    } else if (type === 'color') {
      state = merge(state, {
        colorPickerVisible: true
      });
    } else if (type === 'font') {
      state = merge(state, {
        fontPickerVisible: true
      });
    } else if (type === 'add') {
      this.props.handleAddingPage();
    }
    this.setState(state);
  }

  onColorChanged = (color) => {
    const { rgb } = color;
    const { r, g, b } = rgb;
    const { room } = Whiteboard;
    room.setMemberState({
      strokeColor: [r, g, b]
    });
  }

  onTextSizeChange = value => {
    const { room } = Whiteboard;
    room.setMemberState({
      textSize: value
    });
  }

  toolEnabled = () => {
    return this.state.colorPickerVisible || this.state.fontPickerVisible;
  }

  onHideTool = () => {
    this.setState({
      colorPickerVisible: false,
      fontPickerVisible: false
    });
  }

  render() {
    const tools = ['selector', 'pencil', 'rectangle', 'ellipse', 'eraser', 'text'];
    const colorClass = this.state.colorPickerVisible ? 'color-picker' : 'color-picker hidden';
    const maskClass = this.toolEnabled() ? 'mask' : 'mask hidden';
    return (
      <div className="sidebar">
        <div className={maskClass} onClick={this.onHideTool} />
        <div className="bar-container">
          {tools.map(tool => (
            <ToolBarBtn type="tool" name={tool} selected={this.state.selected === tool} onToolSelected={this.onToolSelected} />
            ))}
          <Popover
            placement="right"
            content={<InputNumber min={12} max={64} defaultValue={15} onChange={this.onTextSizeChange} />}
            title="字体大小"
            visible={this.state.fontPickerVisible}
          >
            <ToolBarBtn type="font" onToolSelected={this.onToolSelected} />
          </Popover>
          <ToolBarBtn type="color" onToolSelected={this.onToolSelected} />
          <ToolBarBtn type="add" onToolSelected={this.onToolSelected} />
          <ToolBarBtn type="share" selected={this.props.shareBtnState !== 'default'} onToolSelected={this.onToolSelected} state={this.props.shareBtnState} />
        </div>
        <div className={colorClass}>
          <SketchPicker onChangeComplete={this.onColorChanged} />
        </div>
      </div>
    );
  }
}
export default ToolBar;
