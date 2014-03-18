module.exports = {
  options: {
    separator: ';',
    banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
  },
  dist: {
    src: [
      'client/lib/jquery/jquery.min.js',
      'client/lib/lodash/lodash.min.js',
      'client/lib/moment/moment.min.js',
      'client/lib/humane-js/humane.min.js',
      'client/lib/mousetrap/mousetrap.min.js',
      'client/lib/angular/angular.min.js',
      'client/lib/angular-ui-bootstrap-bower/ui-bootstrap-tpls.min.js',
      'client/lib/angular-sanitize/angular-sanitize.min.js',
      'client/lib/angular-route/angular-route.min.js',
      'client/lib/angular-md5/angular-md5.min.js',
      'client/lib/ng-file-upload/angular-file-upload.min.js',

      'dist/javascripts/app.js',
      'dist/javascripts/**/*.js'
    ],
    dest: 'dist/javascripts/keeper.min.js'
  },
  bookmarklet: {
    src: [
      'client/lib/jquery/jquery.min.js',
      'client/lib/lodash/lodash.min.js',
      'client/lib/angular/angular.min.js',
      'client/lib/ng-file-upload/angular-file-upload.min.js',
      'dist/javascripts/app-bm.js',
      'dist/javascripts/services/*.js'
    ],
    dest: 'dist/javascripts/keeper-bm.min.js'
  }

};
