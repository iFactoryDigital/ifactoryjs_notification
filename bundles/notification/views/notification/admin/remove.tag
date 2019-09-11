<notification-admin-remove-page>
  <div class="page page-shop">

    <admin-header title="Remove Notification">
      <yield to="right">
        <a href="/admin/config/notification" class="btn btn-lg btn-primary">
          Back
        </a>
      </yield>
    </admin-header>

    <div class="container-fluid">

      <form method="post" action="/admin/config/notification/{ opts.item.id }/remove">
        <div class="card mb-3">
          <div class="card-body">
            <p>
              Are you sure you want to delete this Notification?
            </p>
          </div>
        </div>
        <button type="submit" class="btn btn-lg btn-success">Remove Notification</button>
      </form>

    </div>
  </div>
  
  <script>
    // do mixins
    this.mixin('i18n');

    // load data
    this.language = this.i18n.lang();

  </script>
</notification-admin-remove-page>
