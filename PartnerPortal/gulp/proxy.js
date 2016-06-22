/* jshint node:true */
'use strict';
var httpProxy = require('http-proxy'),
  chalk = require('chalk'),
  _ = require('lodash'),
  urlUtil = require('url'),
  fs = require('fs'),
  https = require('https'),
  proxy = httpProxy.createProxyServer({
    target: {
        host: 'sunedison-dev.cloudhub.io',
        port:  443
    },
    agent: https.globalAgent,
    headers: {
      host: 'sunedison-dev.cloudhub.io:443'
    }
  });

proxy.on('error', function(error, req, res) {
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });

  console.error(chalk.red('[Proxy]'), error);
});

function StubServer(stubName) {
  this.basedir = './stub/' + stubName;
  this.errors = {
    AUTH_FAILED: {
      errorCode: 'E0000004',
      errorSummary: 'Authentication failed',
      errorLink: 'E0000004',
      errorId: 'oaeh-0uSCfPQ_2N90yqrsZicA',
      errorCauses: []
    },
    RESOURCE_NOT_FOUND: {
      errorCode: 'PLACEHOLDER_001',
      errorSummary: 'The resource was not found in the stub dir. You may need to create it.',
      errorLink: 'PLACEHOLDER_001',
      errorId: 'X001',
      errorCauses: []
    },
    FAILED_CREATE: {
      errorCode: 'PLACEHOLDER_002',
      errorSummary: 'Could not create the resource and I don\'t know why!',
      errorLink: 'PLACEHOLDER_002',
      errorId: 'X002',
      errorCauses: []
    },
    FAILED_UPDATE: {
      errorCode: 'PLACEHOLDER_003',
      errorSummary: 'Could not update the resource and I don\'t know why!',
      errorLink: 'PLACEHOLDER_003',
      errorId: 'X002',
      errorCauses: []
    }
  };
}

/**
 * Allows a simple layer of processing if required. Every other general data resource will user the various
 * resource calls.
 */
StubServer.prototype = {
  /**
   * Logs in using the list of possible users. The response is crafted based on records that are combinations of
   * the input and output requirements, matches omit the user/pass pair. If user is not found for a username/password
   * a suitable error is given. The errors are not present in fixture data.
   * @param username The user to log in as.
   * @param password The password.
   * @return {*}
   */
  login: function (username, password) {
    var content;
    try {
      username = username || 'NONE';
      password = password || 'NONE';
      // Weird nuance of require that the CWD is based on where the script is, not the CWD of the fs module.
      content = require('.' +this.basedir + '/api/login/' + username + '+' + password + '.js');
      if (content) {
          content.IsStubLogin = true;
      }
      return content;
    } catch (e) {
      throw this.errors.AUTH_FAILED;
    }
  },

  /**
   * Gets the appropriate resource.
   * @param path The path to the resource.
   */
  getResource: function(path) {
    // Quacks like a numeric id...
    if (/\/[0-9]{5,6}$/.test(path)) {
      try {
        // Weird nuance of require that the CWD is based on where the script is, not the CWD of the fs module.
        return require('.' + this.basedir + path + '.js');
      } catch (e) {
        console.error(e);
        throw this.errors.RESOURCE_NOT_FOUND;
      }
    } else {
      return this.getResourceList(path);
    }
  },

  /**
   * Gets a list of the resources at the path.
   * @param path The path to the resource.
   */
  getResourceList: function(path) {
    try {
      return _.map(fs.readdirSync(this.basedir + path), function (file) {
        return this.getResource(path + '/' + file.substring(0, file.length - 3));
      }, this);
    } catch (e) {
      console.error(e);
      return this.errors.RESOURCE_NOT_FOUND;
    }

  },

  postResource: function(path, data) {
    try {
      var id = _(fs.readdirSync(this.basedir + path)).map(function (filename) {
          return _.parseInt(filename.substring(0, filename.length - 3));
        }).max() + 1,
        file = this.basedir + path + '/' + id + '.js',
        fileData = '/*jshint node:true*/\nmodule.exports = ' + JSON.stringify(data, null, 2) + ';';
      fs.writeFileSync(file, fileData);
      return { id: id };
    } catch (e) {
      console.error(e);
      return this.errors.FAILED_CREATE;
    }
  },

  putResource: function(path, data) {
    try {
      var file = this.basedir + path + '.js',
        fileData = '/*jshint node:true*/\nmodule.exports = ' + JSON.stringify(data, null, 2) + ';';
      fs.writeFileSync(file, fileData);
      return {};
    } catch (e) {
      console.error(e);
      return this.errors.FAILED_UPDATE;
    }
  }
};

/**
 * Handles all the http connection handling. The work is done via the callback which expects a json body as the single
 * parameter and should return a JSON serializable object.
 */
function wrapStubForHttp(request, response, fn) {
  var data = '';
  request.on('data', function (chunk) {
    data += chunk;
  }).on('end', function() {
    data = data ? JSON.parse(data) : undefined;
    var body;
    try {
      body = JSON.stringify(fn(data));
      response.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'application/json' });
    } catch (e) {
      body = JSON.stringify(e);
      response.writeHead(401, {
        'Content-Length': body.length,
        'Content-Type': 'application/json' });
    }
    response.write(body);
    response.end();
  });

}
/*
 * The proxy middleware is an Express middleware added to BrowserSync to
 * handle backend request and proxy them to your backend.
 */
function proxyMiddleware(request, response, next) {
  var url = urlUtil.parse(request.url, true);
  if (url.pathname === '/' || url.pathname.match(/\.(html|css|js|png|jpg|jpeg|gif|ico|xml|rss|txt|eot|svg|ttf|woff|cur)$/)) {
    next();
  } else if (url.query.stub) {
    var stub = new StubServer(url.query.stub),
      resource = url.pathname;
    if (resource === '/api/login') {
      wrapStubForHttp(request, response, function (data) { return stub.login(data.username, data.password); });
    } else if (request.method === 'POST') {
      wrapStubForHttp(request, response, function (data) { return stub.postResource(resource, data); });
    } else if (request.method === 'PUT') {
      return wrapStubForHttp(request, response, function(data) { return stub.putResource(resource, data); });
    } else if (request.method === 'GET') {
      wrapStubForHttp(request, response, function () { return stub.getResource(resource); });
    }
  } else {
    proxy.web(request, response);
  }
}

/*
 * This is where you activate or not your proxy.
 *
 * The first line activate if and the second one ignored it
 */

module.exports = [proxyMiddleware];
