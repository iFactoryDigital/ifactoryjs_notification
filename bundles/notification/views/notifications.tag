<notifications>
  <ul class="nav navbar-nav navbar-right">
    <li class="nav-item dropdown">
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
                  <div class="text-overflow d-flex justify-content-between">
                    <b>{ notification.title }</b>
                    <small>
                      { getDate(notification.created_at) }
                    </small>
                  </div>
                  <p class="mb-0">{ notification.body }</p>
                </div>
              </div>
            </a>
          </div>
          <div class="card-footer text-center">
            SUPPPP
          </div>
        </div>
      </div>
    </li>
  </ul>
  
  <script>
    // set notifications
    this.notifications = this.eden.get('notifications') || [];
    
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
        this.notifications.unshift(notification);
        
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
    });
    
  </script>
</notifications>
