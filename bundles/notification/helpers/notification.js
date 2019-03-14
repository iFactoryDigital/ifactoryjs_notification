
// import dependencies
const Helper = require('helper');

// require models
const Notification = model('notification');

/**
 * extend notification helper
 *
 * @extends {helper}
 */
class NotificationHelper extends Helper {
  /**
   * construct notification helper
   */
  constructor() {
    // run super
    super();

    // bind transport
    this.register = this.register.bind(this);
    this.transport = this.transport.bind(this);

    // create notification logic
    this.notify = {
      user  : this.notifyUser.bind(this),
      users : this.notifyUsers.bind(this),
    };

    // set private methods
    this.__transports = new Map();
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // REGISTER FUNCTIONS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * create notification transport
   *
   * @param  {String}   transport
   * @param  {Function} should
   * @param  {Function} cb
   *
   * @return {*}
   */
  register(transport, should, cb) {
    // create transport
    this.__transports.set(transport, {
      cb,
      should,
      transport,
    });
  }

  /**
   * gets transport
   *
   * @param  {String} transport
   *
   * @return {*}
   */
  transport(transport) {
    // return transport
    return this.__transports.get(transport);
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // NOTIFICATION FUNCTIONS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * notify user
   *
   * @param  {User} user
   *
   * @return {*}
   */
  async notifyUser(user, notification) {
    // creates new notification for user
    const userNotification = new Notification({
      user,
      ...notification,
    });

    // save notification
    await userNotification.save();

    // notification
    this.eden.thread(['back', 'notification']).call('notification.set', userNotification.get('_id'));

    // return notification
    return userNotification;
  }

  /**
   * notify users
   *
   * @param  {Array} users
   *
   * @return {*}
   */
  notifyUsers(users, notification) {
    // creates new notification for user
    return Promise.all(users.map((user) => {
      // notify user
      return this.notify.user(user, notification);
    }));
  }
}

/**
 * export built notification helper
 *
 * @type {notificationHelper}
 */
module.exports = new NotificationHelper();
