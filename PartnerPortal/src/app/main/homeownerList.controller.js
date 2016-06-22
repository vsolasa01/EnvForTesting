'use strict';
(function () {
    function HomeownerList(managedModal, $scope, $log, CreditCheck, $rootScope, usSpinnerService, $location, $window, homeownerService, homeownerModalService, modSolarModalService, supportMsgModalService, localStorageService, CustomerService) {
        var self = this;
        $scope.isProdEnv = true;
        self.reverse = true;
        self.enablePagination = false;
        self.loading = true;
        $scope.HomeOwnerRegex = new RegExp('Signed by HO');
        var tempPageInfo = localStorageService.get('pageInfo');
        self.totalNoOfPages;
        self.hideTotalPages = false;
        self.hideNextPage = false;
        self.currentPageNo;
        self.nextPageNo;
        self.pages = [];
        self.status = {'CreditStatusInUI' : [],
                       'ProposalStatusInUI': [], 
                       'ContractStatusInUI' : []};
        self.clickCountForCustomSort = 0;
        self.currentOrderBy === '';
        self.isMobile = false;
        if(typeof $window.orientation !== 'undefined'){
            //alert("This is a mobile device");
            self.isMobile = true;
            
        }
	self.PartnerType = localStorageService.get('se-user').profile.PartnerType;
        if(typeof self.PartnerType === 'undefined' || _.isEmpty(self.PartnerType)){
            self.PartnerType = 'IntegratedDealer';
        }
       
        self.order = function (field) {
            self.changeClass(field);
            self.viewModels = self.orderBy(self.viewModels, field);           
        };

        self.orderBy = function(items, field){
            items.sort(function (a, b) {                
                if(a.model[field] && b.model[field]){                        
                    return (a.model[field].toUpperCase()> b.model[field].toUpperCase() ? 1 : -1);
                }
            });
            if(self.reverse){
                items.reverse();
            }
            self.reverse = !self.reverse;
            return items;
        };
        
        self.customOrderByStatus = function(field){
            self.changeClass(field);
            if(self.currentOrderBy === '' || self.currentOrderBy !== field){
               self.currentOrderBy = field; 
               self.viewModels = self.orderBy(self.viewModels, field);
               for(var i=0; i<self.viewModels.length; i++){
                   if(self.status[field].indexOf(self.viewModels[i].model[field]) === -1){
                       self.status[field].push(self.viewModels[i].model[field]);
                   }
               }
            }
            var tempViewModels = [];
            for(var i=0; i<self.viewModels.length; i++){
                if(self.viewModels[i].model[field] === self.status[field][self.clickCountForCustomSort]){
                    tempViewModels.push(self.viewModels[i]);
                    //self.viewModels.splice(i, 1);
                    //i = i-1;
                }
            }
            for(var i=0; i<self.viewModels.length; i++){
                if(self.viewModels[i].model[field] !== self.status[field][self.clickCountForCustomSort]){
                    tempViewModels.push(self.viewModels[i]);
                }
            }
            self.viewModels = tempViewModels;
            //homeownerService.viewModelsPromise.$$state.value = self.viewModels;
            if(self.clickCountForCustomSort < self.status[field].length - 1){
                self.clickCountForCustomSort++;
            }else{
                self.clickCountForCustomSort = 0;
            }
        };

        
        
        self.changeClass = function(field){
            self.classForFN='defaultSortColumn';
            self.classForLN='defaultSortColumn';
            self.classForHomePhone='defaultSortColumn';
            self.classForStreet='defaultSortColumn';
            self.classForCity='defaultSortColumn';
            self.classForState='defaultSortColumn';
            self.classForZip='defaultSortColumn';
            self.classForCreditStatus='defaultSortColumn';
            self.classForContractStatus='defaultSortColumn';
            self.classForProposal = 'defaultSortColumn';
            if(field === 'FirstName'){
                self.classForFN = 'highlightSortColumn';
            }
            else if(field === 'LastName'){
                self.classForLN = 'highlightSortColumn';
            }
            else if(field === 'HomePhone'){
                self.classForHomePhone = 'highlightSortColumn';
            }
            else if(field === 'Street'){
                self.classForStreet = 'highlightSortColumn';
            }
            else if(field === 'City'){
                self.classForCity = 'highlightSortColumn';
            }
            else if(field === 'State'){
                self.classForState = 'highlightSortColumn';
            }
            else if(field === 'Zip'){
                self.classForZip = 'highlightSortColumn';
            }
            else if(field === 'CreditStatusInUI'){
                self.classForCreditStatus = 'highlightSortColumn';
            }
            else if(field === 'ContractStatusInUI'){
                self.classForContractStatus = 'highlightSortColumn';
            }
            else if(field === 'ProposalStatusInUI'){
                self.classForProposal = 'highlightSortColumn';
            }
        };

        self.spinnerOptions = {
            lines: 8, // The number of lines to draw
            length: 0, // The length of each line
            width: 4, // The line thickness
            radius: 7, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 10, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#333', // #rgb or #rrggbb or array of colors
            speed: 1.5, // Rounds per second
            trail: 0, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: true, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9 // The z-index (defaults to 2000000000)
        };

        function showErrorDialog(message) {
            $log.info('Opening error modal');
            var modalInstance = managedModal.open({
                templateUrl: 'app/main/errorModal.html',
                size: 'lg',
                backdrop: 'static',
                controller: ['$scope', function ($scope) {
                    $scope.message = message;
                    $scope.dismiss = function () {
                        modalInstance.dismiss();
                    };
                }]
            });

            modalInstance.result.then(function () {
                $log.info('Error modal dismissed');
            });
        }

        function editHomeownerInModal(homeownerVM) {
            var modalInstance = homeownerModalService.editHomeownerInModal(homeownerVM);
            modalInstance.result
                .then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    $log.info('Create lead modal dismissed');
                });
        }

        self.editHomeownerInModal = editHomeownerInModal;
        self.openModSolarModal = modSolarModalService.openModSolarModal;
        self.openCallSupportMsgInModal = supportMsgModalService.openCallSupportMsgInModal;
        
        self.getLeadsByPageNo = function(pageNo){
            if(!self.loading){
                var tempPageInfo = localStorageService.get('pageInfo');
                if(pageNo !== tempPageInfo.currentPageNo){
                    tempPageInfo.requestedPage = pageNo;
                    tempPageInfo.currentPageNo = pageNo;
                    if(tempPageInfo.lastPageNo < pageNo){
                        tempPageInfo.lastPageNo = tempPageInfo.lastPageNo + 1;
                    }
                    tempPageInfo.forceReload = true;
                    localStorageService.add('pageInfo', tempPageInfo);
                    self.loading = true;
                    init();
                }
            }
        };
        
        self.getMoreLeads = function(){
            if(!self.loading){
                var tempPageInfo = localStorageService.get('pageInfo');
                if(!tempPageInfo.moreLeadsRequested){
                    if(tempPageInfo.currentPageNo === tempPageInfo.lastPageNo){
                        if(tempPageInfo.nextPageExists){
                            tempPageInfo.moreLeadsRequested = true;
                            tempPageInfo.lastPageNo = tempPageInfo.lastPageNo + 1;
                            tempPageInfo.currentPageNo = tempPageInfo.lastPageNo;
                            tempPageInfo.forceReload = true;
                            localStorageService.add('pageInfo', tempPageInfo);
                            self.loading = true;
                            init();
                        }
                    }else if(tempPageInfo.currentPageNo < tempPageInfo.lastPageNo){
                        self.getLeadsByPageNo(parseInt(tempPageInfo.currentPageNo) + 1);
                    }
                }
            }
        };
        
        self.getPreviousLeads = function (){
            var tempPageInfo = localStorageService.get('pageInfo');
            if(tempPageInfo.currentPageNo !== 1){
		self.getLeadsByPageNo(tempPageInfo.currentPageNo - 1);
            }
        };
        
        function OpenCustomerPage(homeownerVM) {
           CustomerService.OpenCustomerDetails(homeownerVM);           
        }

        self.OpenCustomerPage = OpenCustomerPage;

        function init() {
            //Okta redirect to be done through a relative path through a proxy later.
            if(localStorageService.get('userCurrentRole') === 'PartnerAdmin' || localStorageService.get('userCurrentRole') === 'SalesManager'){
                var temp = localStorageService.get('userCurrentRole');
                homeownerService.getHomeownerViewModelsByPartnerID().then(function (vms) {
                    self.viewModels = vms;
                    var tempPageInfo = localStorageService.get('pageInfo');
                    self.totalNoOfPages = parseInt(tempPageInfo.totalNoOfPages);
                    self.currentPageNo = parseInt(tempPageInfo.currentPageNo);
                    self.nextPageNo = parseInt(tempPageInfo.lastPageNo) + 1;
                    self.nextPageExists = tempPageInfo.nextPageExists;
                    self.lastPageNo = tempPageInfo.lastPageNo;
                    if(parseInt(self.totalNoOfPages) - parseInt(self.nextPageNo) < 1){
                        self.hideTotalPages = true;
                    }
                    if(parseInt(self.currentPageNo) === parseInt(self.totalNoOfPages) || !tempPageInfo.nextPageExists){
                        self.hideNextPage = true;
                    }
                    if(typeof vms !== 'undefined' && vms !== null && Array.isArray(vms)){
                        if(vms.length < 500){                            
                            tempPageInfo.nextPageExists = false;
                            self.disableNextButton = true;                            
                            localStorageService.add('pageInfo', tempPageInfo);
                            if(localStorageService.get('pageInfo').currentPageNo === 1 ){
                                self.enablePagination = false;
                            }else{
                                self.enablePagination = true;
                            }
                        }else{
                            self.enablePagination = true;
                        }
                    }
                    self.pages = [];
                    for(var i = 1; i <= tempPageInfo.lastPageNo; i++){                        
                        self.pages.push(i);
                    }
                    if(!tempPageInfo.nextPageExists && tempPageInfo.currentPageNo === tempPageInfo.lastPageNo){
                        self.disableNextButton = true;
                    }else{
                        self.disableNextButton = false;
                    }
                    self.loading = false;
                });
            }else if(localStorageService.get('userCurrentRole') === null || localStorageService.get('userCurrentRole') === '' || localStorageService.get('userCurrentRole') === 'SalesPerson'){
                homeownerService.getHomeownerViewModelsBySalesPersonID().then(function (vms) {
                    self.viewModels = vms;
                    var tempPageInfo = localStorageService.get('pageInfo');
                    self.totalNoOfPages = parseInt(tempPageInfo.totalNoOfPages);
                    self.currentPageNo = parseInt(tempPageInfo.currentPageNo);
                    self.nextPageNo = parseInt(tempPageInfo.lastPageNo) + 1;
                    self.nextPageExists = tempPageInfo.nextPageExists;
                    self.lastPageNo = tempPageInfo.lastPageNo;
                    if(parseInt(self.totalNoOfPages) - parseInt(self.nextPageNo) < 1){
                        self.hideTotalPages = true;
                    }
                    if(parseInt(self.currentPageNo) === parseInt(self.totalNoOfPages) || !tempPageInfo.nextPageExists){
                        self.hideNextPage = true;
                    }
                    if(typeof vms !== 'undefined' && vms !== null && Array.isArray(vms)){
                        if(vms.length < 500){                            
                            tempPageInfo.nextPageExists = false;
                            self.disableNextButton = true;                            
                            localStorageService.add('pageInfo', tempPageInfo);
                            if(localStorageService.get('pageInfo').currentPageNo === 1 ){
                                self.enablePagination = false;
                            }else{
                                self.enablePagination = true;
                            }
                        }else{
                            self.enablePagination = true;
                        }
                    }
                    self.pages = [];
                    for(var i = 1; i <= tempPageInfo.lastPageNo; i++){                        
                        self.pages.push(i);
                    }
                    if(!tempPageInfo.nextPageExists && tempPageInfo.currentPageNo === tempPageInfo.lastPageNo){
                        self.disableNextButton = true;
                    }else{
                        self.disableNextButton = false;
                    }
                    self.loading = false;
                });
            }
            if($location.host() !=='partner.sunedison.com'){
                $scope.isProdEnv = false;
            }
        }

        function stopSpinner(spinnerId) {
            return usSpinnerService.stop(spinnerId);
        }

        function startSpinner(spinnerId) {
            return usSpinnerService.spin(spinnerId);
        }

        function initiateCreditCheck(homeownerVM) {
            if (!homeownerVM || !homeownerVM.model || !homeownerVM.model.SunEdCustId) {
                $log.error('The homeowner id was not present.  Cannot begin the credit check.');
                return;
            }

            if (homeownerVM.creditCheckInProcess) {
                $log.warn('Credit check is currently in process.  Cannot activate again.');
                return;
            }
            homeownerVM.creditCheckInProcess = true;
            startSpinner(homeownerVM.model.SunEdCustId);

            if (homeownerVM.model.CreditStatus === 'In Process' || homeownerVM.model.CreditStatus === 'Initiated') {
                var modalInstance = managedModal.open({
                    templateUrl: 'app/navbar/resendCreditCheckMsg.html',
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'modal-call-resendCreditCheck-message',
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.cancel = function (val) {
                                $modalInstance.dismiss('cancel');
                                if(!val){
                                    stopSpinner(homeownerVM.model.SunEdCustId);
                                    homeownerVM.creditCheckInProcess = false;
                                }
                            };
                            $scope.proceed = function (value) {
                                if(value){
                                    if(self.PartnerType === 'SALES ENGINE (Seller)'){
                                        chooseCreditCheck(homeownerVM);
                                    }else{
                                         startCreditCheck(homeownerVM);
                                    }
                                }else{
                                    stopSpinner(homeownerVM.model.SunEdCustId);
                                    homeownerVM.creditCheckInProcess = false;
                                }
                                $scope.cancel(true);
                            };
                        }]
                });
            }
            else {
                if(self.PartnerType === 'SALES ENGINE (Seller)'){
                    chooseCreditCheck(homeownerVM);
                }else{
                    startCreditCheck(homeownerVM);
                }
            }
        }
        
        function chooseCreditCheck(homeownerVM){
            var modalInstance = managedModal.open({
                    templateUrl: 'app/navbar/chooseCreditCheck.html',
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'modal-call-resendCreditCheck-message',
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.cancel = function (val) {
                                $modalInstance.dismiss('cancel');
                                if(!val){
                                    stopSpinner(homeownerVM.model.SunEdCustId);
                                    homeownerVM.creditCheckInProcess = false;
                                }
                            };
                            $scope.proceed = function (value) {
                                if(value){
                                    if($('input[name="loanType"]:checked').val() === 'Loan-Mosaic'){
                                        if(homeownerVM.model.FinancingProgram !== 'SunEdison Mosaic SCION' && homeownerVM.model.FinancingProgram !== 'SunEdison Mosaic SCION With Signature Series'){
                                            confirmLeadUpdate(homeownerVM);
                                        }else{
                                            startCreditCheck(homeownerVM);
                                            $scope.cancel(true);
                                        }
                                    }else{
                                        if(homeownerVM.model.FinancingProgram !== 'PPA 1.0'){
                                            confirmLeadUpdate(homeownerVM);
                                        }else{
                                            startCreditCheck(homeownerVM);
                                            $scope.cancel(true);
                                        }
                                    }
                                    
                                }else{
                                    stopSpinner(homeownerVM.model.SunEdCustId);
                                    homeownerVM.creditCheckInProcess = false;
                                    $scope.cancel(true);
                                    
                                }
                                //$scope.cancel(true);
                            };
                        }]
                });
        }
        
        function confirmLeadUpdate(homeownerVM){
            var modalInstance = managedModal.open({
                    templateUrl: 'app/navbar/confirmUpdateLead.html',
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'modal-call-resendCreditCheck-message',
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                        $scope.homeOwnerName = homeownerVM.model.FirstName + ' ' + homeownerVM.model.LastName;
                        $scope.currentPurchaseType = homeownerVM.model.PurchaseType;
                        $scope.cancel = function (val) {
                            $modalInstance.dismiss('cancel');
                            if(!val){
                                stopSpinner(homeownerVM.model.SunEdCustId);
                                homeownerVM.creditCheckInProcess = false;
                            }
                        };
                        $scope.proceed = function (value) {
                            if(value){
                                $scope.cancel(true);
                                editHomeownerInModal(homeownerVM);
                            }else{
                                $scope.cancel(true);
                            }
                                    
                        };
                    }]
            });
        }
        
        function startCreditCheck(homeownerVM) {
            CreditCheck.save({'SunEdCustId': homeownerVM.model.SunEdCustId}).$promise
                    .then(function (data) {
                        // Note that the returned data tracks the user id via the HomeOwnerID property
                        // whereas the actual homeowner endpoint models use the SunEdCustId property.
                        $log.log('Successfully submitted the credit check update event for homeowner: ' + data.HomeOwnerID);
                        return homeownerService.pollHomeownerUntilCreditStatusExists(homeownerVM);
                        //$log.log('status: ' + data.CreditStatus);
                    })
                    .then(function () {
                        delete homeownerVM.creditCheckInProcess;
                        stopSpinner(homeownerVM.model.SunEdCustId);
                    })
                    .catch(function (e) {
                        $log.error(e);
                        $rootScope.$broadcast('backendError', e);
                        delete homeownerVM.creditCheckInProcess;
                        stopSpinner(homeownerVM.model.SunEdCustId);
                    });
        }


        function initiateProposal() {
            $log.warn('This event has not been implemented yet due to lack of API documentation.');
        }

        self.initiateCreditCheck = initiateCreditCheck;
        self.initiateProposal = initiateProposal;

        $scope.$on('backendError', function (event, error) {
            var message;
            if (typeof(error) === 'object') {
                if (error.status && error.data) {
                    message = 'Received error from the server, http status ' + error.status + ':\n' + JSON.stringify(error.data);
                }
                else {
                    message = JSON.stringify(error);
                }
            }
            else {
                message = error;
            }
            showErrorDialog(message);
        });

        init();
    }

    angular
        .module('dealerportal.homeowner', ['dealerportal.format', 'dealerportal.service', 'ui.bootstrap'])
        .controller('HomeownerList', ['managedModal', '$scope', '$log', 'CreditCheck', '$rootScope', 'usSpinnerService', '$location', '$window', 'homeownerService', 'homeownerModalService', 'modSolarModalService', 'supportMsgModalService', 'localStorageService', 'CustomerService', HomeownerList]);
})();
