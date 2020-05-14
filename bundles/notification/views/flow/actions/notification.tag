<flow-action-notification>
  <div class="card card-flowing card-{ opts.element.color || 'primary' } mb-3 { opts.elementClass }">
    <div class="card-header">
      <div class="card-icon">
        <i class={ opts.element.icon } />
      </div>

      { opts.element.title }

    </div>
    <div class="card-body">
      <div class="form-group">
        <label>
          Notification Title
        </label>
        <input class="form-control" ref="title" value={ (opts.element.config || {}).title } type="text" onchange={ onChange } />
      </div>
      <div class="form-group">
        <label>
          Notification Url
        </label>
        <input class="form-control" ref="url" value={ (opts.element.config || {}).url } type="text" onchange={ onChange } />
      </div>
      <div class="form-group">
        <label>
          Notification Body
        </label>
        <input class="form-control" ref="body" value={ (opts.element.config || {}).body } type="text" onchange={ onChange } />
      </div>

      <label class="mt-3">
        Send Notification to Users where:
      </label>

      <div class="form-group mb-4">
        <div class="row mb-2">
          <div class="col-1 pr-0">
            Admin
          </div>
          <div class="col-2 pr-0">
            <select class="form-control bg-light" ref="isadmin" value={ (opts.element.config || {}).isadmin } onchange={ onChange }>
              <option value="yes" selected={ (opts.element.config || {}).isadmin === 'yes' }>Yes</option>
              <option value="no" selected={ (opts.element.config || {}).isadmin === 'no' }>No</option>
            </select>
          </div>
          <div class="col-5 pr-0">
            Only Send Notification Once ? 
          </div>
          <div class="col-2 pr-0">
            <select class="form-control bg-light" ref="sendonce" value={ (opts.element.config || {}).sendonce } onchange={ onChange }>
              <option value="yes" selected={ (opts.element.config || {}).sendonce === 'yes' }>Yes</option>
              <option value="no" selected={ (opts.element.config || {}).sendonce === 'no' }>No</option>
            </select>
            </div>
          </div>
      </div>

      <div class="form-group mb-4">
        <div class="row mb-2">
          <div class="col-2 pr-0">
            Model Name
          </div>
          <div class="col-3 pr-0">
            <input class="form-control bg-light" ref="from" value={ (opts.element.config || {}).from } type="text" onchange={ onChange } placeholder="From" />
          </div>
          <div class="col-2 pr-0">
            User Model
          </div>
          <div class="col-3 pr-0">
            <input class="form-control bg-light" ref="in" value={ (opts.element.config || {}).in } type="text" onchange={ onChange } placeholder="in" />
          </div>
        </div>
      </div>

      <div class="key-value mt-2">
        <div class="row mb-2" each={ set, i in (opts.element.config || {}).queries || [] }>
          <div class="col-3 pr-0">
            <input class="form-control bg-light" ref="key" value={ set.key } type="text" onchange={ onQueryChange } placeholder="Key" />
          </div>
          <div class="col-2 pr-0">
            <select class="form-control bg-light" ref="method" value={ set.method } onchange={ onQueryChange }>
              <option value="eq">==</option>
              <option value="ne">!=</option>
              <option value="gt">&gt;</option>
              <option value="lt">&lt;</option>
              <option value="id">ID</option>
            </select>
          </div>
          <div class="col-5 pr-0">
            <div class="input-group">
              <div class="input-group-prepend">
                <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  { capitalize(set.type || 'text') }
                </button>
                <div class="dropdown-menu">
                  <button class="dropdown-item" onclick={ onType } data-type="text">Text</button>
                  <button class="dropdown-item" onclick={ onType } data-type="number">Number</button>
                  <button class="dropdown-item" onclick={ onType } data-type="boolean">Boolean</button>
                </div>
              </div>
              <input class="form-control bg-light" ref="value" value={ set.value } type="text" onchange={ onQueryChange } placeholder="Value" />
            </div>
          </div>
          <div class="col-2">
            <button class="btn btn-block btn-danger" onclick={ onRemoveQuery }>
              <i class="fa fa-times" />
            </button>
          </div>
        </div>

        <div class="row">
          <div class="ml-auto col-2">
            <button class="btn btn-block btn-success" onclick={ onAddQuery }>
              <i class="fa fa-plus" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    /**
     * capitilize string
     */
    capitalize(s) {
      // check typeof
      if (typeof s !== 'string') return '';

      // return uppercase
      return s.charAt(0).toUpperCase() + s.slice(1);
    }

    /**
     * on change timing
     *
     * @param {Event} e
     */
    onAddQuery(e) {
      // prevent
      e.preventDefault();
      e.stopPropagation();

      // set values
      if (!opts.element.config) opts.element.config = {};
      if (!opts.element.config.queries) opts.element.config.queries = [];

      // push
      opts.element.config.queries.push({});

      // set element
      opts.setElement(opts.element.uuid, {
        config : opts.element.config,
      });

      // update
      this.update();
    }

    /**
     * on remove set
     *
     * @param {Event} e
     */
    onRemoveQuery(e) {
      // prevent
      e.preventDefault();
      e.stopPropagation();

      // splice out
      opts.element.config.queries.splice(e.item.i, 1);

      // set element
      opts.setElement(opts.element.uuid, {
        config : opts.element.config,
      });

      // update
      this.update();
    }

    /**
     * on remove set
     *
     * @param {Event} e
     */
    onType(e) {
      // set value
      opts.element.config.queries[e.item.i].type = jQuery(e.target).attr('data-type');

      // set element
      opts.setElement(opts.element.uuid, {
        config : opts.element.config,
      });

      // update
      this.update();
    }

    /**
     * on remove set
     *
     * @param {Event} e
     */
    onCount(e) {
      // set value
      opts.element.config.count = parseInt(jQuery(e.target).val());

      // set element
      opts.setElement(opts.element.uuid, {
        config : opts.element.config,
      });

      // update
      this.update();
    }

    /**
     * on change timing
     *
     * @param {Event} e
     */
    onChange(e) {
      // set config
      if (!opts.element.config) opts.element.config = {};

      // config
      opts.element.config.url      = this.refs.url.value;
      opts.element.config.body     = this.refs.body.value;
      opts.element.config.title    = this.refs.title.value;
      opts.element.config.isadmin  = this.refs.isadmin.value;
      opts.element.config.from     = this.refs.from.value;
      opts.element.config.in       = this.refs.in.value;
      opts.element.config.sendonce = this.refs.sendonce.value;

      // set element
      opts.setElement(opts.element.uuid, {
        config : opts.element.config,
      });
    }

    /**
     * on remove set
     *
     * @param {Event} e
     */
    onQueryChange(e) {
      // set value
      opts.element.config.queries[e.item.i][jQuery(e.target).attr('ref')] = e.target.value;

      // set element
      opts.setElement(opts.element.uuid, {
        config : opts.element.config,
      });

      // update
      this.update();
    }

  </script>
</flow-action-notification>