<notification-page>
  <div class="container my-4">
    <a each={ notification, i in opts.notifications } href={ notification.url } class="list-group-item list-group-item-action">
      <div class="row">
        <div class="col-1 pr-0">
          <media-img image={ getImage(notification) } label="2x-sq" class="rounded-circle img-fluid" />
        </div>
        <div class="col-11">
          <div>
            <small class="float-right">
              { getDate(notification.created_at) }
            </small>
            <b class="d-block text-overflow">{ notification.title }</b>
          </div>
          <p class="mb-0">{ notification.body }</p>
        </div>
      </div>
    </a>
  </div>

  <script>
  
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
  
  </script>
</notification-page>
