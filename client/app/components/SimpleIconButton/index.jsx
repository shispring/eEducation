import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './index.sass';

class SimpleIconButton extends Component {
  render() {
    let icon = require(`../../assets/images/${this.props.type}.png`);

    const Icon = (
      <img src={icon} alt="" />
    );

    let className =
      (this.props.className || '') +
      ' icon-btn' +
      (this.props.active ? ' active' : '') +
      (this.props.disabled ? ' disabled' : '');
    return (
      <div {...this.props} onClick={this.handleClick} className={className}>
        {Icon}
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

SimpleIconButton.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool
};

export default SimpleIconButton;
