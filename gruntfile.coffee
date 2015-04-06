# Build configuration.
module.exports = (grunt) ->
  # Load all grunt tasks.
  require('load-grunt-tasks')(grunt)

  # Load grunt configurations
  conf = require('./grunt')(grunt)
  grunt.initConfig conf

  # Register tasks...

  grunt.registerTask 'test', '*Lint* files and run tests.', [
    'coffeelint'
    'jshint'
    'mochaTest:test'
  ]

  grunt.registerTask 'coverage', 'Run tests coverage.', [
    'mochaTest'
  ]

  grunt.registerTask 'dist', 'Save presentation files to *dist* directory.', [
    'clean:dist'
    'less'
    'useminPrepare'
    'concat'
    'uglify'
    'cssmin'
    'copy'
    'usemin'
    'apidoc'
  ]

  grunt.registerTask 'dep', 'Get dependencies with Bower.', [
    'clean:dep'
    'bowercopy'
    'sails-linker'
  ]

  # Define default task.
  grunt.registerTask 'default', [
    'test'
  ]

