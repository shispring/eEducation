import React, { PropTypes } from 'react';
import Whiteboard from '../../utils/Whiteboard';
import './index.scss';

class ToolBarBtn extends React.Component {
  getCategory() {
    let category = this.props.name;
    if (this.props.type === 'share') {
      category = 'share';
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
      selected: 'pencil'
    };
  }

  onToolSelected = (category, type) => {
    if (type === 'tool') {
      this.setState({
        selected: category
      });
    } else if (type === 'share') {
      this.props.handleShareScreen();
    }
  }

  render() {
    const tools = ['selector', 'pencil', 'rectangle', 'ellipse', 'eraser', 'text'];
    return (
      <div className="sidebar">
        <div className="bar-container">
          {tools.map(tool => (
            <ToolBarBtn type="tool" name={tool} selected={this.state.selected === tool} onToolSelected={this.onToolSelected} />
            ))}
          <ToolBarBtn type="share" selected={this.props.shareBtnState !== 'default'} onToolSelected={this.onToolSelected} state={this.props.shareBtnState} />
        </div>
      </div>
    );
  }
}
export default ToolBar;
