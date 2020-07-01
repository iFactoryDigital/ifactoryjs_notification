
// Require dependencies
const Grid        = require('grid');
const tmpl        = require('riot-tmpl');
const Model       = require('model');
const config      = require('config');
const Controller  = require('controller');
const escapeRegex = require('escape-string-regexp');

// Require models
const Notification = model('notification');
const Block = model('block');
const Acl   = model('acl');

// require helpers
const formHelper  = helper('form');
const fieldHelper = helper('form/field');
const blockHelper = helper('cms/block');

/**
 * Build notification controller
 *
 * @acl   admin
 * @fail  next
 * @mount /admin/config/notification
 */
class NotificationAdminController extends Controller {
  /**
   * Construct notification Admin Controller
   */
  constructor() {
    // run super
    super();

    // bind build methods
    this.build = this.build.bind(this);

    // bind methods
    this.gridAction = this.gridAction.bind(this);
    this.indexAction = this.indexAction.bind(this);
    this.createAction = this.createAction.bind(this);
    this.updateAction = this.updateAction.bind(this);
    this.removeAction = this.removeAction.bind(this);
    this.createSubmitAction = this.createSubmitAction.bind(this);
    this.updateSubmitAction = this.updateSubmitAction.bind(this);
    this.removeSubmitAction = this.removeSubmitAction.bind(this);

    // bind private methods
    this._grid = this._grid.bind(this);

    // set building
    this.building = this.build();
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // BUILD METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * build notification admin controller
   */
  build() {
    //
    // REGISTER BLOCKS
    //

    // register simple block
    blockHelper.block('admin.notification.grid', {
      acl         : ['admin.notification'],
      for         : ['admin'],
      title       : 'Notification Grid',
      description : 'Notification Grid block',
    }, async (req, block) => {
      // get notes block from db
      const blockModel = await Block.findOne({
        uuid : block.uuid,
      }) || new Block({
        uuid : block.uuid,
        type : block.type,
      });

      // create new req
      const fauxReq = {
        query : blockModel.get('state') || {},
      };

      // return
      return {
        tag   : 'grid',
        name  : 'Notification',
        grid  : await (await this._grid(req)).render(fauxReq),
        class : blockModel.get('class') || null,
        title : blockModel.get('title') || '',
      };
    }, async (req, block) => {
      // get notes block from db
      const blockModel = await Block.findOne({
        uuid : block.uuid,
      }) || new Block({
        uuid : block.uuid,
        type : block.type,
      });

      // set data
      blockModel.set('class', req.body.data.class);
      blockModel.set('state', req.body.data.state);
      blockModel.set('title', req.body.data.title);

      // save block
      await blockModel.save(req.user);
    });

    //
    // REGISTER FIELDS
    //

    // register simple field
    fieldHelper.field('admin.notification', {
      for         : ['admin'],
      title       : 'Notification',
      description : 'Notification Field',
    }, async (req, field, value) => {
      // set tag
      field.tag = 'notification';
      field.value = value ? (Array.isArray(value) ? await Promise.all(value.map(item => item.sanitise())) : await value.sanitise()) : null;

      // return
      return field;
    }, async (req, field) => {
      // save field
    }, async (req, field, value, old) => {
      // set value
      try {
        // set value
        value = JSON.parse(value);
      } catch (e) {}

      // check value
      if (!Array.isArray(value)) value = [value];

      // return value map
      return await Promise.all((value || []).filter(val => val).map(async (val, i) => {
        // run try catch
        try {
          // buffer notification
          const notification = await Notification.findById(val);

          // check notification
          if (notification) return notification;

          // return null
          return null;
        } catch (e) {
          // return old
          return old[i];
        }
      }));
    });
  }

  /**
   * setup flow hook
   *
   * @pre flow.build
   */
  async flowSetupHook(flow) {

    // do initial actions
    flow.action('notification.trigger', {
      tag   : 'notification',
      icon  : 'fa fa-bell',
      title : 'Trigger Notification',
    }, (action, render) => {

    }, async (opts, element, data) => {
      // set config
      element.config = element.config || {};

      // query for data
      const User = model('user');

      // clone data
      const newData = Object.assign({}, data);

      // set values
      let body      = tmpl.tmpl(element.config.body || '', newData);
      let title     = tmpl.tmpl(element.config.title || '', newData);
      const url     = tmpl.tmpl(element.config.url || '', newData);
      const isadmin = tmpl.tmpl(element.config.isadmin || '', newData);
      const from_   = tmpl.tmpl(element.config.from || '', newData);
      const in_     = tmpl.tmpl(element.config.in || '', newData);
      const once    = tmpl.tmpl(element.config.sendonce || '', newData);
      const role    = tmpl.tmpl(element.config.role || '', newData);

      let addusers = '';

      if (isadmin && isadmin === 'yes') {
        const adminacl = await Acl.where({name : 'Admin'}).findOne();
        addusers       = await User.where({'acl.id' : adminacl.get('_id')}).find();
      }

      if (role) {
        const acl = await Acl.where({name : role}).findOne();
        addusers  = await User.where({'acl.id' : acl.get('_id')}).find();
      }

      if (from_ && in_) {
        const frommodel = (await newData.model.get(from_) || {});
        if (!frommodel || Object.keys(frommodel).length === 0) return;
        const user = await frommodel.get(in_);
        if (!user || Object.keys(user).length === 0) return;
        addusers = addusers.concat([user]);
      }

      // send model
      if (newData.model instanceof Model) {
        // sanitise model
        newData.model = await newData.model.sanitise();
        body          = tmpl.tmpl(element.config.body || '', newData.model);        
        title         = tmpl.tmpl(element.config.title || '', newData.model);
      }

      if (once === 'yes') {
        const found = await Notification.where({ body : body }).findOne();
        console.log(found);
        if (found) return;
      }

      // create query
      let query = User;

      // loop queries
      (element.config.queries || []).forEach((q) => {
        // get values
        const { method, type } = q;
        let { key, value } = q;

        // data
        key = tmpl.tmpl(key, newData);
        value = tmpl.tmpl(value, newData);

        // check type
        if (type === 'number') {
          // parse
          value = parseFloat(value);
        } else if (type === 'boolean') {
          // set value
          value = value.toLowerCase() === 'true';
        }

        // add to query
        if (method === 'eq' || !method) {
          // query
          query = query.where({
            [key] : value,
          });
        } else if (['gt', 'lt'].includes(method)) {
          // set gt/lt
          query = query[method](key, value);
        } else if (method === 'ne') {
          // not equal
          query = query.ne(key, value);
        }
      });

      // get alerted users
      let alertedUsers = (from_ && in_) ? [] :  Array.isArray(element.config.queries) && element.config.queries.length > 0 ? await query.find() : [];

      if (addusers && Array.isArray(addusers) && addusers.length > 0) alertedUsers = alertedUsers.concat(addusers);

      // create notifications
      alertedUsers.forEach((alertedUser) => {
        // create notification
        const notification = new Notification({
          url,
          body,
          title,
          user  : alertedUser,
          image : newData.model && newData.model.image ? newData.model.image : null,
        });

        // save
        notification.save();
      });

      // return true
      return true;
    });
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // CRUD METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * Index action
   *
   * @param {Request}  req
   * @param {Response} res
   *
   * @icon     fa fa-bell
   * @menu     {ADMIN} Notifications
   * @title    Notification Administration
   * @parent   /admin/config
   * @route    {get} /
   * @layout   admin
   * @priority 10
   */
  async indexAction(req, res) {
    // Render grid
    res.render('notification/admin', {
      grid : await (await this._grid(req)).render(req),
    });
  }

  /**
   * Add/edit action
   *
   * @param {Request}  req
   * @param {Response} res
   *
   * @route    {get} /create
   * @layout   admin
   * @return   {*}
   * @priority 12
   */
  createAction(req, res) {
    // Return update action
    return this.updateAction(req, res);
  }

  /**
   * Update action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {get} /:id/update
   * @layout  admin
   */
  async updateAction(req, res) {
    // Set website variable
    let notification = new Notification();
    let create = true;

    // Check for website model
    if (req.params.id) {
      // Load by id
      notification = await Notification.findById(req.params.id);
      create = false;
    }

    // get form
    const form = await formHelper.get('edenjs.notification');

    // digest into form
    const sanitised = await formHelper.render(req, form, await Promise.all(form.get('fields').map(async (field) => {
      // return fields map
      return {
        uuid  : field.uuid,
        value : await notification.get(field.name || field.uuid),
      };
    })));

    // get form
    if (!form.get('_id')) res.form('edenjs.notification');

    // Render page
    res.render('notification/admin/update', {
      item   : await notification.sanitise(),
      form   : sanitised,
      title  : create ? 'Create notification' : `Update ${notification.get('_id').toString()}`,
      fields : config.get('notification.fields'),
    });
  }

  /**
   * Create submit action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {post} /create
   * @return  {*}
   * @layout  admin
   * @upload  {single} image
   */
  createSubmitAction(req, res) {
    // Return update action
    return this.updateSubmitAction(req, res);
  }

  /**
   * Add/edit action
   *
   * @param {Request}  req
   * @param {Response} res
   * @param {Function} next
   *
   * @route   {post} /:id/update
   * @layout  admin
   */
  async updateSubmitAction(req, res, next) {
    // Set website variable
    let create = true;
    let notification = new Notification();

    // Check for website model
    if (req.params.id) {
      // Load by id
      notification = await Notification.findById(req.params.id);
      create = false;
    }

    // get form
    const form = await formHelper.get('edenjs.notification');

    // digest into form
    const fields = await formHelper.submit(req, form, await Promise.all(form.get('fields').map(async (field) => {
      // return fields map
      return {
        uuid  : field.uuid,
        value : await notification.get(field.name || field.uuid),
      };
    })));

    // loop fields
    for (const field of fields) {
      // set value
      notification.set(field.name || field.uuid, field.value);
    }

    // Save notification
    await notification.save(req.user);

    // set id
    req.params.id = notification.get('_id').toString();

    // return update action
    return this.updateAction(req, res, next);
  }

  /**
   * Delete action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {get} /:id/remove
   * @layout  admin
   */
  async removeAction(req, res) {
    // Set website variable
    let notification = false;

    // Check for website model
    if (req.params.id) {
      // Load user
      notification = await Notification.findById(req.params.id);
    }

    // Render page
    res.render('notification/admin/remove', {
      item  : await notification.sanitise(),
      title : `Remove ${notification.get('_id').toString()}`,
    });
  }

  /**
   * Delete action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route   {post} /:id/remove
   * @title   Remove Notification
   * @layout  admin
   */
  async removeSubmitAction(req, res) {
    // Set website variable
    let notification = false;

    // Check for website model
    if (req.params.id) {
      // Load user
      notification = await Notification.findById(req.params.id);
    }

    // Alert Removed
    req.alert('success', `Successfully removed ${notification.get('_id').toString()}`);

    // Delete website
    await notification.remove(req.user);

    // Render index
    return this.indexAction(req, res);
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // QUERY METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * index action
   *
   * @param req
   * @param res
   *
   * @acl   admin
   * @fail  next
   * @route {GET} /query
   */
  async queryAction(req, res) {
    // find children
    let notifications = await Notification;

    // set query
    if (req.query.q) {
      notifications = notifications.where({
        name : new RegExp(escapeRegex(req.query.q || ''), 'i'),
      });
    }

    // add roles
    notifications = await notifications.skip(((parseInt(req.query.page, 10) || 1) - 1) * 20).limit(20).sort('name', 1)
      .find();

    // get children
    res.json((await Promise.all(notifications.map(notification => notification.sanitise()))).map((sanitised) => {
      // return object
      return {
        text  : sanitised.name,
        data  : sanitised,
        value : sanitised.id,
      };
    }));
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // GRID METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * User grid action
   *
   * @param {Request} req
   * @param {Response} res
   *
   * @route  {post} /grid
   * @return {*}
   */
  async gridAction(req, res) {
    // Return post grid request
    return (await this._grid(req)).post(req, res);
  }

  /**
   * Renders grid
   *
   * @param {Request} req
   *
   * @return {grid}
   */
  async _grid(req) {
    // Create new grid
    const notificationGrid = new Grid();

    // Set route
    notificationGrid.route('/admin/config/notification/grid');

    // get form
    const form = await formHelper.get('edenjs.notification');

    // Set grid model
    notificationGrid.id('edenjs.notification');
    notificationGrid.model(Notification);
    notificationGrid.models(true);

    // Add grid columns
    notificationGrid.column('_id', {
      sort     : true,
      title    : 'Id',
      priority : 100,
    });

    // branch fields
    await Promise.all((form.get('_id') ? form.get('fields') : config.get('notification.fields').slice(0)).map(async (field, i) => {
      // set found
      const found = config.get('notification.fields').find(f => f.name === field.name);

      // add config field
      await formHelper.column(req, form, notificationGrid, field, {
        hidden   : !(found && found.grid),
        priority : 100 - i,
      });
    }));

    // add extra columns
    notificationGrid.column('read', {
      tag      : 'grid-date',
      sort     : true,
      title    : 'Read',
      priority : 4,
    }).column('updated_at', {
      tag      : 'grid-date',
      sort     : true,
      title    : 'Updated',
      priority : 3,
    }).column('created_at', {
      tag      : 'grid-date',
      sort     : true,
      title    : 'Created',
      priority : 2,
    }).column('actions', {
      tag      : 'notification-actions',
      type     : false,
      width    : '1%',
      title    : 'Actions',
      priority : 1,
    });

    // branch filters
    config.get('notification.fields').slice(0).filter(field => field.grid).forEach((field) => {
      // add config field
      notificationGrid.filter(field.name, {
        type  : 'text',
        title : field.label,
        query : (param) => {
          // Another where
          notificationGrid.match(field.name, new RegExp(escapeRegex(param.toString().toLowerCase()), 'i'));
        },
      });
    });

    // Set default sort order
    notificationGrid.sort('created_at', -1);

    // Return grid
    return notificationGrid;
  }
}

/**
 * Export notification controller
 *
 * @type {NotificationAdminController}
 */
module.exports = NotificationAdminController;
