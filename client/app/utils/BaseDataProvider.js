/* eslint-disable */
/**
 * DataProvider is for data exchange between client and server.
 * You must implement below methods by yourself according to your stack.
 */
import EventEmitter from 'events';

export default class DataProvider extends EventEmitter {
  /**
   * @interface connect - open your data tunnel to server
   */
  connect () {
    throw new Error('This method must be implement!');
  }

  /**
   * @interface disconnect - close your data tunnel to server
   */
  disconnect () {
    throw new Error('This method must be implement!')
  }

  /**
   * @interface dispatchInitClass - add user info in the class on server
   */
  dispatchInitClass () {
    throw new Error('This method must be implement!')
  }

  /**
   * @interface dispatchLeaveClass - remove user info in the class on server
   */
  dispatchLeaveClass () {
    throw new Error('This method must be implement!')
  }

  /**
   * @interface dispatchStartScreenShare - update sharing status in the class on server
   */
  dispatchStartScreenShare () {
    throw new Error('This method must be implement!')
  }

  /**
   * @interface dispatchStopScreenShare - remove sharing status in the class on server
   */
  dispatchStopScreenShare () {
    throw new Error('This method must be implement!')
  }

  /**
   * @interface dispatchBroadcastMessage - broadcast message in the class on server
   */
  dispatchBroadcastMessage (message, uid) {
    throw new Error('This method must be implement!')
  }

  /**
   * @interface fire - emit events on client according to status change on server
   * @param {string} eventType - event type/name, for example, user-added
   * @param {any} eventPayload - event payload, params client will get
   * 
   * @fires DataProvider#user-info-updated - this.emit('user-info-updated', {uid, info})
   * @fires DataProvider#user-info-removed - this.emit('user-info-removed', {uid})
   * @fires DataProvider#connected
   * @fires DataProvider#disconnected
   * @fires DataProvider#error - this.emit('error', error)
   * @fires DataProvider#message-received - this.emit('message-received', {id, detail})
   * @fires DataProvider#screen-share-started - this.emit('screen-share-started', {sharerId, shareId})
   * @fires DataProvider#screen-share-stopped - this.emit('screen-share-stopped')
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
