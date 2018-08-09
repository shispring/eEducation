import EventEmitter from 'events';

/**
 * DataProvider is for data exchange between client and server.
 * You must implement below methods by yourself according to your stack.
 * @interface BaseDataProvider
 */
export default class BaseDataProvider extends EventEmitter {
  /**
   * connect - open your data tunnel to server
   * @abstract
   * @param {string} - agora app id
   * @param {channel} - channel id
   */
  connect (appId, channel) {
    throw new Error('This method must be implement!');
  }

  /**
   * disconnect - close your data tunnel to server
   * @abstract
   */
  disconnect () {
    throw new Error('This method must be implement!')
  }

  /**
   * dispatch - dispatch action with payload
   * @param {string} action action name
   * @param {Object} payload payload for the action
   * @abstract
   */
  dispatch (action, payload) {
    throw new Error('This method must be implement!')
  }
}
