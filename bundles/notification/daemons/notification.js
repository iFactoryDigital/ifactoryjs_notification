
// import dependencies
const Daemon = require('daemon');

// require helpers
const notificationHelper = helper('notification');

/**
 * extend notification Daemon
 *
 * @cluster back
 * @cluster notification
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

  }
}

/**
 * export built notification daemon
 *
 * @type {notificationDaemon}
 */
module.exports = NotificationDaemon;
