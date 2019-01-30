import React, { Component } from "react";
import White from "../../utils/Whiteboard";
import "white-web-sdk/style/index.css";
import { RoomWhiteboard } from "white-react-sdk";
import { Pagination, Spin } from "antd";
import Toolbar from "../Toolbar";
import WindowPicker from "../WindowPicker";
import SimpleIconButton from "../SimpleIconButton";
import base64Encode from "../../utils/Base64Encode";

function retry(thunk, ms = 1000, maxRetries = 5) {
  return new Promise((resolve, reject) => {
    var retries = 0;
    thunk()
      .then(resolve)
      .catch(() => {
        setTimeout(() => {
          console.log("retrying failed promise...", retries);
          ++retries;
          if (retries >= maxRetries) {
            return reject("maximum retries exceeded");
          }
          retry(thunk, ms).then(resolve);
        }, ms);
      });
  });
}

export default class Whiteboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSharing: false,
      whiteReadyState: false,
      waitSharing: false,
      showWindowPicker: false,
      room: null,
      currentPage: 1,
      totalPage: 1,
      role: props._client.user.role
    };
    console.log("whiteboard new", this.state.room);
  }

  componentDidMount() {
    const { channel, boardId } = this.props.state.clientConfig;
    console.log("whiteboard [channel, boardId]", [channel, boardId]);
    this.initWhiteboard(channel, boardId);
    this.subcribeWhiteboardEvents();
  }

  updateBoardInfo(uuid) {
    this.props._client.dataProvider.dispatch("updateBoardInfo", { uuid });
  }

  handleShareScreen = () => {
    if (!this.state.isSharing) {
      let list = this.props._client.rtcEngine.getScreenWindowsInfo();
      let windowList = list.map(item => {
        return {
          ownerName: item.ownerName,
          name: item.name,
          windowId: item.windowId,
          image: base64Encode(item.image)
        };
      });
      this.setState({
        showWindowPicker: true,
        windowList
      });
      return;
      // this._client.startScreenShare();
    }
    this.props._client.stopScreenShare();
    this.setState({
      waitSharing: true,
      isSharing: !this.state.isSharing
    });
    setTimeout(() => {
      this.setState({
        waitSharing: false
      });
    }, 300);
  };

  handleWindowPicker = windowId => {
    this.props._client.startScreenShare(windowId);
    this.setState({
      waitSharing: true,
      showWindowPicker: false,
      isSharing: !this.state.isSharing
    });
    setTimeout(() => {
      this.setState({
        waitSharing: false
      });
    }, 300);
  };

  async initWhiteboard(channel, boardId) {
    // initialize whiteboard
    let response = null;
    let roomToken = null;
    let room = null;
    try {
      if (boardId) {
        response = await White.initialize(channel, { uuid: boardId });
        ({ roomToken } = response);
        room = { uuid: boardId };
      } else {
        response = await White.initialize(channel);
        ({ roomToken, room } = response);
        this.updateBoardInfo(room.uuid);
      }
      await retry(() => White.join(room.uuid, roomToken));
      console.log(`whiteboard initialized`);
    } catch (err) {
      console.warn("whiteboard failed to initialize");
      throw err;
    }
  }

  onChangePage = value => {
    const room = this.state.room;
    this.setState({
      currentPage: value
    });
    room.setGlobalState({
      currentSceneIndex: value - 1
    });
  };

  setMemberState = state => {
    this.state.room.setMemberState(state);
  };

  render() {
    // Toolbar
    let windowPicker;
    if (this.state.showWindowPicker) {
      windowPicker = (
        <WindowPicker
          onSubmit={this.handleWindowPicker}
          onCancel={e => this.setState({ showWindowPicker: false })}
          windowList={this.state.windowList}
        />
      );
    }

    let shareBtnState = this.state.isSharing ? "sharing" : "default";
    if (this.state.waitSharing) {
      shareBtnState = "preparing";
    }

    return (
      <section className="board-container">
        <div
          className="board"
          id="whiteboard"
          style={{ display: this.state.isSharing ? "none" : "block" }}
        >
          {this.state.whiteReadyState === false ? (
            <div className="board-mask">
              <Spin />
            </div>
          ) : (
            <React.Fragment>
              <div
                style={{
                  display: this.state.role === "audience" ? "flex" : "none"
                }}
                className="board-mask"
              />
              <RoomWhiteboard
                room={this.state.room}
                style={{ width: "100%", height: "100vh" }}
              />
              <div className="pagination">
                <Pagination
                  defaultCurrent={1}
                  current={this.state.currentPage}
                  total={this.state.totalPage}
                  pageSize={1}
                  onChange={this.onChangePage}
                />
              </div>
            </React.Fragment>
          )}
        </div>
        <div className="board" id="shareboard" />
        {this.state.role === "audience" ? (
          ""
        ) : (
          <React.Fragment>
            <Toolbar
              setMemberState={this.setMemberState}
              room={this.state.room}
              readyState={this.state.whiteReadyState}
              enableShareScreen={this.state.role === "teacher"}
              shareBtnState={shareBtnState}
              handleShareScreen={this.handleShareScreen}
              handleAddingPage={this.handleAddingPage}
            />
            {windowPicker}
          </React.Fragment>
        )}
        <div className="float-button-group">{this.props.floatButtonGroup}</div>
      </section>
    );
  }

  handleAddingPage = () => {
    const { room } = White;
    const newPageIndex = this.state.totalPage + 1;
    const newTotalPage = this.state.totalPage + 1;
    this.setState({
      currentPage: newPageIndex,
      totalPage: newTotalPage
    });
    room.insertNewPage(newPageIndex - 1);
    room.setGlobalState({
      currentSceneIndex: newPageIndex - 1
    });
  };

  subcribeWhiteboardEvents = () => {
    White.on("whiteStateChanged", ({ readyState, room }) => {
      this.setState({
        whiteReadyState: readyState,
        room
      });
    });
    White.on("roomStateChanged", modifyState => {
      if (modifyState.globalState) {
        // globalState changed
        let newGlobalState = modifyState.globalState;
        let currentSceneIndex = newGlobalState.currentSceneIndex;
        if (currentSceneIndex + 1 > this.state.totalPage) {
          this.props.updatePagination({
            totalPage: currentSceneIndex + 1,
            currentPage: currentSceneIndex + 1
          });
        } else {
          this.props.updatePagination({
            currentPage: currentSceneIndex + 1
          });
        }
      }
      if (modifyState.memberState) {
        // memberState changed
        // let newMemberState = modifyState.memberState;
        return;
      }
      if (modifyState.broadcastState) {
        // broadcastState changed
        // let broadcastState = modifyState.broadcastState;
        return;
      }
    });
  };
}
