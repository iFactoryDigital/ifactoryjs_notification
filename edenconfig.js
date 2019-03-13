// create config object
const config = {};

// default company config
config.notification = {
  fields : [
    {
      name  : 'user',
      grid  : true,
      type  : 'admin.user',
      label : 'User',
    },
    {
      name  : 'image',
      type  : 'image',
      label : 'Image',
    },
    {
      name  : 'url',
      grid  : true,
      type  : 'text',
      label : 'URL',
    },
    {
      name  : 'title',
      grid  : true,
      type  : 'text',
      label : 'Title',
    },
    {
      name  : 'body',
      grid  : true,
      type  : 'text',
      label : 'Body',
    },
  ],
};

// export config
module.exports = config;
