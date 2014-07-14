module.exports = (grunt) ->
  pkg:            grunt.file.readJSON 'package.json'
  clean:          require './clean'
  bowercopy:      require './bowercopy'
  'sails-linker': require './sailslinker'
  coffeelint:     require './coffeelint'
  jshint:         require './jshint'
  less:           require './less'
  copy:           require './copy'
  usemin:         require './usemin'
  useminPrepare:  require './useminprepare'
  mochaTest:      require './mocha'

