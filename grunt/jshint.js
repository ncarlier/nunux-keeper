module.exports = {
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
};
