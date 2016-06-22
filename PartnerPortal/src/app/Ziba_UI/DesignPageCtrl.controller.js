'use strict';

(function () {
    function DesignPageCtrl($state, $scope, $rootScope, $log, sessionService, DesignPage, managedModal, FinanceDetails) {
        var self = this;
        self.roof2 = false;
        self.roof3 = false;
        self.ratearray = [];
        self.loading = true;
        $rootScope.reloaddesignpage = true;
        self.panelmodel = 'SunEdison-Bow:270';
        self.errormsg='', self.presolarconsumption ='9988', self.presolarbill ='4100', self.postsolarbill = '1400';
        self.janprod ='666', self.febprod ='777', self.marprod ='888', self.aprprod ='999', self.mayprod ='787', self.junprod ='576';
        self.julprod ='788', self.augprod ='778', self.sepprod ='669', self.octprod ='766', self.novprod ='477', self.decprod = '747';
        self.tilt_1='22', self.azimuth_1='66', self.shading_1 ='91', self.panelcount_1 = '28';
        self.tilt_2='', self.azimuth_2='', self.shading_2='', self.panelcount_2 = '';
        self.tilt_3='', self.azimuth_3='', self.shading_3='', self.panelcount_3 = '';
        self.yeild = 0;
        self.totalpanelcount = 0;
        self.utilityobjs = [];
        $rootScope.numberofarray = 1;
        
                
        function init(){
            if($rootScope.reloaddesignpage === true){
            DesignPage.get({zip: $rootScope.zip}).$promise
                    .then(function (response) {                        
                        var keys = Object.keys(response);
                        for(var i=0; i<=keys.length-2; i++){
                            var temp = {};
                            temp.name = response[keys[i]].lseName + " - (" + response[keys[i]].tariffName + ")" ;//+ response[keys[i]].tariffCode;
                            temp.id = response[keys[i]].lseId;
                            temp.displayname = response[keys[i]].lseName;
                            temp.title = keys[i];
                            self.utilityobjs.push(temp);
                        }                        
                        self.loading = false;
                    })
                        .catch(function (error) {                        
                        self.loading = false;
                        console.log(error);
                        $state.go('customerDetails');
                });
                $rootScope.reloaddesignpage = false;    
            }
        }
        
        init();
        
        function addroof(){
            if(self.roof2){
                self.roof3 = true;
            }else{
                self.roof2 = true;
            }
        }
        
        function netsuitecall(){
            /*DesignPage.save({homeowner_id: 755183,partner_id: 267067}).$promise   
                    .then(function (response) {
                        console.log(response);
                    });*/
            //self.errormsg = 'Values are blank for -';
            
            if(self.presolarconsumption === '')
                self.errormsg = self.errormsg + ' Pre Solar Annual Consumption, \n';
            if(self.presolarbill === '')
                self.errormsg = self.errormsg + ' Pre Solar Total Annual Utility Bill, \n';
            if(self.postsolarbill === '')
                self.errormsg = self.errormsg + ' Post Solar Total Annual Utility Bill, \n';
            if(self.janprod === '')
                self.errormsg = self.errormsg + ' January production, \n';
            if(self.febprod === '')
                self.errormsg = self.errormsg + ' February production, \n';
            if(self.marprod === '')
                self.errormsg = self.errormsg + ' March production, \n';
            if(self.aprprod === '')
                self.errormsg = self.errormsg + ' April production, \n';
            if(self.mayprod === '')
                self.errormsg = self.errormsg + ' May production, \n';
            if(self.junprod === '')
                self.errormsg = self.errormsg + ' June production, \n';
            if(self.julprod === '')
                self.errormsg = self.errormsg + ' July production, \n';
            if(self.augprod === '')
                self.errormsg = self.errormsg + ' August production, \n';
            if(self.sepprod === '')
                self.errormsg = self.errormsg + ' September production, \n';
            if(self.octprod === '')
                self.errormsg = self.errormsg + ' October production, \n';
            if(self.novprod === '')
                self.errormsg = self.errormsg + ' November production, \n';
            if(self.decprod === '')
                self.errormsg = self.errormsg + ' December production, \n';
            if(self.tilt_1 === '')
                self.errormsg = self.errormsg + ' Tilt for array 1, \n';
            if(self.azimuth_1 === '')
                self.errormsg = self.errormsg + ' Azimuth for array 1, \n';
            if(self.shading_1 === '')
                self.errormsg = self.errormsg + ' Shading for array 1, \n';
            if(self.panelcount_1 === '')
                self.errormsg = self.errormsg + ' Panel Count for array 1. \n';
            $rootScope.numberofarray = 1;
            self.totalpanelcount = self.panelcount_1;
            if(  $("#roof2").is(":visible") === true )
                {
                  if (self.tilt_2 === '')
                    self.errormsg = self.errormsg + ' Tilt for array 2, \n';
                if (self.azimuth_2 === '')
                    self.errormsg = self.errormsg + ' Azimuth for array 2, \n';
                if (self.shading_2 === '')
                    self.errormsg = self.errormsg + ' Shading for array 2, \n';
                if (self.panelcount_2 === '')
                    self.errormsg = self.errormsg + ' Panel Count for array 2, \n';  
                self.totalpanelcount = +self.totalpanelcount + +self.panelcount_2;
                $rootScope.numberofarray = 2;
                }                
            if(  $("#roof3").is(":visible") === true )
                {
                  if (self.tilt_3 === '')
                    self.errormsg = self.errormsg + ' Tilt for array 3, \n';
                if (self.azimuth_3 === '')
                    self.errormsg = self.errormsg + ' Azimuth for array 3, \n';
                if (self.shading_3 === '')
                    self.errormsg = self.errormsg + ' Shading for array 3, \n';
                if (self.panelcount_3 === '')
                    self.errormsg = self.errormsg + ' Panel Count for array 3. \n';  
                self.totalpanelcount = +self.totalpanelcount + +self.panelcount_3;
                $rootScope.numberofarray = 3;
                }
            
               if (self.janprod !== '' && self.febprod !== '' && self.marprod !== '' && self.aprprod !== '' && self.mayprod !== '' && self.junprod !== ''
                    && self.julprod !== '' && self.augprod !== '' && self.sepprod !== '' && self.octprod !== '' && self.novprod !== '' && self.decprod !== '') {
                
                $rootScope.totalprod = +self.janprod + +self.febprod + +self.marprod + +self.aprprod + +self.mayprod + +self.junprod +
                                        +self.julprod + +self.augprod + +self.sepprod + +self.octprod + +self.novprod + +self.decprod;                
                
                $rootScope.systemsize = (self.totalpanelcount*270/1000).toFixed(2);
                $rootScope.yeild = ($rootScope.totalprod / $rootScope.systemsize).toFixed(2);
                
                if ($rootScope.yeild < 1100)
                    self.errormsg = self.errormsg + 'System size generated is not acceptable. \n';
            }
            
                
            if (self.errormsg !== '') {
                showErrorDialog(self.errormsg);
                self.errormsg = '';
                //$state.go('financeoption');
            }
            else
            {                
                var arraydetails = {
                'array':[
                {
                    'ArrayNumber': '1',
                    'MountType': 'Sloped roof',
                    'InverterModel': 'Enphase',
                    'Tilt': '20',
                    'Azimuth': '90',
                    'AnnualShading': '9500',
                    'ModuleQuantity':'12'
                }]
                };  
                $rootScope.presolarconsumption = self.presolarconsumption;
                $rootScope.presolarbill = self.presolarbill;
                $rootScope.postsolarbill = self.postsolarbill;
                $rootScope.utilityprovider =  $("#utilityinput :selected").attr('name');
                //var arraydetails = [];
                arraydetails.array[0].ArrayNumber = 1;
                arraydetails.array[0].MountType = 'Sloped roof';
                arraydetails.array[0].InverterModel = self.inverterinput;
                arraydetails.array[0].Tilt = self.tilt_1;
                arraydetails.array[0].Azimuth = self.azimuth_1;
                arraydetails.array[0].AnnualShading = self.shading_1;
                arraydetails.array[0].ModuleQuantity = self.panelcount_1;
                arraydetails.array[0].ModuleType = 'SE-BOW-270';
                arraydetails.numberofarray = 1;
                if(  $("#roof2").is(":visible") === true )
                {
                    //arraydetails.array.push(arraydetails.array[0]);
                    arraydetails.array.push({});
                    arraydetails.array[1].ArrayNumber = 2;
                    arraydetails.array[1].Tilt = self.tilt_2;
                    arraydetails.array[1].Azimuth = self.azimuth_2;
                    arraydetails.array[1].AnnualShading = self.shading_2;
                    arraydetails.array[1].ModuleQuantity = self.panelcount_2;
                    arraydetails.array[1].ModuleType = 'SE-BOW-270';
                    arraydetails.array[1].MountType = 'Sloped roof';
                    arraydetails.array[1].InverterModel = self.inverterinput;
                    arraydetails.numberofarray = 2;
                }
                if(  $("#roof3").is(":visible") === true )
                {
                    arraydetails.array.push({});
                    arraydetails.array[2].ArrayNumber = 3;
                    arraydetails.array[2].Tilt = self.tilt_3;
                    arraydetails.array[2].Azimuth = self.azimuth_3;
                    arraydetails.array[2].AnnualShading = self.shading_3;
                    arraydetails.array[2].ModuleQuantity = self.panelcount_3;
                    arraydetails.array[2].ModuleType = 'SE-BOW-270';
                    arraydetails.array[2].MountType = 'Sloped roof'; 
                    arraydetails.array[2].InverterModel = self.inverterinput;
                    arraydetails.numberofarray = 3;  
                }            
                $rootScope.arraydetails = [];
                for( var i=0; i<arraydetails.numberofarray; i++)
                    $rootScope.arraydetails.push(arraydetails.array[i]);  
                $rootScope.utilityLseid = $("#utilityinput :selected").val();                                
                $rootScope.designtofinance = 1;
                $state.go('financeoption');
            }
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
        
        self.showErrorDialog = showErrorDialog;
        self.netsuitecall = netsuitecall;
        self.addroof = addroof;

        }

    angular
        .module('dealerportal.designpage', ['dealerportal.service', 'ui.router', 'ui.bootstrap'])
        .controller('DesignPageCtrl', ['$state', '$scope','$rootScope', '$log', 'sessionService', 'DesignPage', 'managedModal', 'FinanceDetails', DesignPageCtrl]);
})();