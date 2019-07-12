
// import dependencies
const socket = require('socket');
const config = require('config');
const Daemon = require('daemon');

/**
 * extend notification Daemon
 *
 * @extends {Daemon}
 */
class NotificationDaemon extends Daemon {
  /**
   * construct Notification Daemon
   */
  constructor() {
    // run super
    super();

    // bind build method
    this.build = this.build.bind(this);

    // build
    this.building = this.build();
  }

  /**
   * build Notification Daemon
   */
  async build() {
    // create emit function
    const emit = async (notification) => {
      // get user
      let users = await notification.get('user');

      // check users
      if (!Array.isArray(users)) users = [users];

      // filter
      users = users.filter(u => u);

      // sanitise
      users.forEach(async (user) => {
        // emit notification
        socket.user(user, 'notification', await notification.sanitise());
      });
    };

    // on update
    this.eden.post('notification.create', emit);
    this.eden.post('notification.update', emit);
  }
}

/**
 * export built notification daemon
 *
 * @type {notificationDaemon}
 */
module.exports = NotificationDaemon;
