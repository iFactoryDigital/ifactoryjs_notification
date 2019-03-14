
// import dependencies
const socket = require('socket');
const Daemon = require('daemon');

// require helpers
const notificationHelper = helper('notification');

// require models
const User = model('user');

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

    // update vehicle
    this.eden.post('vehicle.update', async (vehicle) => {
      // notify user
      notificationHelper.notify.user(await User.findById('5c6f69fefe22ec452d2cf5aa'), {
        url   : `/admin/fleet/vehicle/${vehicle.get('_id').toString()}/update`,
        body  : 'Test Body',
        image : await vehicle.get('image') || await vehicle.get('images'),
        title : 'Test Title',
      });
    });
  }
}

/**
 * export built notification daemon
 *
 * @type {notificationDaemon}
 */
module.exports = NotificationDaemon;
