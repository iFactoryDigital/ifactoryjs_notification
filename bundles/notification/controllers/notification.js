
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
      }).sort('created_at', -1).limit(10).find()).map(notif => notif.sanitise())) : [];
    });
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // NORMAL METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * socket listen action
   *
   * @param {Request}  req
   * @param {Response} res
   *
   * @route  /
   * @return {Async}
   */
  async indexAction(req, res) {

    // get notifications
    const notifications = await Notification.where({
      'user.id' : req.user.get('_id').toString(),
    }).find();

    // get Layout
    await this.eden.hook('notification.layout', req);
    req.layout ? res.locals.layout = req.layout : '';

    // render notifications
    res.render('notification', {
      notifications : await Promise.all(notifications.map(notification => notification.sanitise())),
    });
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // NOTIFICATION METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * socket listen action
   *
   * @param  {String} id
   * @param  {Object} opts
   *
   * @call   notification.read
   * @return {Async}
   */
  async readAction(way, opts) {
    // get notifications
    const notifications = await Notification.where({
      read      : null,
      'user.id' : opts.user.get('_id').toString(),
    }).find();

    // promise all
    await Promise.all(notifications.map((notification) => {
      // set read
      notification.set('read', new Date());

      // return save
      return notification.save();
    }));

    // return true
    return true;
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
