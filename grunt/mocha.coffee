module.exports =
  test:
    options:
      reporter: 'spec'
      require: 'server/tests/common/coverage'
    src: ['server/tests/**/*.test.js']
  reports:
    options:
      reporter: 'html-cov'
      quiet: true
      captureFile: 'dist/reports/coverage.html'
    src: ['server/tests/**/*.test.js']
