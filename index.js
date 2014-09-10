
/**
 * Module dependencies
 */

var Strategy = require('sauth/strategy')
  , qs = require('querystring')
  , url = require('url')
  , http = require('http')
  , exec = require('child_process').exec
  , google = require('googleapis')
  , OAuth2 = google.auth.OAuth2

/**
 * Youtube OAuth API endpoint
 */

var OAUTH_API_ENDPOINT = '';

/**
 * Initializes the youtube strategy
 *
 * @api public
 * @param {Object} opts
 * @param {Function} done
 */

module.exports = function (opts, done) {
  return YoutubeStrategy(opts).run(done);
};

/**
 * `YoutubeStrategy' constructor
 *
 * @api public
 * @param {Object} opts
 */

module.exports.Strategy = YoutubeStrategy;
function YoutubeStrategy (opts) {
  if (!(this instanceof YoutubeStrategy)) {
    return new YoutubeStrategy(opts);
  }

  Strategy.call(this, 'youtube');

  this.clientId = opts['client-id'] || opts.clientId || opts.client_id;
  this.clientSecret = opts['client-secret'] || opts.clientSecret || opts.client_secret;
  this.oob = Boolean(opts.oob || opts['out-of-bounds'] || opts['out_of_bounds']);
  this.port = opts.port || opts.p;
  this.verifier = null;
  this.oauth = {};

  if (!Boolean(this.port)) {
    port = 9999
  }
}

// inherit `Strategy'
YoutubeStrategy.prototype = Object.create(Strategy.prototype, {
  constructor: {value: YoutubeStrategy}
});

// implements `_setup'
YoutubeStrategy.prototype._setup = function (done) {
  this.oauth = new OAuth2(this.clientId,
                          this.clientSecret,
                          'http://localhost:'+ this.port);
  done();
};

// implements `_auth'
YoutubeStrategy.prototype._auth = function (done) {
  var self = this;
  var oauth = this.oauth;
  var scopes = ['https://www.googleapis.com/auth/youtube'];
  var uri = oauth.generateAuthUrl({access_type: 'offline', scope: scopes});
  var server = http.createServer(onrequest);
  var sockets = [];
  this._open(uri.trim(), function (err) {
    if (err) { return done(err); }
    server.listen(self.port);
  });

  server.on('connection', function (socket) {
    sockets.push(socket);
    socket.setTimeout(1000);
  });

  function onrequest (req, res) {
    self.code = qs.parse(url.parse(req.url).query).code;
    res.setHeader('Connection', 'close');
    res.write('<script> window.close(); window.open(location, "_self").close(); </script>');
    res.end();
    sockets.forEach(function (socket) { socket.destroy(); });
    server.close(done);
  }
};

YoutubeStrategy.prototype._open = function (uri, done) {
  exec("open '"+ uri +"'", function (err) {
    if (err) { return done(err); }
    done();
  });
};

// implements `_access'
YoutubeStrategy.prototype._access = function (done) {
  var self = this;
  var oauth = this.oauth;
  oauth.getToken(this.code, function (err, tokens) {
    if (err) { return done(err); }
    self.set(tokens);
    done();
  });
};

// implements `_end'
YoutubeStrategy.prototype._end = function (done) {
  console.log(this.data)
  done();
};

