(function () {
    'use strict';
    function versionService() {
        /* jshint validthis:true */
        var self = this;

        function version() {
            // This is filled out with the real version info by the build.
            return {major: 0, minor: 0, patch: 0, build: 0, sha: 'ffffff', dirty: true}; // VERSION
        }

        self.version = version;
    }

    function sessionService($q, $log, $http, $state, $timeout, $window, $location, localStorageService, snapflowConstant, Login, managedModal, geoCodeService) {
        /* jshint validthis:true */
        var self = this,
            authenticationDeferred = null;

        self.sessionToken = localStorageService.get('se-sessionToken');
        self.userId = localStorageService.get('se-userId');
        self.user = localStorageService.get('se-user');
        self.sessionTimeStamp = localStorageService.get('se-timestamp');

        if (self.sessionToken !== null && self.userId !== null && self.user !== null && self.sessionTimeStamp !== null) {
            authenticationDeferred = $q.defer();
            $http.defaults.headers.common['x-okta-session-id'] = self.sessionToken;
            authenticationDeferred.resolve();
        }

        function sessionHasExpired() {
            var expiryTime,
                loginTimeStamp,
                currentTime,
                diff;

            loginTimeStamp = localStorageService.get('se-timestamp');
            if (loginTimeStamp === null) {
                return false;
            }

            expiryTime = moment(loginTimeStamp.timeStamp).add(120, 'minutes');
            currentTime = moment();
            diff = currentTime.diff(expiryTime, 'minutes', true);

            if (diff && diff > 0) {
                $log.warn('Your session has expired.  Returning you to the login page.');
                return true;
            }
            return false;
        }

        function isAuthenticated() {
            var deferred = $q.defer();
            if (authenticationDeferred === null) {
                deferred.reject(snapflowConstant.ERROR.REQUIRES_AUTHENTICATION);
            } else {
                authenticationDeferred.promise.then(function () {
                    if (sessionHasExpired()) {
                        deferred.reject(snapflowConstant.ERROR.REQUIRES_AUTHENTICATION);
                    } else {
                        deferred.resolve(true);
                    }
                }, function () {
                    deferred.reject(snapflowConstant.ERROR.REQUIRES_AUTHENTICATION);
                });
            }

            return deferred.promise;
        }

        function login(credentials) {

            authenticationDeferred = $q.defer();

            Login.login({
                username: credentials.username,
                password: credentials.password
            }).$promise
                .then(function (data) {
                    self.user = data;
                    localStorageService.add('roles', data.profile.Role);
                    var temp = null;
                    if(data.profile.Role && data.profile.Role !== null && typeof data.profile.Role !== 'undefined'){
                        temp = data.profile.Role.split(',');                    
                        if(temp !== null && temp!== '' && temp.length === 0){
                            localStorageService.add('userCurrentRole', data.profile.Role);
                        }else{
                            if(data.profile.Role.split(',')[0] === 'SalesPerson'){
                                localStorageService.add('userCurrentRole', 'SalesPerson');
                            }else if(data.profile.Role.split(',')[0] === 'OlympusManager'){
                                localStorageService.add('userCurrentRole', 'OlympusManager');
                            }else{
                                localStorageService.add('userCurrentRole', 'PartnerAdmin');
                            }
                        }
                    }
                    if(localStorageService.get('userCurrentRole') === null || localStorageService.get('userCurrentRole') === '' || typeof localStorageService.get('userCurrentRole') === 'undefined'){
                        localStorageService.add('userCurrentRole', 'PartnerAdmin');
                    }
                    /*if(data.profile.Role.split(',')[0] === 'PartnerAdmin'){
                        localStorageService.add('userCurrentRole', 'PartnerAdmin');
                    }else{
                        localStorageService.add('userCurrentRole', 'SalesPerson');
                    }*/
                    localStorageService.add('pageInfo', {});
                    var tempPageInfo = localStorageService.get('pageInfo');
                    tempPageInfo.forceReload = true;
                    tempPageInfo.pageDetails = {};
                    tempPageInfo.pageDetails['1'] = '';
                    tempPageInfo.lastPageNo = 1;
                    tempPageInfo.currentPageNo = 1;
                    tempPageInfo.nextPageExists = true;
                    localStorageService.add('pageInfo', tempPageInfo);
                    
                    if (!data.id) {
                        throw 'Missing id field from login response';
                    }
                    if (!data.userId) {
                        throw 'Missing userId field from login response';
                    }

                    localStorageService.add('se-role', data.profile.Role);
                    localStorageService.add('se-sessionToken', data.id);
                    localStorageService.add('se-userId', data.userId);
                    localStorageService.add('se-user', data);
                    $http.defaults.headers.common['x-okta-session-id'] = data.id;
                    var currentTime = moment();
                    localStorageService.add('se-timestamp', {timeStamp: currentTime._d});
                    

                    // Only redirect through okta when dealing with a real okta-backed login
                    if (!data.IsStubLogin) {
                        // Okta redirect to be done through a relative path through a proxy later
                        if($location.host() === 'partner.sunedison.com'){
                            $window.location.replace('https://sune.okta.com/login/sessionCookieRedirect?token=' + data.cookieToken + '&redirectUrl=' + $location.absUrl().replace($window.location.hash, '#/homepage'));
                        }else{
                            $window.location.replace('https://sune.oktapreview.com/login/sessionCookieRedirect?token=' + data.cookieToken + '&redirectUrl=' + $location.absUrl().replace($window.location.hash, '#/homepage'));
                        }
                    }
                    setSessionTimeout();
                })
                .then(function () {
                    authenticationDeferred.resolve();
                })
                .catch(function (e) {
                    $log.error(e);
                    authenticationDeferred.reject();
                });

            return authenticationDeferred.promise;
        }

        function logout() {
            var deferred = $q.defer();
            $log.log('Logging out');

            function clearSessionState() {
                authenticationDeferred = null;
                self.sessionToken = null;
                self.userId = null;
                self.user = null;
                localStorageService.remove('se-sessionToken');
                localStorageService.remove('se-userId');
                localStorageService.remove('se-user');
                localStorageService.remove('se-timestamp');
                localStorageService.remove('roles');
                localStorageService.remove('userCurrentRole');
                localStorageService.remove('pageInfo');
                delete $http.defaults.headers.common['x-okta-session-id'];
            }

            managedModal.dismissAllModals();
            geoCodeService.cancelOngoingRequests();
            clearSessionState();

            deferred.resolve();
            return deferred.promise;
        }

        function setSessionTimeout() {

            var loginTimeStamp;

            function setTimeoutDuration(timeStamp) {
                var currentTime,
                    expiryTime,
                    absValue,
                    diffMilliseconds,
                    diffMinutes;

                expiryTime = moment(timeStamp).add(120, 'minutes');
                currentTime = moment();
                diffMilliseconds = currentTime.diff(expiryTime, 'milliseconds', true);
                diffMinutes = currentTime.diff(expiryTime, 'minutes', true);
                $log.log('The user will be logged out in ' + Math.abs(diffMinutes) + ' minutes');

                if (diffMilliseconds) {
                    absValue = Math.abs(diffMilliseconds);
                    return absValue;
                } else {
                    return 0;
                }
            }

            try {
                loginTimeStamp = localStorageService.get('se-timestamp');
            } catch (e) {
                $log.error('Could not retrieve session timeout data');
            }

            if (loginTimeStamp) {
                var time = setTimeoutDuration(loginTimeStamp.timeStamp);
                $timeout(function () {
                    self.logout()
                        .then(function () {
                            $state.go('login');
                        });
                }, time);
            } else {
                $log.warn('The user is not yet logged in.  No session timeout will be set.');
            }

        }

        self.login = login;
        self.logout = logout;
        self.isAuthenticated = isAuthenticated;
        self.setSessionTimeout = setSessionTimeout;
    }

    function geoCodeService($timeout, $q, GoogleMapApi, $log, qPlusService) {
        /* jshint validthis:true */
        var self = this,
            requests = [],
            geoCodeThrottleInMilliseconds = 2100,
            lastResolvedTime = 0,
            googleMaps,
            googleMapsInitialized = GoogleMapApi.then(function (gmaps) {
                googleMaps = gmaps;
                return googleMaps;
            });

        self.autocompleteInstance = undefined;

        function getGeocodeAsSoonAsPossible(request) {
            var now = moment().unix(),
                diff = now - lastResolvedTime,
                remainingThrottleMilliseconds = geoCodeThrottleInMilliseconds - diff,
                basePromise = $q.when(_.noop());

            function cleanUpRequest() {
                _.remove(requests, function (r) {
                    return r === request;
                });
                lastResolvedTime = moment().unix();
            }

            if (remainingThrottleMilliseconds > 0) {
                basePromise = $timeout(function () {
                    _.noop();
                }, remainingThrottleMilliseconds);
            }
            return basePromise.then(function () {
                if (request.cancelled) {
                    throw 'cancelled geocode request (most often due to logout)';
                } else {
                    return retrieveGeocode(request.address, request.city, request.state, request.zip);
                }
            })
                .then(function (geoCode) {
                    cleanUpRequest();
                    request.deferred.resolve(geoCode);
                    return geoCode;
                })
                .catch(function (error) {
                    cleanUpRequest();
                    request.deferred.reject(error);
                });
        }

        function getThrottledGeocode(address, city, state, zip, highPriority) {
            var request = _.find(requests, function (r) {
                return r.address === address && r.city === city && r.state === state && r.zip === zip;
            });

            if (request) {
                return request.promise;
            }
            request = {
                deferred: $q.defer(),
                address: address,
                city: city,
                state: state,
                zip: zip
            };
            request.promise = request.deferred.promise;
            requests.push(request);

            if (requests.length === 1 || highPriority) {
                getGeocodeAsSoonAsPossible(request);
            } else {
                var promises = _.take(_.pluck(requests, 'promise'), requests.length - 1);
                qPlusService.allFinally(promises)
                    .finally(function () {
                        return getGeocodeAsSoonAsPossible(request);
                    });
            }
            return request.promise;
        }

        function retrieveGeocode(address, city, state, zip) {
            var requestUrl = '',
                deferred = $q.defer(),
                addressAdded = false,
                cityAdded = false,
                stateAdded = false;

            function concatItem(item) {
                return requestUrl + '+' + item;
            }

            if (!_.isEmpty(address)) {
                var modifiedAddress;

                addressAdded = true;
                modifiedAddress = address.split(' ');
                if (_.isArray(modifiedAddress) && modifiedAddress.length > 1) {
                    modifiedAddress = modifiedAddress.join('+');
                }
                requestUrl = modifiedAddress;
            }
            if (!_.isEmpty(city)) {
                cityAdded = true;
                if (addressAdded) {
                    requestUrl = concatItem(city);
                } else {
                    requestUrl = requestUrl + city;
                }
            }
            if (!_.isEmpty(state)) {
                stateAdded = true;
                if (cityAdded || addressAdded) {
                    requestUrl = concatItem(state);
                } else {
                    requestUrl = requestUrl + state;
                }
            }
            if (!_.isEmpty(zip)) {
                if (cityAdded || addressAdded || stateAdded) {
                    requestUrl = concatItem(zip);
                } else {
                    requestUrl = requestUrl + zip;
                }
            }

            googleMapsInitialized.then(function (googleMaps) {
                var geocoder = new googleMaps.Geocoder();

                geocoder.geocode({'address': requestUrl}, function (data, status) {
                    if (status === googleMaps.GeocoderStatus.OK) {
                        deferred.resolve(data);
                    } else {
                        deferred.reject(status);
                    }
                });
            });

            return deferred.promise;
        }

        function latitudeAndLongitude(address, city, state, zip, highPriority) {
            return getThrottledGeocode(address, city, state, zip, highPriority)
                .then(function (geoCode) {
                    if (!geoCode) {
                        throw null;
                    }
                    return geoCode;
                })
                .then(function (geoCode) {
                    return {
                        latitude: geoCode[0].geometry.location.lat(),
                        longitude: geoCode[0].geometry.location.lng()
                    };
                });
        }

        function cancelOngoingRequests() {
            _.each(requests, function (r) {
                r.cancelled = true;
            });
        }

        function geolocate() {
            var deferred = $q.defer();

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    deferred.resolve(
                        new googleMaps.LatLng(position.coords.latitude, position.coords.longitude));
                }, function () {
                    deferred.reject();
                });
            } else {
                // USA Bounds
                deferred.resolve(new googleMaps.LatLng(
                    new googleMaps.LatLng(24.14137225564275, -160.2902567423057),
                    new googleMaps.LatLng(56.51988651203465, -63.08322549230576)));
            }

            return deferred.promise;
        }

        function parsePlaceObject(place) {
            var streetAddress = '',
                model = {
                    Street: '',
                    City: '',
                    State: '',
                    Zip: ''
                };
            /* jshint camelcase: false */
            _.forEach(place.address_components, function (component) {
                /* jshint camelcase: false */
                var addressType = component.types[0];
                var value = component.long_name;

                if (addressType === 'street_number') {
                    streetAddress = streetAddress + value;
                    model.Street = streetAddress;
                }
                if (addressType === 'route') {
                    if (streetAddress !== '') {
                        streetAddress = streetAddress + ' ' + value;
                    } else {
                        streetAddress = streetAddress + value;
                    }
                    model.Street = streetAddress;
                }
                if (addressType === 'locality') {
                    model.City = value;
                }
                if (addressType === 'administrative_area_level_1') {
                    model.State = value;
                }
                if (addressType === 'postal_code') {
                    model.Zip = value;
                }
            });

            return model;
        }

        self.parsePlaceObject = parsePlaceObject;
        self.geolocate = geolocate;
        self.geoCode = getThrottledGeocode;
        self.latitudeAndLongitude = latitudeAndLongitude;
        self.cancelOngoingRequests = cancelOngoingRequests;
    }

    function qPlusService($q) {
        return {
            qforeach: function qforeach(array, fn) {
                var thunks = _.map(array, function (x) {
                    return function () {
                        return fn(x);
                    };
                });
                return thunks.reduce($q.when, $q.when(0)); // 0 is a throwaway starting value
            },
            allFinally: function allFinally(arrayOfPromises) {
                var deferred = $q.defer(),
                    results = [],
                    promisesOutstanding;
                if (_.isEmpty(arrayOfPromises)) {
                    deferred.resolve();
                }
                promisesOutstanding = arrayOfPromises.length;
                _.forEach(arrayOfPromises, function (promise, index) {
                    results.push(false);
                    promise.finally(function (resultOrReason) {
                        results[index] = resultOrReason;
                        promisesOutstanding--;
                        if (promisesOutstanding === 0) {
                            deferred.resolve(results);
                        }
                    });
                });

                return deferred.promise;
            }
        };
    }

    function homeownerService($q, sessionService, $rootScope, Homeowner, $log, $timeout, asAddressFilter, geoCodeService, homeownerModalService, localStorageService, $window,CreditCheckPoll) {
        /* jshint validthis:true */
        var self = this,
            viewModels = [],
            viewModelsPromise = null;


        function newHomeownerVM() {
            return {
                id: null,
                show: false, // Directly watched to control InfoWindow visibility - TODO - Refactor need for this
                model: new Homeowner({
                    PartnerId: sessionService.user.profile.PartnerId,
                    SalesPersonId: sessionService.user.profile.NSInternalId
                }),
                location: {
                    geocodeRequestInProgress: null,
                    latitude: null,
                    longitude: null
                },
                prospectIcon: 'assets/images/prospectpin.png'
            };
        }

        function retrieveHomeownersByPartnerID() {
            var tempPageInfo = localStorageService.get('pageInfo');
            if(!tempPageInfo.pageDetails){
                tempPageInfo.pageDetails = {};
                                                }
            var lastUpdatedOn = '';
            lastUpdatedOn = tempPageInfo.pageDetails[tempPageInfo.requestedPage];            
            if(tempPageInfo.moreLeadsRequested){
                lastUpdatedOn = tempPageInfo.pageDetails[tempPageInfo.lastPageNo];
            }
            if(lastUpdatedOn === null || lastUpdatedOn === '' || lastUpdatedOn === undefined){
               lastUpdatedOn = '';
                                                }
            viewModelsPromise = Homeowner.get({partnerid: sessionService.user.profile.PartnerId, LastUpdatedOn: lastUpdatedOn}).$promise
                .then(function (data) {
                    if(typeof data.TotalCount !== 'undefined' && data.TotalCount){
                        var totalNoOfLeads = parseInt(data.TotalCount);
                        if(totalNoOfLeads > 0 && (typeof tempPageInfo.totalNoOfPages === 'undefined' || tempPageInfo.totalNoOfPages === null)){
                            tempPageInfo.totalNoOfPages = Math.ceil(totalNoOfLeads / 500);
                            localStorageService.add('pageInfo', tempPageInfo);
                        }
                    }
                    if(typeof data.Homeowners !== 'undefined' && data.Homeowners){
                        var homeOwnersList = data.Homeowners;
                        if(homeOwnersList.length < 1){
                            tempPageInfo.nextPageExists = false;
                            tempPageInfo.moreLeadsRequested = false;
                            tempPageInfo.lastPageNo = tempPageInfo.lastPageNo - 1;
                            tempPageInfo.currentPageNo = tempPageInfo.lastPageNo;
                            tempPageInfo.requestedPage = tempPageInfo.currentPageNo;
                            localStorageService.add('pageInfo', tempPageInfo);
                            if(tempPageInfo.lastPageNo > 0){
                                $window.location.reload(true);
                            }else{
                                $rootScope.$broadcast('backendError', 'No data to display');
                            }                        
                        }else{
                            if(typeof tempPageInfo.pageDetails[tempPageInfo.lastPageNo + 1] === 'undefined' || tempPageInfo.pageDetails[tempPageInfo.lastPageNo + 1] === null){
                                tempPageInfo.pageDetails[tempPageInfo.lastPageNo + 1] = homeOwnersList[homeOwnersList.length - 1].LastUpdatedOn;
                            }
                            //tempPageInfo.pageDetails[tempPageInfo.lastPageNo + 1] = homeOwnersList[homeOwnersList.length - 1].LastUpdatedOn;
                            tempPageInfo.moreLeadsRequested = false;
                            localStorageService.add('pageInfo', tempPageInfo);
                            viewModels = _.map(homeOwnersList, function (model) {
                                var vm = newHomeownerVM();
                                vm.model = model;
                                vm.id = model.SunEdCustId;
                                return vm;
                            });

                            addLocationsToHomeowners(); // Note that we intentionally do not wait for the async geocoding to resolve
                            return viewModels;
                        }
                    }
                })
                .catch(function (error) {
                    $rootScope.$broadcast('backendError', error);
                });
            return viewModelsPromise;
        }

        
        function retrieveHomeownersBySalesPersonID() {
            var tempPageInfo = localStorageService.get('pageInfo');
            if(!tempPageInfo.pageDetails){
                tempPageInfo.pageDetails = {};                       
            }
            var lastUpdatedOn = '';
            lastUpdatedOn = tempPageInfo.pageDetails[tempPageInfo.requestedPage];            
            if(tempPageInfo.moreLeadsRequested){
                lastUpdatedOn = tempPageInfo.pageDetails[tempPageInfo.lastPageNo];
            }
            if(lastUpdatedOn === null || lastUpdatedOn === '' || lastUpdatedOn === undefined){
               lastUpdatedOn = '';
            }
            viewModelsPromise = Homeowner.query({SalesPersonId: sessionService.user.profile.NSInternalId, LastUpdatedOn: lastUpdatedOn}).$promise
                .then(function (data) {
                    if(data.length < 1){
                        tempPageInfo.nextPageExists = false;
                        tempPageInfo.moreLeadsRequested = false;
                        tempPageInfo.lastPageNo = tempPageInfo.lastPageNo - 1;
                        tempPageInfo.currentPageNo = tempPageInfo.lastPageNo;
                        tempPageInfo.requestedPage = tempPageInfo.currentPageNo;
                        localStorageService.add('pageInfo', tempPageInfo);
                        $rootScope.$broadcast('backendError', 'No data to display');
                        $window.location.reload(true);
                    }else{                        
                        tempPageInfo.pageDetails[tempPageInfo.lastPageNo + 1] = data[data.length - 1].LastUpdatedOn;                        
                        tempPageInfo.moreLeadsRequested = false;
                        localStorageService.add('pageInfo', tempPageInfo);
                        viewModels = _.map(data, function (model) {
                            var vm = newHomeownerVM();
                            vm.model = model;
                            vm.id = model.SunEdCustId;
			    if(model.ProposalIds != null){  
                            var proposallist = model.ProposalIds.split(',');
                            for(var i=0; i<proposallist.length; i++){
                                if(proposallist[i] == 'null' || proposallist[i] == null || proposallist[i] == 'data not found' || proposallist[i].indexOf('.txt') !== -1){
                                     proposallist.splice(i, 1);
                                     i = i-1;
                                }                                                                 
                            }
                            vm.Proposals = proposallist;
                        }
                            return vm;
                        });

                        addLocationsToHomeowners(); // Note that we intentionally do not wait for the async geocoding to resolve
                        return viewModels;
                    }
                })
                .catch(function (error) {
                    $rootScope.$broadcast('backendError', error);
                });
            return viewModelsPromise;
        }
        
        function retrieveHomeownersBySunEdisonManagerID() {
            var tempPageInfo = localStorageService.get('pageInfo');
            if(!tempPageInfo.pageDetails){
                tempPageInfo.pageDetails = {};                       
            }
            var lastUpdatedOn = '';
            lastUpdatedOn = tempPageInfo.pageDetails[tempPageInfo.requestedPage];            
            if(tempPageInfo.moreLeadsRequested){
                lastUpdatedOn = tempPageInfo.pageDetails[tempPageInfo.lastPageNo];
            }
            if(lastUpdatedOn === null || lastUpdatedOn === '' || lastUpdatedOn === undefined){
               lastUpdatedOn = '';
            }
            viewModelsPromise = Homeowner.query({SunEdisonMgrId: sessionService.user.profile.NSInternalId, LastUpdatedOn: lastUpdatedOn}).$promise
                .then(function (data) {
                    if(data.length < 1){
                        tempPageInfo.nextPageExists = false;
                        tempPageInfo.moreLeadsRequested = false;
                        tempPageInfo.lastPageNo = tempPageInfo.lastPageNo - 1;
                        tempPageInfo.currentPageNo = tempPageInfo.lastPageNo;
                        tempPageInfo.requestedPage = tempPageInfo.currentPageNo;
                        localStorageService.add('pageInfo', tempPageInfo);
                        $rootScope.$broadcast('backendError', 'No data to display');
                        $window.location.reload(true);
                    }else{                        
                        tempPageInfo.pageDetails[tempPageInfo.lastPageNo + 1] = data[data.length - 1].LastUpdatedOn;                        
                        tempPageInfo.moreLeadsRequested = false;
                        localStorageService.add('pageInfo', tempPageInfo);
                        viewModels = _.map(data, function (model) {
                            var vm = newHomeownerVM();
                            vm.model = model;
                            vm.id = model.SunEdCustId;
			    if(model.ProposalIds != null){  
                            var proposallist = model.ProposalIds.split(',');
                            for(var i=0; i<proposallist.length; i++){
                                if(proposallist[i] == 'null' || proposallist[i] == null || proposallist[i] == 'data not found' || proposallist[i].indexOf('.txt') !== -1){
                                     proposallist.splice(i, 1);
                                     i = i-1;
                                }                                                                 
                            }
                            vm.Proposals = proposallist;
                        }
                            return vm;
                        });

                        addLocationsToHomeowners(); // Note that we intentionally do not wait for the async geocoding to resolve
                        return viewModels;
                    }
                })
                .catch(function (error) {
                    $rootScope.$broadcast('backendError', error);
                });
            return viewModelsPromise;
        }

        function addLocationsToHomeowners() {
            _.map(viewModels, function (homeownerVM) {
                homeownerVM.location = {
                    stickyShow: false, // Tracks whether or not marker clicked and window should stay visible following mouseout
                    geocodeRequestInProgress: null,
                    latitude: null,
                    longitude: null,
                    options: {draggable: false},
                    id: homeownerVM.SunEdCustId,
                    edit: function () {
                        return homeownerModalService.editHomeownerInModal(homeownerVM);
                    },
                    windowClosed: function () {
                        location.stickyShow = false;
                    }
                };
                return updateLatLngForHomeowner(homeownerVM);
            });
        }

        function updateLatLngForHomeowner(homeownerVM) {

            if (homeownerVM.model.LatLng && homeownerVM.model.LatLng.Lat && homeownerVM.model.LatLng.Lng) {
                if (homeownerVM.model.LatLng.Lat) {
                    homeownerVM.location.latitude = parseFloat(homeownerVM.model.LatLng.Lat);
                }
                if (homeownerVM.model.LatLng.Lng) {
                    homeownerVM.location.longitude = parseFloat(homeownerVM.model.LatLng.Lng);
                }
            } else {
                // Note for future refinement: Consider enhancing with a cancel signal approach for pre-existing requests.
                homeownerVM.location.geocodeRequestInProgress = geoCodeService.latitudeAndLongitude(homeownerVM.model.Street, homeownerVM.model.City, homeownerVM.model.State, homeownerVM.model.Zip)
                    .then(function (latLng) {
                        homeownerVM.location.latitude = latLng.latitude;
                        homeownerVM.location.longitude = latLng.longitude;
                    });
                return homeownerVM.location.geocodeRequestInProgress;
            }
        }

        function getHomeownerViewModelsByPartnerID() {
            var tempPageInfo = localStorageService.get('pageInfo');
            if (viewModelsPromise && !tempPageInfo.forceReload) {                             
                return viewModelsPromise;
            } else {                
                if(tempPageInfo.forceReload){
                    tempPageInfo.forceReload = false;
                    localStorageService.add('pageInfo', tempPageInfo);
                }
                return retrieveHomeownersByPartnerID();
            }
        }
        
        function getHomeownerViewModelsBySalesPersonID() {
            var tempPageInfo = localStorageService.get('pageInfo');
            if (viewModelsPromise && !tempPageInfo.forceReload) {                             
                return viewModelsPromise;
            } else {                
                if(tempPageInfo.forceReload){
                    tempPageInfo.forceReload = false;
                    localStorageService.add('pageInfo', tempPageInfo);
                }
                return retrieveHomeownersBySalesPersonID();
            }
        }
        
        function getHomeownerViewModelsBySunEdisonManagerID() {
            var tempPageInfo = localStorageService.get('pageInfo');
            if (viewModelsPromise && !tempPageInfo.forceReload) {                             
                return viewModelsPromise;
            } else {                
                if(tempPageInfo.forceReload){
                    tempPageInfo.forceReload = false;
                    localStorageService.add('pageInfo', tempPageInfo);
                }
                return retrieveHomeownersBySunEdisonManagerID();
            }
        }

        /**
         * @returns a promise that will resolve with success once the homeowner's CreditStatus
         * has a value, and fails if it runs out of retries.
         */
        function pollHomeownerUntilCreditStatusExists(homeownerViewModel, triesRemaining) {
            if (triesRemaining === undefined) {
                triesRemaining = 3;
            }

            return CreditCheckPoll.getNoCache({'id': homeownerViewModel.model.SunEdCustId}).$promise.then(function (data) {
                homeownerViewModel.creditCheckInProcess = true;

                if (homeownerViewModel.model.CreditStatus) {
                    $log.info('Got CreditStatus from backend');
                    return homeownerViewModel;
                }
                else if (triesRemaining > 0) {
                    $log.info('Did not get CreditStatus, scheduling retry');
                    return $timeout(function () {
                    }, 1000)
                        .then(function () {
                            $log.info('Retry of checking for CreditStatus');
                            return pollHomeownerUntilCreditStatusExists(homeownerViewModel, triesRemaining - 1);
                        });
                }
                else {
                    $log.error('CreditStatus was not populated after polling');
                    throw 'Credit check status was not updated.';
                }
            });
        }

        function stripNullValues(obj) {
            _.forEach(obj, function (value, key) {
                if (value === null || value === '') {
                    delete obj[key];
                }
            });
        }

        function populateFinancingProgram(homeownerVM) {
            switch (homeownerVM.model.PurchaseType) {
                case 'Lease - Monthly':
                    homeownerVM.model.FinancingProgram = 'PPA 1.0';
                    break;
                case 'Lease - Monthly(WGSW)':
                    homeownerVM.model.FinancingProgram = 'WGSW';
                    break;
                case 'Loan':
                    homeownerVM.model.FinancingProgram = 'WJB-SAI';
                    break;
                case 'Cash':
                    homeownerVM.model.FinancingProgram = 'Cash-SAI';
                    break;
                case 'Undecided':
                    homeownerVM.model.FinancingProgram = '';
                    break;
                case 'PPA':
                    homeownerVM.model.FinancingProgram = 'PPA 1.0';
                    break;
            }
        }

        function saveError(error) {
            $log.info('Failed to save lead, got ' + error.data);
            $rootScope.$broadcast('backendError', error);
            throw error;
        }


        function syncModelProperties(source, dest) {
            _.forIn(source, function (value, key) {
                dest[key] = value;
            });

            _.forIn(dest, function (value, key) {
                if (_.isUndefined(source[key])) {
                    delete dest[key];
                }
            });
        }

        function updateFrom(originalVM, updatedVM) {
            var vmToSubmit = _.cloneDeep(updatedVM);
            var originalAddress = asAddressFilter(originalVM.model);
            var updatedAddress = asAddressFilter(vmToSubmit.model);

            populateFinancingProgram(vmToSubmit);
            stripNullValues(vmToSubmit.model);
            if(vmToSubmit.model.PurchaseType === 'Lease - Monthly(WGSW)'){
                vmToSubmit.model.PurchaseType = 'Lease - Monthly';
            }

            if (originalVM.model.SunEdCustId) {
                return Homeowner.update({id: originalVM.model.SunEdCustId}, vmToSubmit.model).$promise
                    .then(function () {
                        syncModelProperties(vmToSubmit.model, originalVM.model);
                        // this could break if the back end is returning something different that we PUT.

                        if (originalAddress !== updatedAddress) {
                            // Note that we do not wait for geocode to finish before returning
                            originalVM.location.geocodeRequestInProgress = geoCodeService
                                .latitudeAndLongitude(originalVM.model.Address, originalVM.model.City, originalVM.model.State, originalVM.model.Zip)
                                .then(function (latLng) {
                                    originalVM.location.latitude = latLng.latitude;
                                    originalVM.location.longitude = latLng.longitude;
                                    return originalVM;
                                });
                        }
                        return originalVM;
                    })
                    .catch(saveError);

            } else {
                return saveNewHomeowner(originalVM, vmToSubmit);
            }
        }

        function saveNewHomeowner(originalVM, vmToSubmit) {
            return Homeowner.save(vmToSubmit.model).$promise
                .then(function (response) {
                    syncModelProperties(vmToSubmit.model, originalVM.model);

                    if (response.SunEdCustId) {
                        originalVM.model.SunEdCustId = response.SunEdCustId;
                    } else if (response.id) {
                        // Alternative stub server id generated
                        originalVM.model.SunEdCustId = response.id;
                    }

                    originalVM.id = originalVM.model.SunEdCustId;

                    return getHomeownerViewModelsByPartnerID();
                })
                .then(function () {
                    var existingVM = _.find(viewModels, function (vm) {
                        return vm.model.SunEdCustId === originalVM.model.SunEdCustId;
                    });

                    if (existingVM) {
                        return existingVM;
                    }

                    // geocode with highPriority set to true, so it doesn't have to wait in line.
                    originalVM.location.geocodeRequestInProgress = geoCodeService
                        .latitudeAndLongitude(originalVM.model.Address, originalVM.model.City, originalVM.model.State, originalVM.model.Zip, true)
                        .then(function (latLng) {
                            originalVM.location.latitude = latLng.latitude;
                            originalVM.location.longitude = latLng.longitude;
                            return originalVM;
                        }
                    );
                    viewModels.unshift(originalVM);
                    return originalVM;
                })
                .catch(saveError);
        }

        self.getHomeownerViewModelsByPartnerID = getHomeownerViewModelsByPartnerID;
        self.getHomeownerViewModelsBySalesPersonID = getHomeownerViewModelsBySalesPersonID;
        self.getHomeownerViewModelsBySunEdisonManagerID = getHomeownerViewModelsBySunEdisonManagerID;
        self.pollHomeownerUntilCreditStatusExists = pollHomeownerUntilCreditStatusExists;
        self.newHomeownerVM = newHomeownerVM;
        self.updateFrom = updateFrom;        
    }

    // From https://gist.github.com/cstephe/1ef2c48b136589935853
    function backspaceNotBackButton() {
        return {
            restrict: 'A',
            link: function (scope, element) {
                // This will stop backspace from acting like the back button
                $(element).keydown(function (e) {
                    var elid = $(document.activeElement)
                        .filter(
                        'input:not([type], [readonly]),' +
                        'input[type=text]:not([readonly]), ' +
                        'input[type=password]:not([readonly]), ' +
                        'input[type=search]:not([readonly]), ' +
                        'input[type=number]:not([readonly]), ' +
                        'input[type=email]:not([readonly]), ' +
                        'input[type=date]:not([readonly]), ' +
                        'input[type=datetime]:not([readonly]), ' +
                        'input[type=datetime-local]:not([readonly]), ' +
                        'input[type=month]:not([readonly]), ' +
                        'input[type=tel]:not([readonly]), ' +
                        'input[type=time]:not([readonly]), ' +
                        'input[type=url]:not([readonly]), ' +
                        'input[type=week]:not([readonly]), ' +
                        'textarea')[0];
                    if (e.keyCode === 8 && !elid) {
                        return false;
                    }
                    if (e.keyCode === 13 && elid.id === 'Street') {
                        return false;
                    }
                });
            }
        };
    }

    function managedModal($modal) {
        /* jshint validthis:true */
        var self = this,
            modals = [];

        function removeModalFromCache(target) {
            _.remove(modals, function (m) {
                return target === m;
            });
        }

        function open(options) {
            var m = $modal.open(options);
            modals.push(m);
            m.result.finally(function () {
                removeModalFromCache(m);
            });
            return m;
        }

        function dismissAllModals() {
            // Simply dismissing the modals will result in their being removed from the cache
            // thanks to the `finally` handler added to each in `open`
            _.each(modals, function (m) {
                m.dismiss();
            });
        }

        self.open = open;
        self.dismissAllModals = dismissAllModals;
    }

    function homeownerModalService(managedModal) {
        /* jshint validthis:true */
        var self = this;

        function editHomeownerInModal(homeownerVM) {
            var modalInstance = managedModal.open({
                templateUrl: 'app/navbar/leadModal.html',
                controller: 'ModalInstanceCtrl',
                size: 'lg',
                backdrop: 'static',
                windowClass: 'edit-homeowner-details',
                resolve: {
                    homeownerVM: function () {
                        return homeownerVM;
                    }
                }
            });
            return modalInstance;
        }

        self.editHomeownerInModal = editHomeownerInModal;
    }
    

    function modSolarModalService(managedModal, $window) {
        /* jshint validthis:true */
        var self = this;

        function openModSolarModal(){
            $window.scrollTo('0','0');
            var modalInstance = managedModal.open({
                templateUrl: 'app/navbar/modSolarModal.html',
                controller: ['$scope', '$window', '$location', '$sce', '$modalInstance', function($scope, $window, $location, $sce, $modalInstance) {
                    $scope.cancel = function () {
                        $window.location.reload();
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.modSolarURL = $sce.trustAsResourceUrl('https://sune.oktapreview.com/home/sunedison_modsolar_1/0oa32hhvwxVNFOCHOJET/9291');
                    if($location.host() ==='partner.sunedison.com'){
                            $scope.modSolarURL =  $sce.trustAsResourceUrl('https://sune.okta.com/home/sunedisonportal_modsolar_1/0oayxxoxi1DAMVDNVVCX/42279');
                    }
                    //code to prevent frame busting by ModSolar. This need to be handled in a better way in future.
                    var preventBust = 0;
                    window.onbeforeunload = function() { preventBust++; };
                    setInterval(function() {
                        if (preventBust > 0 ) {
                            preventBust = -2;
                            $window.location.reload();
                        }
                    }, 1);
                }],
                size: 'lg',
                backdrop: 'static',
                windowClass: 'modal-content-modsolar-login'
            });
            modalInstance.result
                .then(function () {
                    $window.location.reload();
                });
        }

        self.openModSolarModal = openModSolarModal;
    }

    function supportMsgModalService(managedModal) {
        /* jshint validthis:true */
        var self = this;

        function openCallSupportMsgInModal() {
            var modalInstance = managedModal.open({
                templateUrl: 'app/navbar/callSupportMsg.html',
                size: 'lg',
                backdrop: 'static',
                windowClass: 'modal-call-support-message',
                controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                }]
            });
        }
        self.openCallSupportMsgInModal = openCallSupportMsgInModal;
    }

	function proposalModalService(managedModal, $window, localStorageService, TarrifNames) {
        /* jshint validthis:true */
        var self = this;
 
        function openProposalModal(homeownerVM){
            $window.scrollTo('0','0');
            var url = $window.location.href;
            var temp = url.slice('/').split('/');
            var mainurl = temp[2];
            if(mainurl === "localhost")
                mainurl = "localhost/Work_Area/Ziba_Olympus/src";
            var modalInstance = managedModal.open({
                templateUrl: 'app/navbar/proposalModal.html',
                controller: ['$state','$scope', '$window', '$sce', '$modalInstance', function($state, $scope, $window, $sce, $modalInstance) {
                        $scope.cancel = function () {
                            //$window.location.reload();
                            $modalInstance.dismiss('cancel');
                        };
                        $scope.financepage = function () {
                             if(($("#designpage").contents().find("#presolarutility").html() !== '') && ($("#designpage").contents().find("#postsolarutility").html() !== '')){
                                    $modalInstance.dismiss('cancel');
                                    $state.go('financeoption');
                                }
                            else
                                alert("Please complete the design before moving forward");
                        };

                        console.log(localStorageService.get('se-sessionToken'));
                        //$scope.proposalURL = $sce.trustAsResourceUrl('http://'+mainurl+'/ProposalTool/Proposal/NewDesign.html?lat='+homeownerVM.location.latitude+'&lng='+homeownerVM.location.longitude+'&OID='+localStorageService.get('se-sessionToken')+'&SunEdCustId='+homeownerVM.id+'&Zipcode='+homeownerVM.model.Zip+'&FinanceProg='+homeownerVM.model.PurchaseType);
                        $scope.proposalURL = $sce.trustAsResourceUrl('http://' + mainurl + '/ProposalTool/Proposal/NewDesign.html?lat=' + homeownerVM.latitude + '&lng=' + homeownerVM.longitude + '&OID=' + localStorageService.get('se-sessionToken') + '&SunEdCustId=' + homeownerVM.SunEdCustId + '&Zipcode=' + homeownerVM.Zip + '&FinanceProg=' + homeownerVM.FinancingProgram + '&addr1=' + homeownerVM.addr1 + '&addr2=' + homeownerVM.addr2 + '&customerName=' + homeownerVM.customerName);
                    }],
                size: 'lg',
                windowClass: 'modal-content-proposal'
            });
            modalInstance.result
                .then(function () {
                    $window.location.reload();
                });
        } 
        function openDesignPage(homeownerVM){
            $window.scrollTo('0','0');
            var url = $window.location.href;
            var temp = url.slice('/').split('/');
            var mainurl = temp[2];
            if(mainurl === "localhost")
                mainurl = "localhost/Work_Area/Ziba_Olympus/src";
            var modalInstance = managedModal.open({
                templateUrl: 'app/Ziba_UI/DesignToolHolder.html',
                parent: 'dashboard',
                url: '/designpage',
                size: 'lg',
                backdrop: 'static',
                windowClass: 'modal-call-support-message',
                controller: ['$scope', '$modalInstance','$sce', function($scope, $modalInstance, $sce) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    }
                        $scope.proposalURL = $sce.trustAsResourceUrl('http://' + mainurl + '/ProposalTool/Proposal/NewDesign.html?lat=' + homeownerVM.latitude + '&lng=' + homeownerVM.longitude + '&OID=' + localStorageService.get('se-sessionToken') + '&SunEdCustId=' + homeownerVM.SunEdCustId + '&Zipcode=' + homeownerVM.Zip + '&FinanceProg=' + homeownerVM.FinancingProgram + '&addr1=' + homeownerVM.addr1 + '&addr2=' + homeownerVM.addr2 + '&customerName=' + homeownerVM.customerName);
                    
                }],
            });
         
            }
        self.openDesignPage = openDesignPage;
        self.openProposalModal = openProposalModal;
    }   
        //var popupflag =1, contractflag = 1;
   function proposalIdService(ProposalIDfact,ContractIdfact) {
        /* jshint validthis:true */
        var self = this;        
             
        function proposalIDcall(proposal){            
	var popupWindow = '_blank';
            ProposalIDfact.get({proposal: proposal}).$promise   
                    .then(function (response) {
                        var pdfURL = "data:application/pdf;base64," + response.pdf;
                        popupWindow = window.open('', '', 'height=800,width=750, top=0, left=400');
                        popupWindow.document.writeln('<html><head><title>Proposal for Solar Installation</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css"></head><body><div><iframe id="pdfIframe" style="width:100%; height: 95%"></iframe></div><div style="text-align:center"><button class="btn btn-warning" id = "contract" style="width:48%;">View Contract</button></div></body></html>');
                        popupWindow.document.getElementById("pdfIframe").src = pdfURL;
                        popupWindow.document.getElementById("contract").onclick = function() {openContract(proposal);}                       
                    });       
            //popupflag++;
            popupWindow = null;
        }
        function openContract(proposal){
            //popupWindow.close();
            var contractWindow = '_blank';//'contractWin_'+ contractflag ;
            ContractIdfact.get({proposal: proposal}).$promise   
                    .then(function (response) {
                        var pdfURL = "data:application/pdf;base64," + response.pdf;
                        contractWindow = window.open('', '', 'height=800,width=750, top=0, left=400');
                        contractWindow.document.writeln('<html><head><title>Proposal for Solar Installation</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css"></head><body><div><iframe id="pdfIframe" style="width:100%; height: 95%"></iframe></div><div style="text-align:center"></div></body></html>');
                        contractWindow.document.getElementById("pdfIframe").src = pdfURL;
                        //contractWindow.document.getElementById("contract").onclick = openContract;                       
                    }
                ); 
        //contractflag++;
        contractWindow = null;
        }
       self.proposalIDcall = proposalIDcall;
    }   
    
    function CustomerService ($rootScope, $state){
        var self = this;        
        function OpenCustomerDetails(homeownerVM){   
            console.log(homeownerVM.model.SunEdCustId);
            $rootScope.SunEdCustId = homeownerVM.model.SunEdCustId;
            $state.go('customerdetails');
            
        }        
        self.OpenCustomerDetails = OpenCustomerDetails;
    }
        
    angular
        .module('dealerportal.service', ['dealerportal.enum', 'dealerportal.resource', 'ui.router', 'uiGmapgoogle-maps', 'uiGmapgoogle-maps.directives.api.utils', 'ui.bootstrap'])
        .config(['uiGmapGoogleMapApiProvider', function (GoogleMapApi) {
            GoogleMapApi.configure({
                //    key: 'your api key',
                v: '3',
                libraries: 'geometry,drawing,places'
            });
        }])
        .service('versionService', versionService)
        .service('geoCodeService', ['$timeout', '$q', 'uiGmapGoogleMapApi', '$log', 'qPlusService', geoCodeService])
        .service('sessionService', ['$q', '$log', '$http', '$state', '$timeout', '$window', '$location', 'localStorageService', 'snapflowConstant', 'Login', 'managedModal', 'geoCodeService', sessionService])
        .service('qPlusService', ['$q', qPlusService])
        .service('managedModal', ['$modal', managedModal])
        .service('homeownerService', ['$q', 'sessionService', '$rootScope', 'Homeowner', '$log', '$timeout', 'asAddressFilter', 'geoCodeService', 'homeownerModalService', 'localStorageService', '$window','CreditCheckPoll', homeownerService])
        .service('homeownerModalService', ['managedModal', homeownerModalService])
        .service('modSolarModalService', ['managedModal', '$window', modSolarModalService])
        .service('supportMsgModalService', ['managedModal', supportMsgModalService])
        .service('proposalModalService', ['managedModal', '$window', 'localStorageService', proposalModalService])
        .service('proposalIdService',['ProposalIDfact', 'ContractIdfact', proposalIdService])
        .service('CustomerService' , ['$rootScope', '$state', CustomerService])
        .directive('backspaceNotBackButton', backspaceNotBackButton)
        .filter('pluck', function () {
            return _.pluck;
        });
})();
