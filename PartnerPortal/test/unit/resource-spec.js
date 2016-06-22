'use strict';
describe('resource module', function () {
  var $window = {};

  beforeEach(angular.mock.module('dealerportal.resource', function ($provide) {
    $provide.value('$window', $window);
  }));

  describe('apiUrl', function () {
    describe('when the window location is simple', function () {
      beforeEach(function () {
        $window.location = {
          protocol: 'http:',
          host: 'foo.com:80',
          search: ''
        };
      });

      it('creates a url from the window base', inject(function (apiUrl) {
        expect(apiUrl('')).toBe('http://foo.com:80/api');
      }));

      it('creates a url with provided path', inject(function (apiUrl) {
        expect(apiUrl('/somepath')).toBe('http://foo.com:80/api/somepath');
      }));
    });

    describe('when the window location contains a stub query param', function() {
      beforeEach(function () {
        $window.location = {
          protocol: 'http:',
          host: 'foo.com:80',
          search: '?stub=somestub&foo=bar'
        };
      });
      it('creates a url passing through the stub query parameter', inject(function (apiUrl) {
        expect(apiUrl('/somepath')).toBe('http://foo.com:80/api/somepath?stub=somestub');
      }));
    });

    describe('when the window location has a query with no stub param', function() {
      beforeEach(function () {
        $window.location = {
          protocol: 'http:',
          host: 'foo.com:80',
          search: '?foo=bar'
        };
      });
      it('creates a url passing through the stub query parameter', inject(function (apiUrl) {
        expect(apiUrl('/somepath')).toBe('http://foo.com:80/api/somepath');
      }));
    });
  });
});
