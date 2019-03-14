
// Require dependencies
const Controller = require('controller');

// Require models
const Notification = model('notification');

// require helpers
const modelHelper = helper('model');
const notificationHelper = helper('notification');

/**
 * Build notification controller
 *
 * @acl   admin
 * @fail  next
 * @mount /notification
 */
class NotificationController extends Controller {
  /**
   * Construct notification controller
   */
  constructor() {
    // Run super
    super();

    // bind build methods
    this.build = this.build.bind(this);

    // set building
    this.building = this.build();
  }

  // ////////////////////////////////////////////////////////////////////////////
  //
  // BUILD METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * builds notification controller
   */
  build() {
    // on render
    this.eden.pre('view.compile', async (render) => {
      // notifications
      render.notifications = render.user ? await Promise.all((await Notification.where({
        'user.id' : render.user.id,
      }).find()).map(notif => notif.sanitise())) : [];
    });
  }

  // ////////////////////////////////////////////////////////////////////////////
  //
  // MODEL LISTEN METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////


  /**
   * socket listen action
   *
   * @param  {String} id
   * @param  {Object} opts
   *
   * @call   model.listen.notification
   * @return {Async}
   */
  async listenAction(id, uuid, opts) {
    // / return if no id
    if (!id) return;

    // join room
    opts.socket.join(`notification.${id}`);

    // add to room
    return await modelHelper.listen(opts.sessionID, await Notification.findById(id), uuid, true);
  }

  /**
   * socket listen action
   *
   * @param  {String} id
   * @param  {Object} opts
   *
   * @call   model.deafen.notification
   * @return {Async}
   */
  async deafenAction(id, uuid, opts) {
    // / return if no id
    if (!id) return;

    // join room
    opts.socket.leave(`notification.${id}`);

    // add to room
    return await modelHelper.deafen(opts.sessionID, await Notification.findById(id), uuid, true);
  }
}

/**
 * Export notification controller
 *
 * @type {NotificationController}
 */
module.exports = NotificationController;
