module.exports = {
  BadRequest: function(msg) {
    this.status = 400;
    this.message = msg || 'Bad request';
    Error.call(this, this.message);
    Error.captureStackTrace(this, arguments.callee);
  },
  Unauthorized: function(msg) {
    this.status = 401;
    this.message = msg || 'Unauthorized';
    Error.call(this, this.message);
    Error.captureStackTrace(this, arguments.callee);
  },
  Forbidden: function(msg) {
    this.status = 403;
    this.message = msg || 'Forbidden';
    Error.call(this, this.message);
    Error.captureStackTrace(this, arguments.callee);
  },
  NotFound: function(msg) {
    this.status = 404;
    this.message = msg || 'Not found';
    Error.call(this, this.message);
    Error.captureStackTrace(this, arguments.callee);
  }
};
