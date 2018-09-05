import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './index.sass';

class IconButton extends Component {
  render() {
    let icon = require(`../../assets/images/icons/${this.props.type}.png`);
    let activeIcon = require(`../../assets/images/icons/${
      this.props.type
    }-hover.png`);

    const ActiveIcon = (
      <img className="icon-btn--active" src={activeIcon} alt="" />
    );

    const InactiveIcon = (
      <img className="icon-btn--inactive" src={icon} alt="" />
    );

    let className =
      (this.props.className || '') +
      ' icon-btn' +
      (this.props.active ? ' active' : '') +
      (this.props.disabled ? ' disabled' : '');
    return (
      <div {...this.props} onClick={this.handleClick} className={className}>
        {ActiveIcon}
        {InactiveIcon}
      </div>
    );
  }

  handleClick = e => {
    if (this.props.disabled) {
      return;
    }
    this.props.onClick && this.props.onClick(e);
  };
}

IconButton.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool
};

export default IconButton;
