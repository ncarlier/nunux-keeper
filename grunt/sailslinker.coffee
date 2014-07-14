module.exports =
  js:
    options:
      startTag: '<!-- include:js -->'
      endTag:   '<!-- endinclude:js -->'
      fileTmpl: '<script src="%s"></script>'
      appRoot: 'client/'
    files:
      'client/html/index.html': ['client/lib/*/*.js']
  css:
    options:
      startTag: '<!-- include:css -->'
      endTag:   '<!-- endinclude:css -->'
      fileTmpl: '<link rel="stylesheet" href="%s" />'
      appRoot: 'client/'
    files:
      'client/html/index.html': ['client/lib/*/*.css']
