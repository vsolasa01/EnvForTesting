'use strict';
describe('LoginCtrl', function () {

    var LoginController,
        scope,
        state,
        sessionService,
        loginResponse,
        usSpinnerService,
        localStorageService;

    describe('with a valid username and password', function() {
        beforeEach(function() {
            angular.mock.module('dealerportal.login', function ($provide) {
                sessionService = jasmine.createSpyObj('sessionService', [ 'login', 'setSessionTimeout']);
                state = jasmine.createSpyObj('$state', ['go']);
                usSpinnerService = jasmine.createSpyObj('usSpinnerService', ['stop', 'spin']);
                localStorageService = jasmine.createSpyObj('localStorageService', [ 'add', 'get', 'remove' ]);
                $provide.value('sessionService', sessionService);
                $provide.value('$state', state);
                $provide.value('usSpinnerService', usSpinnerService);
                $provide.value('localStorageService', localStorageService);
		
            });
            inject(function($rootScope, $controller, $q) {
                loginResponse = $q.defer();
                sessionService.login.and.returnValue(loginResponse.promise);
                scope = $rootScope.$new();
                LoginController = $controller('LoginCtrl as login', { $scope: scope });
            });
        });

        it('should redirect to home when landing succeeds.', inject(function($timeout) {
            scope.login.login('existingUser', 'password');
            loginResponse.resolve({ IsStubLogin: true });
            $timeout.flush();
			debugger;
			alert("#########################################");
            expect(state.go).toHaveBeenCalledWith('landing');
            expect(scope.login.isLoggingIn).toBe(false);
        }));
    });

    describe('with an invalid username or password', function() {
        beforeEach(function() {
            angular.mock.module('dealerportal.app', function ($provide) {
                sessionService = jasmine.createSpyObj('sessionService', [ 'login', 'setSessionTimeout']);
                state = jasmine.createSpyObj('$state', ['go']);
                usSpinnerService = jasmine.createSpyObj('usSpinnerService', ['stop', 'spin']);
                localStorageService = jasmine.createSpyObj('localStorageService', [ 'add', 'get', 'remove' ]);
                $provide.value('sessionService', sessionService);
                $provide.value('$state', state);
                $provide.value('usSpinnerService', usSpinnerService);
                $provide.value('localStorageService', localStorageService);
            });
            inject(function($rootScope, $controller, $q) {
                loginResponse = $q.defer();
                sessionService.login.and.returnValue(loginResponse.promise);
                scope = $rootScope.$new();
                LoginController = $controller('LoginCtrl as login', { $scope: scope });
            });
        });
        it('should show a failure message when login fails.', inject(function($timeout) {
            scope.login.username = 'existingUser123';
            scope.login.password = 'password';
            scope.login.login(scope.login.username, scope.login.password);
            loginResponse.reject();
            $timeout.flush();
	        debugger;
            expect(scope.login.isLoggingIn).toBe(false);
            expect(scope.login.loginFailed).toBe(true);
        }));
    });

});
