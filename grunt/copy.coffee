module.exports =
  dist:
    files: [{
      expand: true
      cwd: 'client'
      src: [
        'robots.txt'
        'fonts/**'
        'icons/**'
        'templates/**'
        'html/**'
        '*.js'
        'lib/ckeditor/**'
      ]
      dest: 'dist/'
    }]
