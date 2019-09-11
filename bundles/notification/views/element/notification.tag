<element-notification>
  <span each={ item, i in this.notifications }>
    <a href="/admin/config/notification/{ item.id }/update">{ item.name }</a>
    { i === this.notifications.length - 1 ? '' : ', ' }
  </span>

  <script>
    // set notifications
    this.notifications = (Array.isArray(opts.data.value) ? opts.data.value : [opts.data.value]).filter(v => v);

  </script>
</element-notification>
