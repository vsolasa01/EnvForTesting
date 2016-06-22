'use strict';
(function () {
    function DashboardController($scope, $window, localStorageService, $rootScope, Partner) {
        var self = this;
        var tempPageInfo = localStorageService.get('pageInfo');
        $scope.searchText = '';
        self.pages = [];
        self.currentPageNo = tempPageInfo.currentPageNo;
        self.moreLeadsRequested = tempPageInfo.moreLeadsRequested;
        self.partnerList = localStorageService.get('partnerList');
        if(!tempPageInfo.nextPageExists && tempPageInfo.currentPageNo === tempPageInfo.lastPageNo){
            self.disableNextButton = true;
        }
        self.userCurrentRole = localStorageService.get('userCurrentRole');
        self.chosenPartner = localStorageService.get('se-chosenPartner');
	if(typeof self.partnerList !== 'undefined' && self.partnerList){
           for(var i=0; i<self.partnerList.length; i++){
                if(self.chosenPartner === self.partnerList[i].partnerRecId){
                    $scope.searchPartner = self.partnerList[i].Name;
                }
            } 
        }
        
        if(localStorageService.get('userCurrentRole') === "SalesManager" && !self.partnerList){
            Partner.query({}).$promise.then(function(data){
                self.partnerList = data;
                localStorageService.add('partnerList', data);
                for(var i=0; i<data.results.length; i++){
                    if(self.chosenPartner === data[i].partnerRecId){
                        $scope.searchPartner = data[i].Name;
                    }
                }
            });
        }
        if(localStorageService.get('se-chosenPartnerName')){
            $scope.searchPartner = localStorageService.get('se-chosenPartnerName');
        }
        
        self.changePartner = function(partner) {
            $rootScope.loading = true;
            var tempPageInfo = localStorageService.get('pageInfo');
            tempPageInfo.forceReload = true;
            localStorageService.add('pageInfo', tempPageInfo);
            self.chosenPartner = partner.partnerRecId;
            localStorageService.add('se-chosenPartner', self.chosenPartner);
            var userDetails = localStorageService.get('se-user');
            $scope.searchPartner = partner.Name;
            localStorageService.add('se-chosenPartnerName', $scope.searchPartner);
            userDetails.profile.PartnerType = partner.PartnerSubType;
            localStorageService.add('se-user', userDetails);
            var tempPageInfo = {};
            tempPageInfo.forceReload = true;
            tempPageInfo.pageDetails = {};
            tempPageInfo.pageDetails['1'] = '';
            tempPageInfo.lastPageNo = 1;
            tempPageInfo.currentPageNo = 1;
            tempPageInfo.nextPageExists = true;
            localStorageService.add('pageInfo', tempPageInfo);
            /*for(var i=0; i<self.partnerList.length; i++){
                if(self.partnerList[i].partnerRecId === self.chosenPartner){
                    userDetails.profile.PartnerType = self.partnerList[i].PartnerSubType;
                    localStorageService.add('se-user', userDetails);
                    break;
                }
            }*/
            $window.location.reload(true);
        };
        
        var totalPages = tempPageInfo.lastPageNo;
        if(totalPages === null || totalPages === 0 || totalPages === '' || totalPages === undefined || totalPages === '0'){
            totalPages =1;
        }
        for(var i = 1; i <= tempPageInfo.lastPageNo; i++){
            self.pages.push(i);
        }
        function getLeadsByPageNo(pageNo){
           
            var tempPageInfo = localStorageService.get('pageInfo');
            if(pageNo !== tempPageInfo.currentPageNo){                        
                tempPageInfo.requestedPage = pageNo;
                tempPageInfo.currentPageNo = pageNo;
                localStorageService.add('pageInfo', tempPageInfo);
                $window.location.reload(true);
            }
        }
        function getMoreLeads(){
            var tempPageInfo = localStorageService.get('pageInfo');
            if(!tempPageInfo.moreLeadsRequested){
                if(tempPageInfo.currentPageNo === tempPageInfo.lastPageNo){
                    if(tempPageInfo.nextPageExists){
                        tempPageInfo.moreLeadsRequested = true;
                        tempPageInfo.lastPageNo = tempPageInfo.lastPageNo + 1;
                        tempPageInfo.currentPageNo = tempPageInfo.lastPageNo;
                        localStorageService.add('pageInfo', tempPageInfo);
                        $window.location.reload(true);
                    }
                }else if(tempPageInfo.currentPageNo < tempPageInfo.lastPageNo){
                    getLeadsByPageNo(parseInt(tempPageInfo.currentPageNo) + 1);
                }
            }
        }
        function getPreviousLeads(){
            var tempPageInfo = localStorageService.get('pageInfo');
            if(tempPageInfo.currentPageNo !== 1){                
                getLeadsByPageNo(tempPageInfo.currentPageNo - 1);
            }
        }
        self.getLeadsByPageNo = getLeadsByPageNo;
        self.getMoreLeads = getMoreLeads;
        self.getPreviousLeads = getPreviousLeads;
    }

    angular
        .module('dealerportal.dashboard', [])
        .controller('DashboardController', ['$scope', '$window', 'localStorageService', '$rootScope', 'Partner', DashboardController]);
})();
