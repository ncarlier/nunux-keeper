module.exports =
  dist:
    files: [{
      expand: true
      cwd: 'client'
      src: [
        'robots.txt'
        'filters.svg'
        'fonts/**'
        'icons/**'
        'templates/**'
        'html/**'
        '*.js'
        'lib/ckeditor/**'
      ]
      dest: 'dist/'
    }]
