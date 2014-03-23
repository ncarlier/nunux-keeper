module.exports = {
  compile: {
    options: {
      paths: ['client/stylesheets'],
      cleancss: true
    },
    files: {
      'dist/stylesheets/style.css': 'client/stylesheets/style.less',
      'dist/stylesheets/welcome.css': 'client/stylesheets/welcome.less',
      'dist/stylesheets/public.css': 'client/stylesheets/public.less',
      'dist/stylesheets/oauth.css': 'client/stylesheets/oauth.less',
      'dist/stylesheets/bookmarklet.css': 'client/stylesheets/bookmarklet.less'
    }
  }
};
