'use strict';

(function () {
    function ProjectStatusCtrl(managedModal, $state, $scope,$rootScope, $log, sessionService, localStorageService, $location, ProjectStatus) {
        var self = this;
        $rootScope.searchText='';
        self.reverse = true;
        self.projectStatusDataList = null;
        self.loading = true;
        self.currentSubTab = 'all';
        self.userSubRole = 'IntegratedDealer';
        var userProfile = localStorageService.get('se-user');
        /*if($location.host()==='salesportal.sunedison.com.au'){
            //to be added before production deployment
            if(userProfile.profile.PartnerId === '226055'){
               self.userSubRole = 'SalesEngine'; 
            }
        }else{
           if(userProfile.profile.PartnerId === '226055'){
               self.userSubRole = 'SalesEngine'; 
            }
        }*/
        if(userProfile.profile.PartnerType === 'SALES ENGINE (Seller)'){
            self.userSubRole = 'SalesEngine';
        }
        self.exportToExcel = function(){
          var tempStatusDataList = $scope.projectStatusDataList;
          /*for(var i=0; i<$scope.projectStatusDataList.length; i++){
              tempStatusDataList.push($scope.projectStatusDataList[i]);
          }*/
            
        if(self.userSubRole === 'IntegratedDealer'){
          if($state.includes('design')){
              alasql('SELECT FirstName, LastName, ContractSignedDate, City, State, PurchaseType, PdaphaseStatus,\n\
                       LastUpdatedOn, Mp1Status, Mp1ApprovalDate INTO XLSX("ProjectStatus.xlsx",{headers:true}) FROM ?',[tempStatusDataList]); 

          }else{
            if(self.currentSubTab === 'all'){  
              alasql('SELECT FirstName, LastName, ContractSignedDate, City, State, PurchaseType, PdaphaseStatus, LastUpdatedOn, Mp1Status, Mp1ApprovalDate, EquipmentStatus, EquipmentDate, \n\
                          SmartComm, Mp2Status, Mp2ApprovalDate, InterconnectionSignOffDate, Mp3DocStatusDate, Ptophase, Ptodate, Mp3Status, Mp3ApprovalDate INTO XLSX("ProjectStatus.xlsx",{headers:true}) FROM ?',[tempStatusDataList]); 

              }else if(self.currentSubTab === 'permitEquipment'){
                  alasql('SELECT FirstName, LastName, ContractSignedDate, City, State, PurchaseType, EquipmentStatus, EquipmentDate INTO XLSX("ProjectStatus.xlsx",{headers:true}) FROM ?',[tempStatusDataList]);        
              }
              else if(self.currentSubTab === 'installation'){
                  alasql('SELECT FirstName, LastName, ContractSignedDate, City, State, PurchaseType, \n\
                          SmartComm, Mp2Status, Mp2ApprovalDate INTO XLSX("ProjectStatus.xlsx",{headers:true}) FROM ?',[tempStatusDataList]); 

              }
              else if(self.currentSubTab === 'interconnection'){
                  alasql('SELECT FirstName, LastName, ContractSignedDate, City, State, PurchaseType, SunEApprovalToApplyForPTO, \n\
                          InterconnectionSignOffDate, Mp3DocStatusDate, Ptophase, Ptodate, Mp3Status, Mp3ApprovalDate INTO XLSX("ProjectStatus.xlsx",{headers:true}) FROM ?',[tempStatusDataList]); 

              }
          }
        }
        else{
          if($state.includes('design')){
             alasql('SELECT FirstName, LastName, ContractSignedDate, City, State, PurchaseType, ScionInstaller, SiteVisitStatus, SiteVisitDate, PdaphaseStatus,\n\
                       LastUpdatedOn, Mp1Status, Mp1ApprovalDate INTO XLSX("ProjectStatus.xlsx",{headers:true}) FROM ?',[tempStatusDataList]); 


          }else{
            if(self.currentSubTab === 'all'){
            alasql('SELECT FirstName, LastName, ContractSignedDate, City, State, PurchaseType, ScionInstaller, AssignedCPM, SiteVisitStatus, SiteVisitDate, PdaphaseStatus,\n\
                       LastUpdatedOn, Mp1Status, Mp1ApprovalDate, PermitStatus, PermitStatusDate, EquipmentStatus, EquipmentDate, \n\
                          InstallationStatus, InstallationStatusDate, MainPanelUpdateReq, SmartComm, AHJInspectionStatus, AHJInspectionDate, Mp2Status, \n\
                              Mp2ApprovalDate, UtilityInterconnection, InterconnectionSignOffDate, Mp3DocStatusDate, Ptophase, Ptodate, Mp3Status, Mp3ApprovalDate INTO XLSX("ProjectStatus.xlsx",{headers:true}) FROM ?',[tempStatusDataList]); 


              }else if(self.currentSubTab === 'permitEquipment'){
                  alasql('SELECT FirstName, LastName, ContractSignedDate, City, State, PurchaseType, ScionInstaller, AssignedCPM, PermitStatus, PermitStatusDate, EquipmentStatus, EquipmentDate INTO XLSX("ProjectStatus.xlsx",{headers:true}) FROM ?',[tempStatusDataList]);        
              }
              else if(self.currentSubTab === 'installation'){
                  alasql('SELECT FirstName, LastName, ContractSignedDate, City, State, PurchaseType, ScionInstaller, AssignedCPM, InstallationStatus, InstallationStatusDate, MainPanelUpdateReq, \n\
                          SmartComm, AHJInspectionStatus, AHJInspectionDate, Mp2Status, Mp2ApprovalDate INTO XLSX("ProjectStatus.xlsx",{headers:true}) FROM ?',[tempStatusDataList]); 

              }
              else if(self.currentSubTab === 'interconnection'){
                  alasql('SELECT FirstName, LastName, ContractSignedDate, City, State, PurchaseType, ScionInstaller, AssignedCPM, SunEApprovalToApplyForPTO, \n\
                          UtilityInterconnection, InterconnectionSignOffDate, Mp3DocStatusDate, Ptophase, Ptodate, Mp3Status, Mp3ApprovalDate INTO XLSX("ProjectStatus.xlsx",{headers:true}) FROM ?',[tempStatusDataList]); 

              }
          }
        }
        }; 
        
        self.changeSubTab = function(subTab){
            self.currentSubTab = subTab;            
            //console.log(self.currentSubTab);
        };
        
        self.order = function (field) {
            self.changeClass(field);
            self.viewModels = self.orderBy($scope.projectStatusDataList, field);
        };
        self.orderBy = function(items, field){
            items.sort(function (a, b) {
                if(a[field] && b[field]){
                    return (a[field].toUpperCase()> b[field].toUpperCase() ? 1 : -1);
                }
                });
            if(self.reverse){
                items.reverse();
            }
            self.reverse = !self.reverse;
            return items;
        };
        
        self.changeClass = function(field){
            self.classForFN='defaultSortColumn';
            self.classForLN='defaultSortColumn';
            self.classForHomePhone='defaultSortColumn';
            self.classForStreet='defaultSortColumn';
            self.classForCity='defaultSortColumn';
            self.classForState='defaultSortColumn';
            self.classForZip='defaultSortColumn';
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
        };
        
        self.changeView = function(){
            
        };
        
        function init() {
            
            ProjectStatus.query({PartnerId: sessionService.user.profile.PartnerId}).$promise
                .then(function (data) {
                   $scope.projectStatusDataList = data;
                   for(var i=0; i<$scope.projectStatusDataList.length; i++){
                        if(!_.isEmpty($scope.projectStatusDataList[i].FirstName) && $scope.projectStatusDataList[i].FirstName.length > 15 ){
                            $scope.projectStatusDataList[i].FirstNameForUI = $scope.projectStatusDataList[i].FirstName.substring(0, 14) + '...';
                        }else{
                            $scope.projectStatusDataList[i].FirstNameForUI = $scope.projectStatusDataList[i].FirstName;
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].LastName) && $scope.projectStatusDataList[i].LastName.length > 15 ){
                            $scope.projectStatusDataList[i].LastNameForUI = $scope.projectStatusDataList[i].LastName.substring(0, 14) + '...';
                        }else{
                            $scope.projectStatusDataList[i].LastNameForUI = $scope.projectStatusDataList[i].LastName;
                        }                        
                        if(!_.isEmpty($scope.projectStatusDataList[i].SiteVisitDate)){
                            $scope.projectStatusDataList[i].SiteVisitDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].SiteVisitDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].ContractSignedDate)){
                            $scope.projectStatusDataList[i].ContractSignedDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].ContractSignedDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].PdaapprovalDate)){
                            $scope.projectStatusDataList[i].PdaapprovalDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].PdaapprovalDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].LastUpdatedOn)){
                            $scope.projectStatusDataList[i].LastUpdatedOn = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].LastUpdatedOn.split('T')[0]);
                        }if(!_.isEmpty($scope.projectStatusDataList[i].PromisedInstallDate)){
                            $scope.projectStatusDataList[i].PromisedInstallDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].PromisedInstallDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].SubstantialCompletionDate)){
                            $scope.projectStatusDataList[i].SubstantialCompletionDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].SubstantialCompletionDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].Ptodate)){
                            $scope.projectStatusDataList[i].Ptodate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].Ptodate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].Mp1ApprovalDate)){
                            $scope.projectStatusDataList[i].Mp1ApprovalDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].Mp1ApprovalDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].Mp2ApprovalDate)){
                            $scope.projectStatusDataList[i].Mp2ApprovalDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].Mp2ApprovalDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].SePermitSubmitDate)){
                            $scope.projectStatusDataList[i].SePermitSubmitDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].SePermitSubmitDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].AhjinspectApprovalDate)){
                            $scope.projectStatusDataList[i].AhjinspectApprovalDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].AhjinspectApprovalDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].CommissionDate)){
                            $scope.projectStatusDataList[i].CommissionDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].CommissionDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].Mp3ApprovalDate)){
                            $scope.projectStatusDataList[i].Mp3ApprovalDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].Mp3ApprovalDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].Mp3DocStatusDate)){
                            $scope.projectStatusDataList[i].Mp3DocStatusDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].Mp3DocStatusDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].InterconnectionSignOffDate)){
                            $scope.projectStatusDataList[i].InterconnectionSignOffDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].InterconnectionSignOffDate.split('T')[0]);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].InstallationCommissionDate)){
                            $scope.projectStatusDataList[i].InstallationCommissionDate = formatDateAsMMDDYYYY($scope.projectStatusDataList[i].InstallationCommissionDate.split('T')[0]);
                        }                        
                        if(!_.isEmpty($scope.projectStatusDataList[i].Mp1PaymentAmount)){
                            $scope.projectStatusDataList[i].Mp1PaymentAmount = '$' + parseFloat($scope.projectStatusDataList[i].Mp1PaymentAmount).toFixed(2);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].Mp2PaymentAmount)){
                            $scope.projectStatusDataList[i].Mp2PaymentAmount = '$' + parseFloat($scope.projectStatusDataList[i].Mp2PaymentAmount).toFixed(2);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].Mp3PaymentAmount)){
                            $scope.projectStatusDataList[i].Mp3PaymentAmount = '$' + parseFloat($scope.projectStatusDataList[i].Mp3PaymentAmount).toFixed(2);
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].ServicePanelUpgrade)){
                            if($scope.projectStatusDataList[i].ServicePanelUpgrade === 'true' || $scope.projectStatusDataList[i].ServicePanelUpgrade === true){
                                $scope.projectStatusDataList[i].ServicePanelUpgrade = 'Yes';
                            }else{
                                $scope.projectStatusDataList[i].ServicePanelUpgrade = 'No';
                            }
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].TrancheId)){
                            console.log($scope.projectStatusDataList[i].TrancheId);
                            $scope.projectStatusDataList[i].SunEApprovalToApplyForPTO = 'Yes';
                        }else{
                            $scope.projectStatusDataList[i].SunEApprovalToApplyForPTO = 'No';
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].ScionInstaller)){
                            $scope.projectStatusDataList[i].Installer = $scope.projectStatusDataList[i].ScionInstaller;
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].SePermitStatus)){
                            $scope.projectStatusDataList[i].PermitStatus = $scope.projectStatusDataList[i].SePermitStatus;
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].SePermitSubmitDate)){
                            $scope.projectStatusDataList[i].PermitStatusDate = $scope.projectStatusDataList[i].SePermitSubmitDate;
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].SeInstallStatus)){
                            $scope.projectStatusDataList[i].InstallationStatus = $scope.projectStatusDataList[i].SeInstallStatus;
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].InstallationCommissionDate)){
                            $scope.projectStatusDataList[i].InstallationStatusDate = $scope.projectStatusDataList[i].InstallationCommissionDate;
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].ServicePanelUpgrade)){
                            if($scope.projectStatusDataList[i].ServicePanelUpgrade === 'true' || $scope.projectStatusDataList[i].ServicePanelUpgrade === true){
                                $scope.projectStatusDataList[i].MainPanelUpdateReq = 'Yes';
                            }else{
                                $scope.projectStatusDataList[i].MainPanelUpdateReq = 'No';
                            }
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].CommissionDate)){
                            $scope.projectStatusDataList[i].SmartComm = $scope.projectStatusDataList[i].CommissionDate;
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].AhjinspectStatus)){
                            $scope.projectStatusDataList[i].AHJInspectionStatus = $scope.projectStatusDataList[i].AhjinspectStatus;
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].AhjinspectApprovalDate)){
                            $scope.projectStatusDataList[i].AHJInspectionDate = $scope.projectStatusDataList[i].AhjinspectApprovalDate;
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].AhjinspectApprovalDate)){
                            $scope.projectStatusDataList[i].AHJInspectionDate = $scope.projectStatusDataList[i].AhjinspectApprovalDate;
                        }
                        /*if(!_.isEmpty($scope.projectStatusDataList[i].Street) && $scope.projectStatusDataList[i].Street.length > 25 ){
                            $scope.projectStatusDataList[i].StreetForUI = $scope.projectStatusDataList[i].Street.substring(0, 25) + '...';
                        }else{
                            $scope.projectStatusDataList[i].StreetForUI = $scope.projectStatusDataList[i].Street;
                        }
                        if(!_.isEmpty($scope.projectStatusDataList[i].ContractSignedDate)){
                            //var siteVisitTime = $scope.projectStatusDataList[i].SiteVisitDate.split('T')[0] + $scope.projectStatusDataList[i].SiteVisitDate.split('T')[1];
                            //var difference = Math.abs(toSeconds(siteVisitTime));
                            var siteVisitDate = $scope.projectStatusDataList[i].SiteVisitDate.split('T')[0] + ' ' + $scope.projectStatusDataList[i].SiteVisitDate.split('T')[1].split('-')[1];
                            var contractSignedDate = $scope.projectStatusDataList[i].ContractSignedDate.split('T')[0] + ' ' + $scope.projectStatusDataList[i].ContractSignedDate.split('T')[1].split('-')[1];
                            var diffForSiteVisitDate = dateStringToTimeStamp(siteVisitDate, contractSignedDate);
                            if(diffForSiteVisitDate <= 72){
                                $scope.projectStatusDataList[i].SiteVisitDateStatus = 'green';
                            }
                            else if(diffForSiteVisitDate >= 72 && diffForSiteVisitDate <= 120){
                                $scope.projectStatusDataList[i].SiteVisitDateStatus = 'orange';
                            } 
                            else if(diffForSiteVisitDate >= 120){
                                $scope.projectStatusDataList[i].SiteVisitDateStatus = 'red';
                            }
                            
                            diffForSiteVisitDate = dateStringToTimeStamp(siteVisitDate, null);
                            if(diffForSiteVisitDate <= 48 || $scope.projectStatusDataList[i].PdaphaseStatus === 'Signed by SunEdison'){
                                $scope.projectStatusDataList[i].PdaphaseStatusIndicator = 'green';
                            }
                            else if(diffForSiteVisitDate >= 48 && $scope.projectStatusDataList[i].PdaphaseStatus !== 'Signed by SunEdison'){
                                $scope.projectStatusDataList[i].PdaphaseStatusIndicator = 'orange';
                            }else if(diffForSiteVisitDate >= 96 && $scope.projectStatusDataList[i].PdaphaseStatus !== 'Signed by SunEdison'){
                                $scope.projectStatusDataList[i].PdaphaseStatusIndicator = 'red';
                            }                                                      
                        }               
                        if($scope.projectStatusDataList[i].PromisedInstallDate !== null && $scope.projectStatusDataList[i].PromisedInstallDate !== '' && $scope.projectStatusDataList[i].SubstantialCompletionDate !== null && $scope.projectStatusDataList[i].SubstantialCompletionDate !== ''){
                            
                            var substantialCompletionDate = $scope.projectStatusDataList[i].SubstantialCompletionDate.split('T')[0]+ ' ' + $scope.projectStatusDataList[i].SubstantialCompletionDate.split('T')[1].split('-')[1];
                            var promisedInstallDate = $scope.projectStatusDataList[i].PromisedInstallDate.split('T')[0]+ ' ' + $scope.projectStatusDataList[i].PromisedInstallDate.split('T')[1].split('-')[1];
                            var diffForPromisedInstallDate = dateStringToTimeStamp(substantialCompletionDate, promisedInstallDate);
                            if(diffForPromisedInstallDate <= 72){
                                $scope.projectStatusDataList[i].SubstantialCompletionDateStatus = 'green';
                            }
                            else if(diffForPromisedInstallDate >= 72 && diffForPromisedInstallDate <= 120){
                                $scope.projectStatusDataList[i].SubstantialCompletionDateStatus = 'orange';
                            }else if(diffForPromisedInstallDate >= 120){
                                $scope.projectStatusDataList[i].SubstantialCompletionDateStatus = 'red';
                            }                            
                        }*/                       
                   }
                   self.loading = false;
                });
        }
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
        
        function dateStringToTimeStamp(dateString1, dateString2){
            var dateParts1 = dateString1.split(' ');
            var timeParts1 = dateParts1[1].split(':');
            dateParts1 = dateParts1[0].split('-');            
            var date1 = new Date(dateParts1[0], dateParts1[1]-1, dateParts1[2], timeParts1[0], timeParts1[1]).getTime();			
            
            if(dateString2 !== null && dateString2 !== ''){
                var dateParts2 = dateString2.split(' ');
                var timeParts2 = dateParts2[1].split(':');
                dateParts2 = dateParts2[0].split('-');            
                var date2 = new Date(dateParts2[0], dateParts2[1]-1, dateParts2[2], timeParts2[0], timeParts2[1]).getTime();
                //var temp = ((123456789)/3600000)|0;
                
                return ((date1 - date2)/3600000)|0;
            }else{                
                return ((new Date().getTime() - date1)/3600000)|0;
            }
        }
        function formatDateAsMMDDYYYY(dateString){
            var tempDateArray = dateString.split('-');
            return tempDateArray[1] + '-' + tempDateArray[2] + '-' + tempDateArray[0];
        }            
    }

    

    angular
        .module('dealerportal.projectStatus', ['dealerportal.service', 'ui.router', 'ui.bootstrap'])
        .controller('ProjectStatusCtrl', ['managedModal', '$state', '$scope','$rootScope', '$log', 'sessionService', 'localStorageService', '$location', 'ProjectStatus',ProjectStatusCtrl]);
})();