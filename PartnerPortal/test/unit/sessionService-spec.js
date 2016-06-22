/**
 * Created by jamesonnyeholt2 on 10/28/14.
 */

'use strict';

describe('Service Module', function () {

    var localStorageService;

    describe('SessionService', function() {
        var $httpBackend,
            $timeout,
            localStorageService,
            sessionService;

        beforeEach(function () {
            angular.mock.module('dealerportal.service', function($provide) {
                localStorageService = jasmine.createSpyObj('localStorageService', ['get', 'add', 'remove']);
                $provide.value('localStorageService', localStorageService);
                $provide.value('$state', {});
                $provide.value('apiUrl', function (path) { return 'http://server:80' + path; });
            });
            inject(function(_$httpBackend_, _localStorageService_, _$timeout_, _sessionService_) {
                $httpBackend = _$httpBackend_;
                sessionService = _sessionService_;
                localStorageService = _localStorageService_;
                $timeout = _$timeout_;
            });
        });

        describe('when initialized', function() {

            var session = {id: 'session_token', userId: 'user_id', IsStubLogin: true };

            beforeEach(function() {
                $httpBackend.when('POST', 'http://server:80/login')
                    .respond(session);
                var currentTime = moment();
                localStorageService.get(currentTime);
            });

            it('isAuthenticated returns a rejected promise', function() {
                var rejected = false;
                sessionService.isAuthenticated().catch(function() {
                    rejected = true;
                });
                $timeout.flush();
                expect(rejected).toBe(false);
            });
        });

        describe('when a user logs in', function() {
            var session = {id: 'session_token', userId: 'user_id', IsStubLogin: true };

            beforeEach(function() {
                $httpBackend.when('POST', 'http://server:80/login')
                    .respond(session);
                sessionService.login('username', 'password');
				debugger;
                $httpBackend.flush();
                var currentTime = moment();
                localStorageService.get(currentTime);
            });

            it('isAuthenticated returns a resolved promise', function() {
                var resolved = false;
                sessionService.isAuthenticated().then(function() {
                    resolved = true;
                });
                $timeout.flush();
                expect(resolved).toBe(true);
            });
        });

        describe('when a logged in user logs out', function() {
            var session = { userId: 'user_id', id: 'session_token', IsStubLogin: true };
            beforeEach(function() {
                $httpBackend.when('POST', 'http://server:80/login')
                    .respond(session);
                sessionService.login('username', 'password');
                $httpBackend.flush();
                sessionService.logout();
            });

            it('isAuthenticated returns a rejected promise', function() {
                var rejected = false;
                sessionService.isAuthenticated().catch(function() {
                    rejected = true;
                });
                $timeout.flush();
                expect(rejected).toBe(true);
            });

            it('the userId is not loaded', function() {
                expect(sessionService.userId).toBe(null);
            });

            it('the sessionToken is not loaded', function() {
                expect(sessionService.sessionToken).toBe(null);
            });

        });
    });
});
