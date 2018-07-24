/**
 * DataProvider is for data exchange between client and server.
 * You must implement below methods by yourself according to your stack.
 * @module BaseDataProvider
 */
import EventEmitter from 'events';

export default class BaseDataProvider extends EventEmitter {
  /**
   * connect - open your data tunnel to server
   */
  connect () {
    throw new Error('This method must be implement!');
  }

  /**
   * disconnect - close your data tunnel to server
   */
  disconnect () {
    throw new Error('This method must be implement!')
  }

  /**
   * dispatchInitClass - add user info in the class on server
   */
  dispatchInitClass () {
    throw new Error('This method must be implement!')
  }

  /**
   * dispatchLeaveClass - remove user info in the class on server
   */
  dispatchLeaveClass () {
    throw new Error('This method must be implement!')
  }

  /**
   * dispatchStartScreenShare - update sharing status in the class on server
   */
  dispatchStartScreenShare () {
    throw new Error('This method must be implement!')
  }

  /**
   * dispatchStopScreenShare - remove sharing status in the class on server
   */
  dispatchStopScreenShare () {
    throw new Error('This method must be implement!')
  }

  /**
   * dispatchBroadcastMessage - broadcast message in the class on server
   */
  dispatchBroadcastMessage (message, uid) {
    throw new Error('This method must be implement!')
  }

  /**
   * fire - emit events on client according to status change on server
   * @param {string} eventType - event type/name, for example, user-added
   * @param {any} eventPayload - event payload, params client will get
   * 
   * @fires BaseDataProvider#user-info-updated - this.emit('user-info-updated', {uid, info})
   * @fires BaseDataProvider#user-info-removed - this.emit('user-info-removed', {uid})
   * @fires BaseDataProvider#connected
   * @fires BaseDataProvider#disconnected
   * @fires BaseDataProvider#error - this.emit('error', error)
   * @fires BaseDataProvider#message-received - this.emit('message-received', {id, detail})
   * @fires BaseDataProvider#screen-share-started - this.emit('screen-share-started', {sharerId, shareId})
   * @fires BaseDataProvider#screen-share-stopped - this.emit('screen-share-stopped')
   */
  fire (eventType, eventPayload) {
    // listen to server events and fire related events on client
    this.emit(eventType, eventPayload)
  }

  /**
   * log with prefix: `[Data Provider:]`
   */
  log (...args) {
    console.log('[Data Provider:]', ...args)
  }

}
