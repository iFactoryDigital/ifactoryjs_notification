
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

    // create notification logic
    this.notify = {
      user  : this.notifyUser.bind(this),
      users : this.notifyUsers.bind(this),
    };
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
