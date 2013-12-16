module.exports = function(grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
        },
        src: ['tests/**/*.js']
      }
    },
    jshint: {
      backend: ['app.js', 'api/*.js', 'controllers/*.js', 'helpers/*.js', 'models/*.js', 'routes/*.js', 'security/*.js'],
      frontend: {
        options: {
          globalstrict: true,
          browser: true,
          globals: {
            '$': false,
            console: false,
            angular: false,
            moment: false,
            alert: false,
            confirm: false,
            humane: false,
            qrcode: false,
            Mousetrap: false
          }
        },
        src: ['public/javascripts/**/*.js']
      }
    },
    clean: ["public-build"]
  });

  // Register building task
  grunt.registerTask('build', []);
  grunt.registerTask('install', ['clean','build']);
  grunt.registerTask('test', 'mochaTest');
  grunt.registerTask('default', 'mochaTest');
}
