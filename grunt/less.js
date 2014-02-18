module.exports = {
  compile: {
    options: {
      paths: ['client/stylesheets'],
      cleancss: true
    },
    files: {
      'build/stylesheets/style.css': 'client/stylesheets/style.less',
      'build/stylesheets/welcome.css': 'client/stylesheets/welcome.less'
    }
  }
};
