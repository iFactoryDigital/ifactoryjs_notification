<notification-admin-page>
  <div class="page page-fundraiser">

    <admin-header title="Manage Notifications">
      <yield to="right">
        <a href="/admin/config/notification/create" class="btn btn-lg btn-success">
          <i class="fa fa-plus ml-2"></i> Create Notification
        </a>
      </yield>
    </admin-header>
    
    <div class="container-fluid">
    
      <grid ref="grid" grid={ opts.grid } table-class="table table-striped table-bordered" title="Notification Grid" />
    
    </div>
  </div>
</notification-admin-page>
