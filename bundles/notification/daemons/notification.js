
// import dependencies
const socket = require('socket');
const config = require('config');
const Daemon = require('daemon');

// require helpers
const notificationHelper = helper('notification');

// require user
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

    // get audit models
    const models = (config.get('audit.models') || Object.keys(cache('models'))).filter(m => m !== 'audit');

    // add hook
    models.forEach((m) => {
      /**
       * create model monitor method
       *
       * @param  {String} way
       * @param  {String} type
       *
       * @return {Promise}
       */
      const createMonitor = (way, type) => {
        // return function
        return async (subject, { by, updates }) => {
          // create audit entity
          const notification = await notificationHelper.notify.user(await User.findById('5c6f69fefe22ec452d2cf5aa'), {
            url   : subject.url ? subject.url('view') : null,
            body  : `${['create', 'remove'].includes(way) ? `${(way === 'create' ? 'Created' : 'Removed')} ${subject.constructor.name} #${subject.get('_id').toString()}` : `Updates: ${Array.from(updates).join(', ')}`}`,
            image : await subject.get('image') || await subject.get('images') || await subject.get('logo') || await subject.get('avatar'),
            title : `${(way === 'create' ? 'Created' : (way === 'update' ? 'Updated' : 'Removed'))} ${subject.constructor.name}`,
          });
        };
      };

      // create hook
      this.eden.pre(`${m.toLowerCase()}.update`, createMonitor('update', m));
      this.eden.pre(`${m.toLowerCase()}.remove`, createMonitor('remove', m));
      this.eden.post(`${m.toLowerCase()}.create`, createMonitor('create', m));
    });
  }
}

/**
 * export built notification daemon
 *
 * @type {notificationDaemon}
 */
module.exports = NotificationDaemon;
