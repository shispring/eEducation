import React, { PropTypes } from 'react';
import { Popover, InputNumber } from 'antd';
import { merge } from 'lodash';
import { SketchPicker } from 'react-color';
import './Toolbar.scss';

class ToolBarBtn extends React.Component {

  onClick = () => {
    if (this.props.type === 'tool') {
      this.props.setMemberState({
        currentApplianceName: this.props.name
      });
    }
    this.props.onToolSelected(this.props);
  }

  render() {
    return (
      <div style={this.props.style} className={this.props.className} onClick={this.onClick}>
        <div className="sidebar-btn-content" />
      </div>
    )
  }
}


class ToolBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 'pencil',
      colorPickerVisible: false,
      fontPickerVisible: false,
    };
    this.setMemberState = props.setMemberState;
  }

  onToolSelected = ({name, type}) => {
    let state = {
      colorPickerVisible: false,
      fontPickerVisible: false
    };
    switch (type) {
      case 'tool':
        state = merge(state, {
          selected: name
        })
        break;
      case 'share':
        this.props.handleShareScreen();
        break;
      case 'color':
        state = merge(state, {
          colorPickerVisible: true
        })
        break;
      case 'font':
        state = merge(state, {
          fontPickerVisible: true
        })
        break;
      case 'add':
        this.props.handleAddingPage();
        break;
    }
    this.setState(state);
  }

  onColorChanged = (color) => {
    const { rgb } = color;
    const { r, g, b } = rgb;
    this.setMemberState({
      strokeColor: [r, g, b]
    });
  }

  onTextSizeChange = value => {
    this.setMemberState({
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

  menuTools = () =>  {
    const props = {
      onToolSelected: this.onToolSelected, setMemberState: this.setMemberState
    }
    const tools = [
      {
        name: 'selector',
        type: 'tool'
      },
      {
        name: 'pencil',
        type: 'tool'
      },
      {
        name: 'rectangle',
        type: 'tool'
      },
      {
        name: 'ellipse',
        type: 'tool'
      },
      {
        name: 'eraser',
        type: 'tool'
      },
      {
        name: 'text',
        type: 'tool'
      },
      {
        name: 'font',
        type: 'font',
        font: true,
      },
      {
        name: 'color',
        type: 'color',
      },
      {
        name: 'add',
        type: 'add'
      },
      {
        name: 'share',
        type: 'share',
        need: {
          enableShareScreen: true 
        }
      }
    ]
    return (tools.map((item, index) => {
      const btnClassName = this.state.selected === item.name ? `sidebar-btn ${item.name} selected` : `sidebar-btn ${item.name}`
      if (item.font) {
        return (
          <Popover
            key={index}
            placement="right"
            content={<InputNumber min={12} max={64}
              defaultValue={15}
              onChange={this.onTextSizeChange} 
            />}
            title="字体大小"
            visible={this.state.fontPickerVisible}
          >
            <ToolBarBtn className={btnClassName}
              key={index} type={item.type}
              name={item.name} {...props} />
          </Popover>
        )
      } else if (item.need) {
        if (this.props.enableShareScreen == item.need.enableShareScreen) {
          return (<ToolBarBtn key={index}
            className={btnClassName}
            name={item.name}
            type={item.type}
            selected={this.props.shareBtnState !== 'default'}
            onToolSelected={this.onToolSelected}
            state={this.props.shareBtnState} />
          )
        }
      } else {
        return (
          <ToolBarBtn className={btnClassName}
            key={index} type={item.type}
            name={item.name} {...props} />
        )
      }
    }))
  }

  render() {
    const colorClass = this.state.colorPickerVisible ? 'color-picker' : 'color-picker hidden';
    const maskClass = this.toolEnabled() ? 'mask' : 'mask hidden';

    return (
      <div className="sidebar" category={this.state.selected}>
        <div className={maskClass} onClick={this.onHideTool} />
        <div className="bar-container">
          <div className={this.props.readyState?'':'unusable'}>
            {this.menuTools()}
          </div>
        </div>
        <div className={colorClass}>
          <SketchPicker onChangeComplete={this.onColorChanged} />
        </div>
      </div>
    );
  }
}
export default ToolBar;
