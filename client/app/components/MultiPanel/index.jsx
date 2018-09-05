import { Button } from 'antd'
import React from 'react';

import IconButton from '../IconButton';
import './index.sass'

class MultiPanel extends React.Component {
  render() {

    const ButtonPanel = () => (
      <div className="button-panel">
        <IconButton className="button" type="select"></IconButton>
        <IconButton className="button" type="pencil"></IconButton>
        <IconButton className="button" type="stroke-width"></IconButton>
        <IconButton className="button" type="rubber"></IconButton>
        <IconButton className="button" type="square"></IconButton>
        <IconButton className="button" type="oval"></IconButton>
        <IconButton className="button" type="font"></IconButton>
        <IconButton className="button" type="font-size"></IconButton>
        <IconButton className="button" type="color"></IconButton>
        <IconButton className="button" type="new-board"></IconButton>
        <IconButton className="button" type="import"></IconButton>

        {/* screen share */}
        <IconButton type="screen-share" id="screen-share-button"></IconButton>
      </div>
    )

    const WindowPicker = () => (
      <div className="window-picker-panel">
        <div className="close-button">
          <img src={require('../../assets/images/icons/close.png')} alt=""/>
        </div>
        <header className="window-picker-header">
          Choose the window
        </header>
        <section className="window-picker-container">

        </section>
        <footer className="window-picker-footer">
          <Button type="primary">Start Screen Sharing</Button>
        </footer>
      </div>
    )

    return (
      <div className="multi-panel">
        <ButtonPanel></ButtonPanel>
        <WindowPicker></WindowPicker>
      </div>
    )
  }
}

export default MultiPanel;