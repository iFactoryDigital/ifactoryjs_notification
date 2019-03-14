<notifications>
  <ul class="nav navbar-nav navbar-right">
    <li class="nav-item dropdown" ref="dropdown">
      <a href="#!" class="nav-link dropdown-toggle mr-2" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
        Notification <span class="badge badge-danger" if={ getUnread() }>{ getUnread().toLocaleString() }</span>
      </a>
      <div class="dropdown-menu dropdown-menu-right dropdown-menu-notifications p-0 border-0">
        <div class="card">
          <div class="card-header text-center">
            Notifications
          </div>
          <div class="list-group">
            <a each={ notification, i in this.notifications } href={ notification.url } class="list-group-item list-group-item-action">
              <div class="row">
                <div class="col-2 pr-0">
                  <media-img image={ getImage(notification) } label="2x-sq" class="rounded-circle img-fluid" />
                </div>
                <div class="col-10">
                  <div>
                    <small class="float-right">
                      { getDate(notification.created_at) }
                    </small>
                    <b class="d-block text-overflow">{ notification.title }</b>
                  </div>
                  <small class="mb-0 d-block">{ notification.body }</small>
                </div>
              </div>
            </a>
          </div>
          <div class="card-footer text-center">
            <a href="/notification">
              View All
            </a>
          </div>
        </div>
      </div>
    </li>
  </ul>
  
  <script>
    // set notifications
    this.notifications = (this.eden.get('notifications') || []).sort((a, b) => {
      // do sort
      if (a.created_at > b.created_at) {
        return -1;
      }
      if (b.created_at > a.created_at) {
        return 1;
      }
      
      // return 0-
      return 0;
    });
    
    // require moment
    const moment = require('moment');
    
    /**
     * get date
     *
     * @param  {Date} created_at
     *
     * @return {String}
     */
    getDate(created_at) {
      // from now
      return moment(created_at).fromNow();
    }
    
    /**
     * get date
     *
     * @param  {Date} created_at
     *
     * @return {String}
     */
    getImage(notification) {
      // set image
      const images = Array.isArray(notification.image) ? notification.image : [notification.image];
      
      // from now
      return images[0];
    }
    
    /**
     * gets unread notifications
     *
     * @return {Integer}
     */
    getUnread() {
      // reduce notifications
      return this.notifications.reduce((accum, notification) => {
        // add to accum
        if (!notification.read) accum += 1;
        
        // return accum
        return accum;
      }, 0);
    }
    
    /**
     * on notification
     *
     * @param  {Object} notification
     *
     * @return {*}
     */
    onNotification(notification) {
      // check found
      const found = this.notifications.find((notif) => notif.id === notification.id);
      
      // check found
      if (!found) {
        // add
        this.notifications.push(notification);
        
        // sort
        this.notifications.sort((a, b) => {
          // do sort
          if (a.created_at > b.created_at) {
            return -1;
          }
          if (b.created_at > a.created_at) {
            return 1;
          }
          
          // return 0-
          return 0;
        });
        
        // return update
        return this.update();
      }
      
      // loop for keys
      for (const key in notification) {
        // replace notification key
        found[key] = notification[key];
      }
      
      // return update
      this.update();
    }
    
    /**
     * on mount function
     */
    this.on('mount', () => {
      // check frontend
      if (!this.eden.frontend) return;
      
      // check notification
      socket.on('notification', this.onNotification);
      
      // add listener
      jQuery(this.refs.dropdown).on('shown.bs.dropdown', () => {
        // reset unread
        socket.call('notification.read', true);
      });
    });
    
  </script>
</notifications>
