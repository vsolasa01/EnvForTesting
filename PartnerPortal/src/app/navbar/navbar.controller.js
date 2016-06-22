'use strict';

(function () {
    function NavbarCtrl($state, sessionService, homeownerService, homeownerModalService, $window, localStorageService) {
        var self = this;

        self.logout = function () {
            sessionService.logout()
                .then(function () {
                    $state.go('login');
                });
        };

        self.openCreateLeadModal = function() {
            homeownerModalService.editHomeownerInModal(homeownerService.newHomeownerVM());
        };

        function goHome() {            
            var tempPageInfo = localStorageService.get('pageInfo');
            if(tempPageInfo.currentPageNo !== 1){
                tempPageInfo.forceReload = true;                
                tempPageInfo.currentPageNo = 1;
                tempPageInfo.requestedPage = 1;
                localStorageService.add('pageInfo', tempPageInfo);
            }
            $state.go('homepage');
        }

        self.goHome = goHome;
        
        function reloadAsPartner() {
            localStorageService.add('userCurrentRole', 'PartnerAdmin');
            var tempPageInfo = localStorageService.get('pageInfo');
            tempPageInfo.pageDetails = {};
            tempPageInfo.pageDetails['1'] = '';
            tempPageInfo.lastPageNo = 1;
            tempPageInfo.currentPageNo = 1;
            tempPageInfo.nextPageExists = true;
            tempPageInfo.nextPageExists = true;
            delete tempPageInfo.requestedPage;
            localStorageService.add('pageInfo', tempPageInfo);
            $window.location.reload(true);
        }
        function reloadAsSalesPerson() {
            localStorageService.add('userCurrentRole', 'SalesPerson');
            var tempPageInfo = localStorageService.get('pageInfo');
            tempPageInfo.pageDetails = {};
            tempPageInfo.pageDetails['1'] = '';
            tempPageInfo.lastPageNo = 1;
            tempPageInfo.currentPageNo = 1;
            tempPageInfo.nextPageExists = true;
            delete tempPageInfo.requestedPage;
            localStorageService.add('pageInfo', tempPageInfo);             
            $window.location.reload(true);
        }

        self.reloadAsPartner = reloadAsPartner;
        self.reloadAsSalesPerson = reloadAsSalesPerson;

        function setMenuInformation() {
            self.user = sessionService.user;
        }

        function init() {
            setMenuInformation();
            self.currentUserRole = localStorageService.get('userCurrentRole');
            self.isPartner = false;
            self.isSalesPerson = false;
            if(localStorageService.get('roles') !== null && localStorageService.get('roles') !== undefined && localStorageService.get('roles') !== '' 
                    && localStorageService.get('roles').indexOf('PartnerAdmin')> -1 && localStorageService.get('userCurrentRole') !== 'PartnerAdmin'){
               self.showPartner = true; 
            }
            if(localStorageService.get('roles') !== null && localStorageService.get('roles') !== undefined && localStorageService.get('roles')
                    && localStorageService.get('roles').indexOf('SalesPerson')> -1 && localStorageService.get('userCurrentRole') !== 'SalesPerson'){
               self.showSalesPerson = true; 
            }            
                
        }

        init();
    }

    function ModalInstanceCtrl($log, $scope, $window, $location, $modalInstance, usStateList, usSpinnerService, homeownerVM, homeownerService, GoogleMapApi, geoCodeService, modSolarModalService, localStorageService, FileUpload, managedModal, $rootScope) {
        var originalVM = homeownerVM,
            googleMaps,
            autocompleteInstance,
            googleMapsInitialized = GoogleMapApi.then(function (gmaps) {
                googleMaps = gmaps;
                return googleMaps;
            });

        if (homeownerVM.model.SunEdCustId) {
            $scope.operation = 'Update';
            $scope.isCreate = false;
            $scope.isUpdate = true;
            if(homeownerVM.model.FinancingProgram === 'WGSW'){
                homeownerVM.model.PurchaseType = 'Lease - Monthly(WGSW)';
            }
            if(homeownerVM.model.FinancingProgram === 'SunEdison Mosaic SCION'){
                homeownerVM.model.PurchaseType = 'Loan Mosaic';
            }
            if(homeownerVM.model.FinancingProgram === 'SunEdison Mosaic SCION With Signature Series'){
                homeownerVM.model.PurchaseType = 'Loan Mosaic Signature';
            }
        } else {
            $scope.operation = 'Create';
            $scope.isCreate = true;
            $scope.isUpdate = false;            
        }

        $scope.leadFormInProcess = false;
        $scope.isProdEnv = true;
        $rootScope.fileUploadInProgress = false;
	$scope.PartnerType = localStorageService.get('se-user').profile.PartnerType;
        if(typeof $scope.PartnerType === 'undefined' || _.isEmpty($scope.PartnerType)){
            $scope.PartnerType = 'IntegratedDealer';
        }
        if($location.host() !== 'partner.sunedison.com'){
            $scope.isProdEnv = false;
        }        
        
        if(homeownerVM.model.UtilityBills && homeownerVM.model.UtilityBills !== ''){
            $rootScope.fileRetrieveInProcess = true;
            FileUpload.get({filename:homeownerVM.model.UtilityBills}).$promise
                .then(function(response) {                    
                   $scope.FileBase64 = response.Message;
                   $rootScope.fileRetrieveInProcess = false;
                })
                .catch(function() {
                    $rootScope.fileRetrieveInProcess = false;
                });
            var temparray = homeownerVM.model.UtilityBills.split('_');
            temparray.shift();
            $scope.fileNameForDisplay = temparray.join('_');
        }

        $scope.spinnerOptions = {
            lines: 8, // The number of lines to draw
            length: 0, // The length of each line
            width: 4, // The line thickness
            radius: 5, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 10, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#FFF', // #rgb or #rrggbb or array of colors
            speed: 1.5, // Rounds per second
            trail: 0, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9 // The z-index (defaults to 2000000000)
        };

        $scope.homeownerVM = _.cloneDeep(homeownerVM);
        $scope.usStateList = usStateList;

        function stopSpinner() {
            $scope.leadFormInProcess = false;
            usSpinnerService.stop('modal-spinner');
        }

        function startSpinner() {
            usSpinnerService.spin('modal-spinner');
        }

        function copyPhoneNumbersFromView() {
            $scope.homeownerVM.model.HomePhone = $scope.leadForm.HomePhone.$viewValue;
            if($scope.homeownerVM.model.HomePhone && $scope.homeownerVM.model.HomePhone.length>14){
                $scope.homeownerVM.model.HomePhone = $scope.homeownerVM.model.HomePhone.substring(0, 14);
            }
            $scope.homeownerVM.model.CoHHomePhone = $scope.leadForm.CoHHomePhone.$viewValue;
            if($scope.homeownerVM.model.CoHHomePhone && $scope.homeownerVM.model.CoHHomePhone.length>14){
                $scope.homeownerVM.model.CoHHomePhone = $scope.homeownerVM.model.CoHHomePhone.substring(0, 14);
            }
            $scope.homeownerVM.model.CellPhone = $scope.leadForm.CellPhone.$viewValue;
            if($scope.homeownerVM.model.CellPhone && $scope.homeownerVM.model.CellPhone.length>14){
                $scope.homeownerVM.model.CellPhone = $scope.homeownerVM.model.CellPhone.substring(0, 14);
            }
        }

        $scope.ok = function () {
            $log.info('Saving lead ' + $scope.homeownerVM.model.FirstName + ' ' + $scope.homeownerVM.model.LastName);
            //property to bypass modsolor.
            $scope.homeownerVM.model.ByPassModsolar = 'true';
            if ($scope.leadFormInProcess === true) {
                $log.info('Saving is in process.  Cannot execute save again.');
                return;
            } else {
                $scope.leadFormInProcess = true;
                startSpinner();

                copyPhoneNumbersFromView();
                homeownerService.updateFrom(originalVM, $scope.homeownerVM)
                    .then(function(updatedVM) {
                        if(!$rootScope.fileUploadInProgress){
                            stopSpinner();
                            $modalInstance.close(updatedVM);
                            var tempPageInfo = localStorageService.get('pageInfo');            
                            tempPageInfo.currentPageNo = 1;
                            localStorageService.add('pageInfo', tempPageInfo);
                            $window.location.reload(true);
                        }else{
                            var fileSelect = document.getElementById('uploadFile');            
                            var file1 = fileSelect.files[0];
                            if(typeof file1 === 'undefined')
                                $window.location.reload(true);
                            else
                                $scope.fileUpload();
                        }
                    })
                    .catch(function() {
                        stopSpinner();
                    });
            }           
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
            $rootScope.fileUploadInProgress = false;
            $rootScope.fileRetrieveInProcess = false;
        };

        $scope.openModSolarModal = function() {
            $modalInstance.dismiss('cancel');
            modSolarModalService.openModSolarModal();
        };

        function prepLatLongModel(latLng) {
            if (!$scope.homeownerVM.model.LatLng) {
                $scope.homeownerVM.model.LatLng = {
                    Lat: 0,
                    Lng: 0
                };
            }
            if ($scope.homeownerVM.model.LatLng && _.isObject($scope.homeownerVM.model.LatLng)) {
                if (!$scope.homeownerVM.model.LatLng.Lat) {
                    $scope.homeownerVM.model.LatLng.Lat = 0;
                }
                if (!$scope.homeownerVM.model.LatLng.Lng) {
                    $scope.homeownerVM.model.LatLng.Lng = 0;
                }
            }

            return latLng;
        }

        function initializeAddressAutoComplete() {
            googleMapsInitialized.then(function() {
                autocompleteInstance = new googleMaps.places.Autocomplete((document.getElementById('Street')), { types: ['geocode'] });

                googleMaps.event.addListener(autocompleteInstance, 'place_changed', function() {
                    var place = autocompleteInstance.getPlace();
                    var addressModel = geoCodeService.parsePlaceObject(place);
                    geoCodeService
                        .latitudeAndLongitude(addressModel.Street, addressModel.City, addressModel.State, addressModel.Zip)
                        .then(prepLatLongModel)
                        .then(function (latLng) {
                            $scope.homeownerVM.model.LatLng.Lat = latLng.latitude;
                            $scope.homeownerVM.model.LatLng.Lng = latLng.longitude;
                        });
                    _.assign($scope.homeownerVM.model, addressModel);
                });
            });
        }

        function geolocate() {
            geoCodeService.geolocate()
                .then(function (geolocation) {
                    var bounds = new googleMaps.LatLngBounds(geolocation, geolocation);
                    autocompleteInstance.setBounds(bounds);
                });

        }
        
        $scope.disableUpload = function(disable){
            if(disable){
                 $("#uploadFile").attr("disabled", true);
                 $rootScope.fileUploadInProgress = false;
            }else{
                $("#uploadFile").attr("disabled", false);
                $rootScope.fileUploadInProgress = false;
            }
        };
        
        /*$scope.fileUpload = function(){
            var fileSelect = document.getElementById('uploadFile');
            var file = fileSelect.files[0];
            var reader = new FileReader();
            console.log(file.result);
            reader.onload = function(readerEvt) {
                var binaryString = readerEvt.target.result;
                console.log(btoa(binaryString));
            };
            reader.readAsBinaryString(file);
        };*/
        
        $scope.fileUpload = function(){
            $rootScope.fileUploadInProgress = true;
            $scope.$apply();
            usSpinnerService.spin('upload-spinner');
            var fileSelect = document.getElementById('uploadFile');            
            var file1 = fileSelect.files[0];          
            var reader = new FileReader();
            var validFileExtensions = ['jpg', 'zip', 'pdf', 'png', 'doc', 'xls', 'xlsx', 'docx', 'txt', 'gif', 'jpeg', 'ppt', 'pptx'];
            var tempArray = file1.name.split('.');            
            if(validFileExtensions.indexOf(tempArray[tempArray.length-1].toLowerCase()) !== -1){
                if(file1.size < 5242880){
                    var binaryString = '';
                    var payload = {};
                    payload.Bill = {};
                    reader.onload = function(readerEvt) {
                        binaryString = readerEvt.target.result;
                        //payload.Bill.Base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(readerEvt.target.result)));
                        payload.Bill.Base64 = arrayBufferToBase64(readerEvt.target.result);                                             
                    };
                    reader.readAsArrayBuffer(file1);
                    payload.SunEdCustId = homeownerVM.model.SunEdCustId;
                    payload.PartnerName = homeownerVM.model.PartnerName;          
                    
                    payload.Bill.Ext = tempArray.pop();
                    payload.Bill.Name = tempArray.join('.');

                    /*var zip = new JSZip();
                    zip.file(file1.name, binaryString);
                    zip.file(file2);*/          
                    if(homeownerVM.model.SunEdCustId && homeownerVM.model.SunEdCustId !== ''){
                        setTimeout(function(){
                            //var content = zip.generate({type:"blob"});
                            //saveAs(content, "example.zip");
                            if(homeownerVM.model.UtilityBills && homeownerVM.model.UtilityBills !== ''){
                                FileUpload.delete({filename:homeownerVM.model.UtilityBills}).$promise
                                .then(function() {              
                                })
                                .catch(function() {
                                    //$rootScope.$broadcast('backendError', error);
                                });
                            }
                            FileUpload.save(payload).$promise
                                .then(function (response) {
                                    $rootScope.fileUploadInProgress = false;
                                    usSpinnerService.stop('upload-spinner');
                                    $scope.fileNameForDisplay = payload.Bill.Name + '.' + payload.Bill.Ext;
                                    homeownerVM.model.UtilityBills = homeownerVM.model.SunEdCustId + '_' + $scope.fileNameForDisplay;
                                    $scope.FileBase64 = payload.Bill.Base64;
                                    if($scope.leadFormInProcess){
                                        $modalInstance.close();
                                        var tempPageInfo = localStorageService.get('pageInfo');            
                                        tempPageInfo.currentPageNo = 1;
                                        localStorageService.add('pageInfo', tempPageInfo);
                                        $window.location.reload(true);
                                    }

                                })
                                .catch(function (error) {
                                    $rootScope.$broadcast('backendError', error);
                                    $rootScope.fileUploadInProgress = false;
                                });

                        }, 1000);
                    }                    
                }else{
                    openConfirmOrErrorDialogue('fileSizeTooLarge');
                }
            }else{
                openConfirmOrErrorDialogue('fileExtensionNotSupported');
            }           
        };
        
        $scope.fileUploadConfirm = function(){ 
            $rootScope.fileUploadInProgress = true;
            $scope.$apply();
            if(homeownerVM.model.UtilityBills && homeownerVM.model.UtilityBills){
                openConfirmOrErrorDialogue('confirmUpload');
            }else{
                $('#uploadFile').click();
            }
        };
        
        $scope.deleteFileConfirm = function(){            
            openConfirmOrErrorDialogue('fileDelete');            
        };
        
        $scope.downloadFile = function(){
            if($scope.FileBase64){
                //download("data:application/zip;base64,"+$scope.FileBase64, $scope.fileNameForDisplay, "application/zip");
                var fileExtension = $scope.fileNameForDisplay.split('.').pop();  
                var blob = null;
                if(fileExtension === 'zip' || fileExtension === 'xls' || fileExtension === 'xlsx'){
                    blob = new Blob([str2bytes(atob($scope.FileBase64))], {type: "application/octet-stream;charset=utf-8"});
                }else{
                    blob = new Blob([str2bytes(atob($scope.FileBase64))], {type: "application/pdf"});
                }
                saveAs(blob, $scope.fileNameForDisplay);
            }
        };
        var deleteFile = function(){
            FileUpload.delete({filename:homeownerVM.model.UtilityBills}).$promise
                .then(function() {                    
                   $scope.fileNameForDisplay = null;
                   homeownerVM.model.UtilityBills = null;
                   $scope.FileBase64 = null;
                })
                .catch(function() {
                    $rootScope.$broadcast('backendError', error);
                    $rootScope.fileUploadInProgress = false;
                });
            var temparray = homeownerVM.model.UtilityBills.split('_');
            temparray.shift();
            $scope.fileNameForDisplay = temparray.join('_');
        };
        
        function openConfirmOrErrorDialogue(displayMsg){
            var modalInstance = managedModal.open({
                        templateUrl: 'app/navbar/uploadDeleteMsgs.html',
                        size: 'lg',
                        backdrop: 'static',
                        windowClass: 'modal-call-resendCreditCheck-message',
                        controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                                $scope.displayMsg = displayMsg;
                                $scope.cancel = function () {
                                    $modalInstance.dismiss('cancel');
                                    $rootScope.fileUploadInProgress = false;
                                };
                                $scope.proceed = function (value) {
                                    if(value){
                                        $('#uploadFile').click();
                                    }else{
                                        $rootScope.fileUploadInProgress = false;
                                    }
                                    $scope.cancel(true);
                                };
                                $scope.delete = function (value) {
                                    if(value){
                                        deleteFile();
                                    }
                                    $scope.cancel(true);
                                };
                                
                            }]
                    });
        }
        function str2bytes (str) {
            var bytes = new Uint8Array(str.length);
            for (var i=0; i<str.length; i++) {
                bytes[i] = str.charCodeAt(i);
            }
            return bytes;
        }
        function arrayBufferToBase64( buffer ) {
            var binary = '';
            var bytes = new Uint8Array( buffer );
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode( bytes[ i ] );
            }
            return window.btoa( binary );
        } 
        $scope.geolocate = geolocate;
        $scope.initializeAddressAutoComplete = initializeAddressAutoComplete;
    }

    angular
        .module('dealerportal.nav', ['dealerportal.service', 'ui.router', 'ui.bootstrap'])
        .controller('NavbarCtrl', ['$state', 'sessionService', 'homeownerService', 'homeownerModalService', '$window', 'localStorageService', NavbarCtrl])
        .controller('ModalInstanceCtrl', ['$log', '$scope', '$window', '$location', '$modalInstance', 'usStateList', 'usSpinnerService', 'homeownerVM', 'homeownerService', 'uiGmapGoogleMapApi', 'geoCodeService', 'modSolarModalService', 'localStorageService', 'FileUpload', 'managedModal', '$rootScope', ModalInstanceCtrl]);
})();
