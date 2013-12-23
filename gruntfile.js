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
        src: ['server/tests/**/*.js']
      }
    },
    jshint: {
      backend: ['server/app.js', 'server/**/*.js'],
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
        src: ['client/javascripts/**/*.js']
      }
    },
    clean: ["build"]
  });

  // Register building task
  grunt.registerTask('build', []);
  grunt.registerTask('install', ['clean','build']);
  grunt.registerTask('test', 'mochaTest');
  grunt.registerTask('default', 'mochaTest');
}
