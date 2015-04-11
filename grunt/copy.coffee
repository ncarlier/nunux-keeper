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
        'images/**'
        'templates/**'
        'views/**'
        '*.js'
        'lib/ckeditor/**'
      ]
      dest: 'dist/'
    }]
