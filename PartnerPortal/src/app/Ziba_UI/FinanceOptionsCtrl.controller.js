'use strict';

(function () {
    function FinanceOptionsCtrl($timeout, $state, $scope, $rootScope, $log, sessionService, FinanceDetails, DesignSave, FinanceCalc, DesignDetails, DeleteProposal, managedModal, Payment, LoanPayment, localStorageService, Incentives, PricingConversion_v2, $window, $location, PricingConversion_v1) {
        var self = this;
        self.utility = false;
        self.analysis = false;
        self.openutility = '';
        self.openanalysis = '';
        self.cancel = '';
        self.loading = true;
        self.spinnersaving = false;
        self.savingdone = false;  
        self.saveDisabled = false;
        var cashflagSE = true;
        var cashssflagSE = true;
        var mosaicflag = true;
        var mosaicssflag = true;
        var leaseflag = true;
        var ppaflag =true;
        var retrievedObject; 
        var leaseescalatorrate;
        var ppaescalatorrate;
        var mosaicterm = 0;
        var mosaicssterm = 0;
        $scope.cash_totalproduction = 0;
        $scope.cashss_totalproduction = 0;
        $scope.lease_totalproduction = 0;
        $scope.ppa_totalproduction = 0;
        $scope.ppa_totalproduction = 0;
        $rootScope.cashfinanceprog ='';
        var LeasePayments = [];
        var MosaicPayments = [];
        var MosaicssPayments = [];
        var PPAPayments = [];
        var financeinfo = [];
        var CashPaymentsSE = [];
        var CashssPaymentsSE = [];
        var clonedProposal = null;
        self.showincentive = false;
        self.showITC = false;
        var firstincentivecall = true;
        //$scope.kwhtowattflag = false;
        //$scope.watttokwhflag = false;
        self.buildbutton = false;
        $scope.cashsavingsflag = true;
        $scope.cashsssavingsflag = true;
        $scope.mosaicsavingsflag = true;
        $scope.mosaicsssavingsflag = true;
        $scope.leasesavingsflag = true;
        $scope.ppasavingsflag = true;
        $scope.UpfrontRebateAssumptionsMax = 0;
        $scope.UpfrontRebateAssumptions = 0;
        $scope.incentivechecked = false;
        $scope.incentiveconversion = false;
        $scope.ITCChecked = false;
        self.variablePricing_cash = true;
        self.variablePricing_cashss = true;
        self.variablePricing_lease = true;
        self.variablePricing_ppa = true;
        self.setvariable_cash = "variableproperty";
        self.setvariable_cashss = "variableproperty";
        self.setvariable_lease = "variableproperty";
        self.setvariable_ppa = "variableproperty";
        self.Cash_options = [{label:"Cash (SCION)", value:"cash"},{label:"Cash Variable (SCION)", value:"cash_variable"}];
        self.CashSS_options = [{label:"Cash SS (SCION)", value:"cashss"},{label:"Cash SS Variable (SCION)", value:"cashss_variable"}];
        self.PPA_options = [{label:"PPA (SCION)", value:"ppa"},{label:"PPA Variable (SCION)", value:"ppa_variable"}];
        $scope.VariablePricing = false;
        $scope.cashflag = "";
        $scope.escalatorapiflag = true;
        $scope.pricingconversionflag = true;
        $scope.pricingpaymentflag = true;
        $scope.elligblestate = true;
        
        if($rootScope.mediumtype === 'Sales Engine'){
            self.dealertypeview = true;
            $rootScope.dealer = 'SE';
        }
        else{
            self.dealertypeview = false;
            $rootScope.dealer = 'ID';
        }
        
        function init(){
            $scope.custom = true;
            self.SE_checked= 11;
            self.ID_checked= 1; 
            $rootScope.envelopeId = "";
            $rootScope.proposaltitle = self.proposaltitle;            
            var profileObject = JSON.parse(localStorage.getItem('ls.se-user'));
            $rootScope.PartnerType = profileObject.profile.PartnerType;
            
            if($rootScope.designtofinance === 1){                
                retrievedObject = localStorageService.get('ProposalTool');//JSON.parse(localStorage.getItem('ProposalTool'));
                self.proposaltitle = retrievedObject.proposaltitle; 
                designtofinance();               
            }
            else
                customertofinance();      
        } 
        
        $scope.togglePrice = function() {
            $scope.custom === false ? true: false;

        };
        
        function showutilitycategory() {
            if (self.openutility === 'open'){
                self.openutility = '';
                self.utility = false;
            }
            else{
                self.openutility = 'open';
                self.utility = true;
            }
        }
        
        function showanalysiscategory(){
            if (self.openanalysis === 'open'){
                self.openanalysis = '';
                self.analysis = false;
            }
            else{
                self.openanalysis = 'open';
                self.analysis = true;
            }
        }
        
        function showhidecancelbox(){
            if(self.cancel === ''){
                self.cancel = 'save-cancel';
            }
            else{
                self.cancel = '';
            }
        }
        
        function showErrorDialog(message) {
            $log.info('Opening error modal');
            var modalInstance = managedModal.open({
                templateUrl: 'app/main/errorModal.html',
                //size: 'lg',
                backdrop: 'static',
                controller: ['$scope', function ($scope) {
                    $scope.message = message;
                    $scope.dismiss = function () {
                        modalInstance.dismiss();
                    };
                }],
             windowClass: 'alert-modal'
            });
            modalInstance.result.then(function () {
                $log.info('Error modal dismissed');
            });
        }
        
	function checkFirstVisit() {
            if(!localStorageService.get('FirstVisitToFinance') || localStorageService.get('FirstVisitToFinance') === 'false') {
              localStorageService.set('FirstVisitToFinance', 'true');
              localStorageService.remove('FirstVisitToDesign');
              localStorageService.remove('FirstVisitToProposalView');
            }
            else {
              if(localStorageService.get('FirstVisitToFinance') === 'true') {
                localStorageService.set('FirstVisitToFinance', 'false');
                $window.location.replace($location.absUrl().replace($window.location.hash, '#/customerdetails'));
              }
            }
        }
        checkFirstVisit();
                
        init();
        
        function designtofinance(){           
                        
            self.panelarrays = [];            
            for(var i=0; i<retrievedObject.Array.length; i++){
                self.panelarrays.push(retrievedObject.Array[i]);
                var annualshade = 0;
                for(var j=0; j<12;j++)
                    annualshade = +annualshade + +retrievedObject.Array[i].Shading[j];
                annualshade = annualshade/12;
                self.panelarrays[i].AnnualShading = (annualshade).toFixed(0);                
            }
            self.customername = ((retrievedObject.customername).replace(/%20/g, " ")).replace(/%27/g, "'");
            self.presolarconsumption = numberWithCommas(retrievedObject.annualusage);
            self.avgcostofelectricity = parseFloat(retrievedObject.avgcostofelectricity);
            self.presolarmonthly = numberWithCommas((retrievedObject.presolarutility));
            self.postsolarmonthly = numberWithCommas((retrievedObject.postsolarutility));
            self.billsavings = numberWithCommas((retrievedObject.presolarutility - retrievedObject.postsolarutility));
            self.utilityprovider = retrievedObject.utilityprovider;
            if(retrievedObject.taxrate)
                self.taxrate = parseInt(retrievedObject.taxrate);
            else
                self.taxrate = 0;
            self.totalprod = numberWithCommas((retrievedObject.year1production));
            self.systemsize = parseFloat(retrievedObject.systemsize).toFixed(2);
            self.yield = numberWithCommas((retrievedObject.systemyield));
            self.annualoffset = numberWithCommas((retrievedObject.offset));            
            self.proposaltitle = retrievedObject.proposaltitle;
            $rootScope.numberofarray = parseInt(retrievedObject.Array.length);
            $rootScope.arraydetails = self.panelarrays;
            $rootScope.presolarconsumption = removeCommaFromNumbers(retrievedObject.annualusage);
            $rootScope.presolarbill = retrievedObject.presolarutility;
            $rootScope.postsolarbill = retrievedObject.postsolarutility;
            $rootScope.totalprod = parseInt(retrievedObject.year1production);
            $rootScope.systemsize = parseFloat(retrievedObject.systemsize).toFixed(2);
            $rootScope.yield = parseInt(retrievedObject.systemyield).toFixed(2);
            $rootScope.utilityLseid = retrievedObject.utilityLseid;
            $rootScope.taxrate = retrievedObject.utilitytaxrate;
            financedetailscall();
         }
         
        function customertofinance() {

            DesignDetails.get({proposalId: $rootScope.PricingQuoteId}).$promise
                    .then(function (response) {
                        console.log('get success on design');
                        //var dummyArraytoAdd = {};
                        //dummyArraytoAdd.Array = response.Array;                        
                        var ProposalTool = {
                        'proposaltitle': response.Title,
                        'customername': ((response.CustomerDetails.customername).replace(/%20/g, " ")).replace(/%27/g, "'"),
                        'address': response.CustomerDetails.address,
                        'annualusage': response.Quote.annualusage,
                        'presolarutility': response.Quote.CurrentUtilityCost,
                        'postsolarutility': response.Quote.PostSolarUtilityCost,
                        'systemsize': response.Quote.systemsize,
                        'year1production': response.Quote.Year1Production,
                        'offset': response.DesignDetails.offset,
                        'systemyield': response.Quote.systemyield,
                        'utilityprovider': response.Quote.utilityprovider,
                        'utilityLseid': response.Quote.UtilityIndex,
                        'currenttariff':response.DesignDetails.currenttariff,
                        'aftertariff': response.DesignDetails.aftertariff,
                        'avg$kwh': response.DesignDetails.averagecost,
                        'utilitytaxrate': response.DesignDetails.UtilityTaxRate,
                        'solarpanel': response.System.ModuleId,
                        'invertername':response.System.InverterManufacturer,
                        'invertermanufacturer': response.System.InverterManufacturer,
                        'invertertype': response.System.invertertype,
                        'invertermodel':response.Array[0].InverterModel,
                        'panelmodel' : response.Array[0].ModuleType,
                        'InverterQuantity' : response.System.InverterQuantity,
                        'MasterTariffId': response.DesignDetails.MasterTariffId,
                        'Array' : response.Array,
                        'Base64Image' : response.DesignDetails.Base64Image,
                        'MonthlyUsage': response.Quote.MonthlyUsage,
                        'MonthlyBill': response.Quote.MonthlyBill,
                        'PanelCount': response.DesignDetails.PanelCount,
                        'InverterDerate' : response.Quote.Derate,
                        'State' : response.CustomerDetails.State,
                        'ZipCode' : response.CustomerDetails.ZipCode,
                        'systemSizeACW' : response.DesignDetails.systemSizeACW,
                        'utilityrate' : response.DesignDetails.utilityrate
                    };
                    
                    //localStorage.setItem('ls.ProposalTool', JSON.stringify(ProposalTool));
                    localStorageService.add('ProposalTool',     ProposalTool);
                    retrievedObject = localStorageService.get('ProposalTool');//JSON.parse(localStorage.getItem('ls.ProposalTool'));
                        self.panelarrays = [];
                        for (var i = 0; i < response.Array.length; i++) {
                            self.panelarrays.push(response.Array[i]);
                        }                        
                        self.customername = retrievedObject.customername;
                        self.presolarconsumption = numberWithCommas(response.Quote.YearlyUsage);
                        self.avgcostofelectricity = (response.Quote.presolarutility / response.Quote.YearlyUsage).toFixed(2);
                        self.presolarmonthly = numberWithCommas((response.Quote.CurrentUtilityCost).toFixed(2));
                        self.postsolarmonthly = numberWithCommas((response.Quote.PostSolarUtilityCost).toFixed(2));
                        self.billsavings = numberWithCommas(response.Quote.CurrentUtilityCost - response.Quote.PostSolarUtilityCost);
                        self.utilityprovider = response.Quote.utilityprovider;
                        if (retrievedObject.taxrate)
                            self.taxrate = parseInt(retrievedObject.taxrate);
                        else
                            self.taxrate = 0;
                        self.totalprod = numberWithCommas(response.Quote.Year1Production);
                        self.systemsize = response.Quote.systemsize;                        
                        self.yield = numberWithCommas(response.Quote.systemyield);
                        self.annualoffset = (response.DesignDetails.offset);
                        self.proposaltitle = response.Title;
                        $rootScope.numberofarray = self.panelarrays.length;
                        $rootScope.arraydetails = self.panelarrays; 
                        $rootScope.presolarconsumption = removeCommaFromNumbers(response.Quote.YearlyUsage);
                        $rootScope.presolarbill = response.Quote.CurrentUtilityCost;
                        $rootScope.postsolarbill = response.Quote.PostSolarUtilityCost;
                        $rootScope.totalprod = response.Quote.Year1Production;
                        $rootScope.systemsize = response.Quote.systemsize;
                        $rootScope.yield = response.Quote.systemyield;
                        $rootScope.utilityLseid = response.Quote.UtilityIndex;
                        $rootScope.taxrate = response.Quote.TaxRate;

                        financedetailscall();
                    })
                    .catch(function (error) {
                        self.loading = false;
                        showErrorDialog('Design api get call failed '+ error);
                    });
        }
                
        function financedetailscall(){
            
            var partnerID = $rootScope.PartnerId;
            if($rootScope.PartnerIDForFinanceOptions){
                partnerID = $rootScope.PartnerIDForFinanceOptions;
            }
            FinanceDetails.get({id: $rootScope.SunEdCustId , partnerid :partnerID}).$promise
                        .then(function(response){                          
                            financeinfo = response; 
                            self.cash_escalator = [];
                            self.cashss_escalator = [];                            
                            self.mosaic_escalator = [];
                            self.lease_escalator = []; 
                            self.ppa_escalator = []; 
                            self.ppa_Array = [];
                            self.lease_Array = [];
                            self.mosaic_Array = [];
                            self.mosaicss_Array = [];
                            self.solarown_Array = [];
                            self.ppapaymentCallMade = false;
                            
                          console.log("LseID-" + $rootScope.utilityLseid +"-end"); 
                          console.log("Yeild-" + $rootScope.yield +"-end");
                          console.log("homeownerState-" + $rootScope.homeownerState +"-end");
                          
                          for(var i=0; i<response.results.length; i++){
                             if(response.results[i].purchase_type == 'Cash' && response.results[i].finance_program_type == '' && 
                                parseInt(response.results[i].utility_LSE_Id) == parseInt($rootScope.utilityLseid) && $rootScope.dealer === 'ID') {
                                    $scope.cashsavingsflag = false;
                                    console.log("cash ID savings");
                                    self.ID_cash_$watt = parseFloat(response.results[i].ID_$_Watt).toFixed(2);
                                    cashsavings();
                             }                               
                             if(response.results[i].purchase_type == 'Cash' && response.results[i].finance_program_type == 'CSS' &&
                                parseInt(response.results[i].utility_LSE_Id) == parseInt($rootScope.utilityLseid) && $rootScope.dealer === 'ID') {
                                    $scope.cashsssavingsflag = false;
                                    console.log("cashss ID savings");
                                    self.ID_cashss_$watt = parseFloat(response.results[i].ID_$_Watt).toFixed(2);
                                    cashWithsignature();
                             }
                             /*if(response.results[i].purchase_type == 'Cash' && response.results[i].finance_program_type == 'Cash-SAI' && 
                                parseInt(response.results[i].utility_LSE_Id) == parseInt($rootScope.utilityLseid) && $rootScope.dealer === 'SE') {
                                    $scope.cashsavingsflag = false;
                                    console.log("cash SE savings");
                                    CashSavingsSE(i);
                             }  
                             if(response.results[i].purchase_type == 'Cash' && response.results[i].finance_program_type == 'CSS-SAI' &&
                                parseInt(response.results[i].utility_LSE_Id) == parseInt($rootScope.utilityLseid) && $rootScope.dealer === 'SE') {
                                    $scope.cashsssavingsflag = false;
                                    console.log("cashss SE savings");
                                        CashssSavingsSE(i);
                             }
                             
                             if(response.results[i].purchase_type == 'Loan' && response.results[i].finance_program_type == 'SunEdison Mosaic SCION' && parseInt(response.results[i].utility_LSE_Id) == parseInt($rootScope.utilityLseid) &&
                                parseInt(response.results[i].yield_min) <= parseInt($rootScope.yield) && parseInt(response.results[i].yield_max) >= parseInt($rootScope.yield) && $rootScope.dealer === 'SE') {                                
                                    $scope.mosaicsavingsflag = false;
                                    console.log("mosaic SE savings");
                                    MosaicSavings(i);                                
                             }   
                             
                             if(response.results[i].purchase_type === 'Loan' && response.results[i].finance_program_type == 'SunEdison Mosaic SCION With Signature Series' &&parseInt(response.results[i].utility_LSE_Id) == parseInt($rootScope.utilityLseid) && 
                                parseInt(response.results[i].yield_min) <= parseInt($rootScope.yield) && parseInt(response.results[i].yield_max) >= parseInt($rootScope.yield) && $rootScope.dealer === 'SE') {                                
                                    $scope.mosaicsssavingsflag = false;
                                    console.log("mosaicss SE savings");
                                    MosaicSSSavings(i);
                             } 
                             
                             if(response.results[i].purchase_type == 'Lease - Monthly' && response.results[i].finance_program_type == 'PPA 1.0' &&parseInt(response.results[i].utility_LSE_Id) == parseInt($rootScope.utilityLseid) &&
                                parseInt(response.results[i].yield_min) <= parseInt($rootScope.yield) && parseInt(response.results[i].yield_max) >= parseInt($rootScope.yield)) {
                                    $scope.leasesavingsflag = false;
                                    console.log("lease savings");
                                    LeaseSavings(i);                               
                             }
                             
                             if(response.results[i].purchase_type == 'PPA' && response.results[i].finance_program_type == 'PPA 1.0' && parseInt(response.results[i].utility_LSE_Id) == parseInt($rootScope.utilityLseid) &&
                                parseFloat(response.results[i].yield_min) <= parseFloat($rootScope.yield) && parseFloat(response.results[i].yield_max) >= parseFloat($rootScope.yield)) {
                                    $scope.ppasavingsflag = false;
                                    console.log("ppa savings");
                                    PPASavings(i);
                            }*/
                            /*if(response.results[i].errormsg){
                                self.buildbutton = false;
                                self.loading = false;
                                showErrorDialog(response.results[i].errormsg);
                            }*/
                    }                    
                    console.log('finance call');
                        if ($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag) {
                            
                            for(var i=0; i<financeinfo.results.length; i++){
                                if(self.dealertypeview){
                                    if(($('#SE_cash_column').css('display') === 'none') && ($('#SE_cashss_column').css('display') === 'none') && ($('#SE_mosaic_column').css('display') === 'none') && ($('#SE_mosaicss_column').css('display') === 'none') && ($('#SE_lease_column').css('display') === 'none') && ($('#SE_ppa_column').css('display') === 'none')){
                                        if(financeinfo.results[i].errormsg === "missing homeowner id" || financeinfo.results[i].errormsg === "missing partner id" || financeinfo.results[i].errormsg === "HomeOwner State is Missing"){
                                            showErrorDialog('An error has occurred. Please open a support ticket if you continue experiencing issues.');
                                        }
                                        else if(financeinfo.results[i].errormsg === "HomeOwner State is not found in Partner Eligible States"){
                                            showErrorDialog('The Partner you are associated with is not set up in this State.  If you feel this is incorrect, please open a support ticket.');
                                        }
                                        else if(financeinfo.results[i].errormsg === "No Pricing Results available for the HomeOwner and Partner eligible Finance Programs"){
                                            showErrorDialog('The Partner you are associated with is not set up with eligible Finance programs.  If you feel this is incorrect, please open a support ticket.');
                                        }
                                    }
                                }
                                else
                                {
                                    if(($('#ID_cash_column').css('display') === 'none') && ($('#ID_cashss_column').css('display') === 'none') && ($('#ID_lease_column').css('display') === 'none') && ($('#ID_ppa_column').css('display') === 'none')){
                                        if(financeinfo.results[i].errormsg === "missing homeowner id" || financeinfo.results[i].errormsg === "missing partner id" || financeinfo.results[i].errormsg === "HomeOwner State is Missing"){
                                            showErrorDialog('An error has occurred. Please open a support ticket if you continue experiencing issues.');
                                            $scope.elligblestate = false;
                                        }
                                        else if(financeinfo.results[i].errormsg === "HomeOwner State is not found in Partner Eligible States"){
                                            showErrorDialog('The Partner you are associated with is not set up in this State.  If you feel this is incorrect, please open a support ticket.');
                                            $scope.elligblestate = false;
                                        }
                                        else if(financeinfo.results[i].errormsg === "No Pricing Results available for the HomeOwner and Partner eligible Finance Programs"){
                                            //showErrorDialog('The Partner you are associated with is not set up with eligible Finance programs.  If you feel this is incorrect, please open a support ticket.');
                                        }
                                    }                                    
                                    if ($rootScope.dealer === 'ID' && $('#ID_cash_column').css('display') === 'none' && $scope.elligblestate) {
                                        self.ID_cash_$watt = (4).toFixed(2);
                                        console.log("default cash pricing data");
                                        cashsavings();
                                    }
                                    if ($rootScope.dealer === 'ID' && $('#ID_cashss_column').css('display') === 'none' && $scope.elligblestate) {
                                        self.ID_cashss_$watt = (4).toFixed(2);
                                        console.log("default cashss pricing data");
                                        cashWithsignature();
                                    }
                                }
                            }
                            incentivecall();
                            self.buildbutton = false;
                            self.loading = false;
                        }
                })
                .catch(function (error) {                        
                    self.loading = false;
                    showErrorDialog('NetSuite FinanceProgram api failed to load data');
                    $state.go('customerdetails');
                });
            }
            
        function incentivecall() {
            if (firstincentivecall)
            {                
                firstincentivecall = false;
                if (self.dealertypeview) {
                    if ($('#SE_cash_column').css('display') !== 'none')
                        financeprogchange(11);
                    else if ($('#SE_cashss_column').css('display') !== 'none')
                        financeprogchange(12);
                    else if ($('#SE_mosaic_column').css('display') !== 'none')
                        financeprogchange(13);
                    else if ($('#SE_mosaicss_column').css('display') !== 'none')
                        financeprogchange(14);
                    else if ($('#SE_lease_column').css('display') !== 'none')
                        financeprogchange(15);
                    else if ($('#SE_ppa_column').css('display') !== 'none')
                        financeprogchange(16);
                } 
                else
                {
                    if ($('#ID_cash_column').css('display') !== 'none')
                        financeprogchange(1);
                    else if ($('#ID_cashss_column').css('display') !== 'none')
                        financeprogchange(2);
                    else if ($('#ID_lease_column').css('display') !== 'none')
                        financeprogchange(4);
                    else if ($('#ID_ppa_column').css('display') !== 'none')
                        financeprogchange(5);
                }
            }
        }
        
        function cashsavings(){            
            $('#ID_cash_column').css('display', 'block');
            $('#ID_cash_column').css('border-right', '1px solid #cccccc');
            var annualsaving = 0;
            var tempsaving = 0;
            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
            var tempprod = prod1;
            //console.log('cash production -0 '+ prod1);
            //prod1 = (prod1 * 0.95).toFixed(0);            
            //var prod2 = tempprod;
            var production = 0;
            var finalpresolar = parseFloat($rootScope.presolarbill).toFixed(2);
            var finalpostsolar = parseFloat($rootScope.postsolarbill).toFixed(2);
            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
            var year1saving = parseFloat(presolarannual - postsolarannual).toFixed(2);  
            for (var j = 1; j < 20; j++)
            {
                //var temp_prod = (tempprod * 0.005).toFixed(0);
                //prod2 = (prod2 * 0.95).toFixed(0);
                var prod = parseFloat(+tempprod - +(tempprod * 0.005)).toFixed(0);
                production = parseInt(+production + +prod).toFixed(0);
                tempprod = prod;
                var temp_pre = (presolarannual * 0.034).toFixed(2);
                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                finalpresolar = (+finalpresolar + +presolarannual);
                var temp_post = (postsolarannual * 0.034).toFixed(2);
                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                finalpostsolar = (+finalpostsolar + +postsolarannual);
                var tempsaving = parseFloat(+presolarannual - +postsolarannual).toFixed(2);
                annualsaving = parseInt(+annualsaving + +tempsaving).toFixed(2);
            }            
            annualsaving = parseInt(+year1saving + +annualsaving).toFixed(0);  
            var systemcost = (270 * retrievedObject.PanelCount * self.ID_cash_$watt).toFixed(0);  
            console.log('systemcost '+ systemcost);
            var totalcost = (+finalpostsolar + +systemcost).toFixed(0);  
            var finalsavings = (+finalpresolar - +totalcost).toFixed(0);  
            $scope.cash_totalproduction = (+production + +prod1).toFixed(2);
            console.log('cash production '+ $scope.cash_totalproduction);
            //self.ID_cash_$kwh = parseFloat((self.ID_cash_$watt * ($rootScope.systemsize * 1000)) / $scope.cash_totalproduction).toFixed(3);
            self.ID_cash_$kwh = parseFloat(systemcost / $scope.cash_totalproduction).toFixed(3);
            self.ID_cash_cashprice = numberWithCommas(systemcost);
            self.ID_cash_savings = numberWithCommas(finalsavings);
            $scope.cashsavingsflag = true;
            if ($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag){
                
                    for(var i=0; i<financeinfo.results.length; i++){
                                if(self.dealertypeview){
                                    if(($('#SE_cash_column').css('display') === 'none') && ($('#SE_cashss_column').css('display') === 'none') && ($('#SE_mosaic_column').css('display') === 'none') && ($('#SE_mosaicss_column').css('display') === 'none') && ($('#SE_lease_column').css('display') === 'none') && ($('#SE_ppa_column').css('display') === 'none')){
                                        if(financeinfo.results[i].errormsg === "missing homeowner id" || financeinfo.results[i].errormsg === "missing partner id" || financeinfo.results[i].errormsg === "HomeOwner State is Missing"){
                                            showErrorDialog('An error has occurred. Please open a support ticket if you continue experiencing issues.');
                                        }
                                        else if(financeinfo.results[i].errormsg === "HomeOwner State is not found in Partner Eligible States"){
                                            showErrorDialog('The Partner you are associated with is not set up in this State.  If you feel this is incorrect, please open a support ticket.');
                                        }
                                        else if(financeinfo.results[i].errormsg === "No Pricing Results available for the HomeOwner and Partner eligible Finance Programs"){
                                            showErrorDialog('The Partner you are associated with is not set up with eligible Finance programs.  If you feel this is incorrect, please open a support ticket.');
                                        }
                                    }
                                }
                                else
                                {
                                    if(($('#ID_cash_column').css('display') === 'none') && ($('#ID_cashss_column').css('display') === 'none') && ($('#ID_lease_column').css('display') === 'none') && ($('#ID_ppa_column').css('display') === 'none')){
                                        if(financeinfo.results[i].errormsg === "missing homeowner id" || financeinfo.results[i].errormsg === "missing partner id" || financeinfo.results[i].errormsg === "HomeOwner State is Missing"){
                                            showErrorDialog('An error has occurred. Please open a support ticket if you continue experiencing issues.');
                                            $scope.elligblestate = false;
                                        }
                                        else if(financeinfo.results[i].errormsg === "HomeOwner State is not found in Partner Eligible States"){
                                            showErrorDialog('The Partner you are associated with is not set up in this State.  If you feel this is incorrect, please open a support ticket.');
                                            $scope.elligblestate = false;
                                        }
                                        else if(financeinfo.results[i].errormsg === "No Pricing Results available for the HomeOwner and Partner eligible Finance Programs"){
                                            //showErrorDialog('The Partner you are associated with is not set up with eligible Finance programs.  If you feel this is incorrect, please open a support ticket.');
                                        }
                                    }                                    
                                    if ($rootScope.dealer === 'ID' && $('#ID_cash_column').css('display') === 'none' && $scope.elligblestate) {
                                        self.ID_cash_$watt = (4).toFixed(2);
                                        console.log("default cash pricing data");
                                        cashsavings();
                                    }
                                    if ($rootScope.dealer === 'ID' && $('#ID_cashss_column').css('display') === 'none' && $scope.elligblestate) {
                                        self.ID_cashss_$watt = (4).toFixed(2);
                                        console.log("default cashss pricing data");
                                        cashWithsignature();
                                    }
                                }
                            }
                    incentivecall();
                    self.buildbutton = false;
                    self.loading = false;
            }
        }
        
        function cashWithsignature(){
            $('#ID_cashss_column').css('display', 'block');
            $('#ID_cashss_column').css('border-right', '1px solid #cccccc');
           var annualsaving = 0;
            var tempsaving = 0;
            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
            var tempprod = prod1;
            //prod1 = (prod1 * 0.95);            
            //var prod2 = tempprod;
            var production = 0;
            var finalpresolar = parseFloat($rootScope.presolarbill).toFixed(2);
            var finalpostsolar = parseFloat($rootScope.postsolarbill).toFixed(2);
            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
            var year1saving = parseFloat(presolarannual - postsolarannual).toFixed(2);                         
                                
            for (var j = 1; j < 20; j++)
            {
                var prod = parseFloat(+tempprod - +(tempprod * 0.005)).toFixed(0);
                production = parseInt(+production + +prod).toFixed(0);
                tempprod = prod;
                var temp_pre = (presolarannual * 0.034).toFixed(2);
                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                finalpresolar = (+finalpresolar + +presolarannual);
                var temp_post = (postsolarannual * 0.034).toFixed(2);
                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                finalpostsolar = (+finalpostsolar + +postsolarannual);
                var tempsaving = parseFloat(+presolarannual - +postsolarannual).toFixed(2);
                annualsaving = parseInt(+annualsaving + +tempsaving).toFixed(2);
            }            
            annualsaving = parseInt(+year1saving + +annualsaving).toFixed(0);            
            var systemcost = (270 * retrievedObject.PanelCount * self.ID_cashss_$watt).toFixed(0);                
            var totalcost = (+finalpostsolar + +systemcost).toFixed(0);  
            var finalsavings = (+finalpresolar - +totalcost).toFixed(0); 
            $scope.cashss_totalproduction = (+production+ +prod1).toFixed(0);
            //console.log('cash SS production '+ $scope.cashss_totalproduction);
            self.ID_cashss_$kwh = parseFloat(systemcost / $scope.cashss_totalproduction).toFixed(3);
            self.ID_cashss_cashprice = numberWithCommas(systemcost);
            self.ID_cashss_savings = numberWithCommas(finalsavings);
            $scope.cashsssavingsflag = true;
            if ($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag) {
                for (var i = 0; i < financeinfo.results.length; i++) {
                    if (self.dealertypeview) {
                        if (($('#SE_cash_column').css('display') === 'none') && ($('#SE_cashss_column').css('display') === 'none') && ($('#SE_mosaic_column').css('display') === 'none') && ($('#SE_mosaicss_column').css('display') === 'none') && ($('#SE_lease_column').css('display') === 'none') && ($('#SE_ppa_column').css('display') === 'none')) {
                            if (financeinfo.results[i].errormsg === "missing homeowner id" || financeinfo.results[i].errormsg === "missing partner id" || financeinfo.results[i].errormsg === "HomeOwner State is Missing") {
                                showErrorDialog('An error has occurred. Please open a support ticket if you continue experiencing issues.');
                            } else if (financeinfo.results[i].errormsg === "HomeOwner State is not found in Partner Eligible States") {
                                showErrorDialog('The Partner you are associated with is not set up in this State.  If you feel this is incorrect, please open a support ticket.');
                            } else if (financeinfo.results[i].errormsg === "No Pricing Results available for the HomeOwner and Partner eligible Finance Programs") {
                                showErrorDialog('The Partner you are associated with is not set up with eligible Finance programs.  If you feel this is incorrect, please open a support ticket.');
                            }
                        }
                    } else
                    {
                        if (($('#ID_cash_column').css('display') === 'none') && ($('#ID_cashss_column').css('display') === 'none') && ($('#ID_lease_column').css('display') === 'none') && ($('#ID_ppa_column').css('display') === 'none')) {
                            if (financeinfo.results[i].errormsg === "missing homeowner id" || financeinfo.results[i].errormsg === "missing partner id" || financeinfo.results[i].errormsg === "HomeOwner State is Missing") {
                                showErrorDialog('An error has occurred. Please open a support ticket if you continue experiencing issues.');
                                $scope.elligblestate = false;
                            } else if (financeinfo.results[i].errormsg === "HomeOwner State is not found in Partner Eligible States") {
                                showErrorDialog('The Partner you are associated with is not set up in this State.  If you feel this is incorrect, please open a support ticket.');
                                $scope.elligblestate = false;
                            } else if (financeinfo.results[i].errormsg === "No Pricing Results available for the HomeOwner and Partner eligible Finance Programs") {
                                //showErrorDialog('The Partner you are associated with is not set up with eligible Finance programs.  If you feel this is incorrect, please open a support ticket.');
                            }
                        }
                        if ($rootScope.dealer === 'ID' && $('#ID_cash_column').css('display') === 'none' && $scope.elligblestate) {
                            self.ID_cash_$watt = (4).toFixed(2);
                            console.log("default cash pricing data");
                            cashsavings();
                        }
                        if ($rootScope.dealer === 'ID' && $('#ID_cashss_column').css('display') === 'none' && $scope.elligblestate) {
                            self.ID_cashss_$watt = (4).toFixed(2);
                            console.log("default cashss pricing data");
                            cashWithsignature();
                        }
                    }
                }
                incentivecall();
                self.buildbutton = false;
                self.loading = false;
            }
        }
        
        function CashSavingsSE(i){
            $('.cash_column').css('display', 'block');
            $('.cash_column').css('border-right', '1px solid #cccccc');
            if (cashflagSE)
            {            
                assembleSECashjson();
                /*var Payload_cash =
                        {
                            'Quote': {
                                'LoanStartDate': getSystemDate(),
                                'PricePerWatt': financeinfo.results[i].SE_$_Watt,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': 'SALES ENGINE (Seller)',
                                'Year1Production': retrievedObject.year1production,
                                'Year1Yield': retrievedObject.systemyield,
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,                                
                                'MosaicTenor': 20,
                                'ChannelType': "Door-to-door",
                                'SignatureSeries': "No",
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode
                            }
                        };
                        
                LoanPayment.save(Payload_cash).$promise
                        .then(function (data) {
                                                        
                            var dummyarray = [];
                            for (var k = 0; k < data.LoanPayments.length-5; k++)
                            {
                                var temp = ((data.LoanPayments[k] * 12).toFixed(2)).toString();
                                dummyarray.push(temp);
                            }
                            CashPaymentsSE = dummyarray;      
                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +CashPaymentsSE[0]).toFixed(2);
                            
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.005).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +CashPaymentsSE[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            $scope.cash_totalproduction = (+production + +prod1).toFixed(2);                            
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            console.log(" Cash SE FinalSaving - " + finalsaving);
                            self.SE_cash_savings = numberWithCommas(finalsaving);
                            
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for cash SE');
                            self.buildbutton = false;
                        });*/
                    cashflagSE = false;
            }
        }
        
        function CashssSavingsSE(i){
            $('.cashss_column').css('display', 'block');
            $('.cashss_column').css('border-right', '1px solid #cccccc');
            if (cashssflagSE)
            {
                assembleSECashSSjson();
               /* var Payload_cashss =
                        {
                            'Quote': {
                                'LoanStartDate': getSystemDate(),
                                'PricePerWatt': financeinfo.results[i].SE_$_Watt,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': 'SALES ENGINE (Seller)',
                                'Year1Production': retrievedObject.year1production,
                                'Year1Yield': retrievedObject.systemyield,
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,                                
                                'MosaicTenor': 20,
                                'ChannelType': "Door-to-door",
                                'SignatureSeries': "Yes",
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode
                            }
                        };
                        
                LoanPayment.save(Payload_cashss).$promise
                        .then(function (data) {
                            
                            var dummyarray = [];
                            for (var k = 0; k < data.LoanPayments.length-5; k++)
                            {
                                var temp = ((data.LoanPayments[k] * 12).toFixed(2)).toString();
                                dummyarray.push(temp);
                            }
                            CashssPaymentsSE = dummyarray;      
                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +CashssPaymentsSE[0]).toFixed(2);
                            
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.005).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +CashssPaymentsSE[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            $scope.cashss_totalproduction = (+production + +prod1).toFixed(2);                                                                        
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            console.log(" CashSS SE FinalSaving - " + finalsaving);
                            self.SE_cashss_savings = numberWithCommas(finalsaving);
                           
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for cash SE');
                            self.buildbutton = false;
                        });*/
                    cashssflagSE = false;
            }
        }
        function MosaicSavings(i){            
            $('.mosaic_column').css('display', 'block');
            $('.mosaic_column').css('border-right', '1px solid #cccccc');
            if (financeinfo.results[i].loan_term) {
                var temp = {};
                temp.loanterm = (parseInt(financeinfo.results[i].loan_term));
                temp.$watt = (parseFloat(financeinfo.results[i].SE_$_Watt));
                temp.financeprogram = 'Mosaic';
                self.mosaic_Array.push(temp);
            }
            
            if (mosaicflag)
            {
                mosaicterm = (parseInt(financeinfo.results[i].loan_term));
                assembleSEMosaicjson();
                /*var Payload_mosaic =
                        {
                            'Quote': {
                                'LoanStartDate': getSystemDate(),
                                'PricePerWatt': self.mosaic_Array[0].$watt,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': 'SALES ENGINE (Seller)',
                                'Year1Production': retrievedObject.year1production,
                                'Year1Yield': retrievedObject.systemyield,
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,                                
                                'MosaicTenor': self.mosaic_Array[0].loanterm,
                                'ChannelType': "Door-to-door",
                                'SignatureSeries': "No",
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode
                            }
                        };
                        
                self.mosaicpaymentCallMade = true;
                LoanPayment.save(Payload_mosaic).$promise
                        .then(function (data) {                            

                             var dummyarray = [];
                            for (var k = 0; k < data.LoanPayments.length-5; k++)
                            {
                                var temp = ((data.LoanPayments[k] * 12).toFixed(2)).toString();
                                dummyarray.push(temp);
                            }
                            MosaicPayments = dummyarray;      

                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +MosaicPayments[0]).toFixed(2);
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.005).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +MosaicPayments[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            $scope.mosaic_totalproduction = (+production + +prod1).toFixed(2);                            
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            console.log(" Mosaic FinalSaving - " + finalsaving);
                            self.SE_mosaic_savings = numberWithCommas(finalsaving);
                            self.ID_mosaic_savings = numberWithCommas(finalsaving);
                            
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for mosaic');
                            self.buildbutton = false;
                        });*/
                    mosaicflag = false;
            }
        }
        
        function MosaicSSSavings(i){             
            $('.mosaicss_column').css('display', 'block');
            $('.mosaicss_column').css('border-right', '1px solid #cccccc');
            if (financeinfo.results[i].loan_term) {
                var temp = {};
                temp.loanterm = (parseFloat(financeinfo.results[i].loan_term));
                temp.$watt = (parseFloat(financeinfo.results[i].SE_$_Watt));
                temp.financeprogram = 'MosaicSS';
                self.mosaicss_Array.push(temp);
            }            
            if (mosaicssflag)
            {
                mosaicssterm = (parseFloat(financeinfo.results[i].loan_term));
                assembleSEMosaicSSjson();                
                /*var Payload_mosaicss =
                        {
                            'Quote': {
                                'LoanStartDate': getSystemDate(),
                                'PricePerWatt': self.mosaicss_Array[0].$watt,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': 'SALES ENGINE (Seller)',
                                'Year1Production': retrievedObject.year1production,
                                'Year1Yield': retrievedObject.systemyield,
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,                                
                                'MosaicTenor': self.mosaicss_Array[0].loanterm,
                                'ChannelType': "Door-to-door",
                                'SignatureSeries': "Yes",
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode
                            }
                        };                        
                self.mosaicsspaymentCallMade = true;
                LoanPayment.save(Payload_mosaicss).$promise
                        .then(function (data) {                            
                            var dummyarray = [];
                            for (var k = 0; k < data.LoanPayments.length-5; k++)
                            {
                                var temp = ((data.LoanPayments[k] * 12).toFixed(2)).toString();
                                dummyarray.push(temp);
                            }
                            MosaicssPayments = dummyarray;      
                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +MosaicssPayments[0]).toFixed(2);
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.005).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +MosaicssPayments[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            $scope.mosaicss_totalproduction = (+production + +prod1).toFixed(2);                            
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            console.log(" Mosaicss FinalSaving - " + finalsaving);
                            self.SE_mosaicss_savings = numberWithCommas(finalsaving);
                            self.ID_mosaicss_savings = numberWithCommas(finalsaving);
                            
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for mosaic Signature Series');
                            self.buildbutton = false;
                        });*/
                    mosaicssflag = false;
            }
        }
        
        function LeaseSavings(i){
            $('.lease_column').css('display', 'block');
            $('.lease_column').css('border-right', '1px solid #cccccc');
            
            if (financeinfo.results[i].escalator) {
                var temp = {};
                temp.escalator = (parseFloat(financeinfo.results[i].escalator));
                if (self.dealertypeview)
                    temp.$kwh = (parseFloat(financeinfo.results[i].SE_$_KWH));
                else
                    temp.$kwh = (parseFloat(financeinfo.results[i].ID_$_KWH));
                temp.financeprogram = 'Lease';
                self.lease_Array.push(temp);
            }  
            if (leaseflag)
            {
                if (self.dealertypeview) {
                    self.SE_lease_$kwh = parseFloat(financeinfo.results[i].SE_$_KWH).toFixed(3);
                    $scope.pricing = self.SE_lease_$kwh;
                } else {
                    self.ID_lease_$kwh = parseFloat(financeinfo.results[i].ID_$_KWH).toFixed(3);
                    $scope.pricing = self.ID_lease_$kwh;
                }
                leaseescalatorrate = parseFloat(self.lease_Array[0].escalator / 100).toFixed(4);
                $scope.escalator = leaseescalatorrate;
                $scope.purchasetype = "Lease - Monthly";
                $scope.financeprog = "PPA 1.0";
                assembleLeaseJSONpricing();
                /*var Payload_Lease =
                        {
                            'Quote': {
                                'PPARate': self.lease_Array[0].$kwh,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': $rootScope.PartnerType,
                                'Year1Production': retrievedObject.year1production,
                                'CustomerPrepayment': "0",
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,
                                'PeriodicRentEscalation': (financeinfo.results[i].escalator / 100).toFixed(4),
                                'SubstantialCompletionDate': "11/10/2015",
                                'CurrentUtilityCost': retrievedObject.presolarutility,
                                'PostSolarUtilityCost': retrievedObject.postsolarutility,
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode,
                                'LastYear': 20
                            }
                        };
                 if ($scope.incentivechecked) {
                    Payload_Lease.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    Payload_Lease.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    Payload_Lease.Quote.UpfrontRebateAssumptionsMax = 0;
                    Payload_Lease.Quote.UpfrontRebateAssumptions = 0;
                }
                self.leasepaymentCallMade = true;
                Payment.save(Payload_Lease).$promise
                        .then(function (data) {
                             var dummyarray = [];
                            for (var k = 0; k < data.LeasePayments.length; k++)
                            {
                                temp = ((data.LeasePayments[k] * 12).toFixed(2)).toString();
                                dummyarray.push(temp);
                            }
                            LeasePayments = dummyarray;      
                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +LeasePayments[0]).toFixed(2);
                            leaseescalatorrate = parseFloat(self.lease_Array[0].escalator / 100).toFixed(4);
                            console.log(0 + " Lease Presolar - " + presolarannual);
                            console.log(0 + " Lease Postsolar - " + postsolarannual);
                            console.log(0 + " Lease Saving - " + year1saving);
                            console.log(0 + "Lease production " + $rootScope.totalprod) ;
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.005).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +LeasePayments[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            console.log(0 + "Lease totalsaving " + totalsaving) ;
                            $scope.lease_totalproduction = (+production + +prod1).toFixed(2);                            
                            if (self.dealertypeview) {
                                self.SE_lease_$kwh = parseFloat(financeinfo.results[i].SE_$_KWH).toFixed(3);
                                $scope.pricing = self.SE_lease_$kwh;
                            } else {
                                self.ID_lease_$kwh = parseFloat(financeinfo.results[i].ID_$_KWH).toFixed(3);
                                $scope.pricing = self.ID_lease_$kwh;
                            }
                            $scope.escalator = leaseescalatorrate;
                            $scope.purchasetype = "Lease - Monthly";
                            $scope.financeprog = "PPA 1.0";
                            assembleLeaseJSONpricing();
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            console.log(" Lease FinalSaving - " + finalsaving);
                            self.SE_lease_savings = numberWithCommas(finalsaving);
                            self.ID_lease_savings = numberWithCommas(finalsaving);
                            //incentivecall();
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for lease');
                            self.buildbutton = false;  
                        }); */                                              
                    leaseflag = false;
            }
        }
        
        function PPASavings(i){
            self.loading = true;
            $('.ppa_column').css('display', 'block');
            $('.ppa_column').css('border-right', '1px solid #cccccc');
            if (financeinfo.results[i].escalator) {
                var temp = {};
                temp.escalator = (parseFloat(financeinfo.results[i].escalator));
                if (self.dealertypeview)
                    temp.$kwh = (parseFloat(financeinfo.results[i].SE_$_KWH));
                else
                    temp.$kwh = (parseFloat(financeinfo.results[i].ID_$_KWH));
                temp.financeprogram = 'PPA';
                self.ppa_Array.push(temp);
            }   
            
            if (ppaflag)
            {
                if (self.dealertypeview) {
                    self.SE_ppa_$kwh = parseFloat(financeinfo.results[i].SE_$_KWH).toFixed(3);
                    $scope.pricing = self.SE_ppa_$kwh;
                } else {
                    self.ID_ppa_$kwh = parseFloat(financeinfo.results[i].ID_$_KWH).toFixed(3);
                    $scope.pricing = self.ID_ppa_$kwh;
                }
                ppaescalatorrate = parseFloat(self.ppa_Array[0].escalator / 100).toFixed(4);
                $scope.escalator = ppaescalatorrate;
                $scope.purchasetype = "PPA";
                $scope.financeprog = "PPA 1.0";
                assemblePPAJSONpricing();
                /*var Payload_PPA =
                        {
                            'Quote': {
                                'PPARate': self.ppa_Array[0].$kwh,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': $rootScope.PartnerType,
                                'Year1Production': retrievedObject.year1production,
                                'CustomerPrepayment': "0",
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,
                                'PeriodicRentEscalation': (financeinfo.results[i].escalator / 100).toFixed(4),
                                'SubstantialCompletionDate': "11/10/2015",
                                'CurrentUtilityCost': retrievedObject.presolarutility,
                                'PostSolarUtilityCost': retrievedObject.postsolarutility,
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode,
                                'LastYear': 20
                            }
                        };
                if ($scope.incentivechecked) {
                    Payload_PPA.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    Payload_PPA.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    Payload_PPA.Quote.UpfrontRebateAssumptionsMax = 0;
                    Payload_PPA.Quote.UpfrontRebateAssumptions = 0;
                }
                self.ppapaymentCallMade = true;
                Payment.save(Payload_PPA).$promise
                        .then(function (data) {
                            var dummyarray = [];
                                for (var k = 0; k < data.PPAPayments.length; k++)
                                {
                                    temp = ((data.PPAPayments[k] * 12).toFixed(2)).toString();
                                    dummyarray.push(temp);
                                }                                
                            PPAPayments = dummyarray;
                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseInt(+presolarannual - +postsolarannual - +PPAPayments[0]).toFixed(2);
                            ppaescalatorrate = parseFloat(self.ppa_Array[0].escalator / 100).toFixed(4);
                            console.log(" PPA Presolar - " + presolarannual);
                            console.log(" PPA Postsolar - " + postsolarannual);
                            console.log(" PPA Saving - " + year1saving);
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.005).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseInt(+presolarannual - +postsolarannual - +PPAPayments[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            console.log("PPA totalsaving - "+totalsaving)
                            if (self.dealertypeview) {
                                self.SE_ppa_$kwh = parseFloat(financeinfo.results[i].SE_$_KWH).toFixed(3);                       
                                $scope.pricing = self.SE_ppa_$kwh;
                            } else {
                                self.ID_ppa_$kwh = parseFloat(financeinfo.results[i].ID_$_KWH).toFixed(3);
                                $scope.pricing = self.ID_ppa_$kwh;
                            }
                            $scope.escalator = ppaescalatorrate;
                            $scope.purchasetype = "PPA";
                            $scope.financeprog = "PPA 1.0";
                            assemblePPAJSONpricing();
                            $scope.ppa_totalproduction = (+production + +prod1).toFixed(2);
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            console.log(j + " PPA finalsaving - " + finalsaving);
                            self.SE_ppa_savings = numberWithCommas(finalsaving);
                            self.ID_ppa_savings = numberWithCommas(finalsaving);
                            //incentivecall();
                        })
                        .catch(function (error) {
                            self.loading = false;
                            showErrorDialog('Payment api failed for PPA');
                            self.buildbutton = false;
                        });*/
                ppaflag = false;
            }
        }
        
function processStateName2CodeMapping(stateName) {

       var stateMap = {
             "Alabama" : "AL", 
             "Alaska" : "AK",
             "Arizona" : "AZ",
             "Arkansas"  : "AR",
             "California" : "CA",       
             "Colorado" : "CO",
             "Connecticut" : "CT",
             "Delaware" : "DE",
             "District Of Columbia" : "DC",
             "Florida" : "FL",
             "Georgia" : "GA",
             "Hawaii" : "HI",
             "Idaho" : "ID",
             "Illinois" : "IL",
             "Indiana" : "IN",
             "Iowa" : "IA",
             "Kansas" : "KS",
             "Kentucky" : "KY",
             "Louisiana" : "LA",
             "Maine" : "ME",
             "Maryland" : "MD",
             "Massachusetts" : "MA",
             "Michigan" : "MI",
             "Minnesota" : "MN",
             "Mississippi" : "MS",
             "Missouri" : "MO",
             "Montana" : "MT",
             "Nebraska" : "NE",
             "Nevada" : "NV",
             "New Hampshire" : "NH",
             "New Jersey" : "NJ",
             "New Mexico" : "NM",
             "New York" : "NY",
             "North Carolina" : "NC",
             "North Dakota" : "ND",
             "Ohio" : "OH",
             "Oklahoma" : "OK",
             "Oregon" : "OR",
             "Pennsylvania" : "PA",
             "Puerto Rico" : "PR",
             "Rhode Island" : "RI",
             "South Carolina" : "SC",
             "South Dakota" : "SD",
             "Tennessee" : "TN",
             "Texas" : "TX",
             "Utah" : "UT",
             "Vermont" : "VT",
             "Virginia" : "VA",
             "Washington" : "WA",
             "West Virginia" : "WV",
             "Wisconsin" : "WI",
             "Wyoming" : "WY"
         };
     
            if (stateName !== '') {
                if (stateName.length > 2) {
                    stateName = stateMap[stateName];
                }
            }
       return stateName;
}

function redirectToDesignPage(){
    localStorageService.add('proposalToClone', localStorageService.get('proposalID'));
    localStorageService.remove('FirstVisitToDesign');
    localStorageService.remove('FirstVisitToFinance');
    localStorageService.remove('FirstVisitToProposalView');
}
       
function designsaving(){    
        self.waitimplementer = true;
            localStorageService.remove('proposalToClone');
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/Design.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                var designdetails = eval("(" + payLoad + ")");   
                
                if(self.dealertypeview)
                {   
                    switch (self.SE_checked) {
                        case 16:
                        {   
                            $scope.purchasetype =  "PPA";
                            $scope.financeprog =  "PPA 1.0";
                            $scope.PriceperWatt = self.SE_ppa_$watt;
                            $scope.ASP = self.SE_ppa_$kwh;
                            $scope.savings = self.SE_ppa_savings;
                            break;
                        }    
                        case 15:
                        {
                            $scope.purchasetype =  "Lease - Monthly";
                            $scope.financeprog =  "PPA 1.0";
                            $scope.PriceperWatt = self.SE_lease_$watt;
                            $scope.ASP = self.SE_lease_$kwh;
                            $scope.savings = self.SE_lease_savings;
                            break;
                        }
                        case 14:
                        {
                            $scope.purchasetype =  "Loan";
                            $scope.financeprog =  "SunEdison Mosaic SCION With Signature Series";
                            $scope.PriceperWatt = self.SE_mosaicss_$watt;
                            $scope.ASP = self.SE_mosaicss_$kwh;
                            $scope.savings = self.SE_mosaicss_savings;
                            break;
                        }
                        case 13:
                        {
                            $scope.purchasetype =  "Loan";
                            $scope.financeprog =  "SunEdison Mosaic SCION";
                            $scope.PriceperWatt = self.SE_mosaic_$watt;
                            $scope.ASP = self.SE_mosaic_$kwh;
                            $scope.savings = self.SE_mosaic_savings;
                            break;
                        }
                        case 12:
                        {
                            $scope.purchasetype =  "Cash";
                            $scope.financeprog =  "CSS-SAI";
                            $scope.PriceperWatt = self.SE_cashss_$watt;
                            $scope.ASP = self.SE_cashss_$kwh;
                            $scope.savings = self.SE_cashss_savings;
                            break;
                        }
                        case 11:
                        {
                            $scope.purchasetype =  "Cash";
                            $scope.financeprog =  "Cash-SAI";
                            $scope.PriceperWatt = self.SE_cash_$watt;
                            $scope.ASP = self.SE_cash_$kwh;
                            $scope.savings = self.SE_cash_savings;
                            break;
                        }
                    }
                }
                else
                {
                    switch (self.ID_checked) {
                        case 5:
                        {
                            $scope.purchasetype =  "PPA";
                            $scope.financeprog =  "PPA 1.0";
                            $scope.PriceperWatt = self.ID_ppa_$watt;
                            $scope.ASP = self.ID_ppa_$kwh;
                            $scope.savings = self.ID_ppa_savings;
                            break;
                        }    
                        case 4:
                        {
                            $scope.purchasetype =  "Lease - Monthly";
                            $scope.financeprog =  "PPA 1.0";
                            $scope.PriceperWatt = self.ID_lease_$watt;
                            $scope.ASP = self.ID_lease_$kwh;
                            $scope.savings = self.ID_lease_savings;
                            break;
                        }
                        case 2:
                        {
                            $scope.purchasetype =  "Cash";
                            $scope.financeprog =  "CSS";
                            $scope.PriceperWatt = self.ID_cashss_$watt;
                            $scope.ASP = self.ID_cashss_$kwh;
                            $scope.savings = self.ID_cashss_savings;
                            break;
                        }
                        case 1:
                        {
                            $scope.purchasetype =  "Cash";
                            $scope.financeprog =  "Cash";
                            $scope.PriceperWatt = self.ID_cash_$watt;
                            $scope.ASP = self.ID_cash_$kwh;
                            $scope.savings = self.ID_cash_savings;
                            break;
                        }
                    }
                }
                
                designdetails.SunEdCustId = $rootScope.SunEdCustId; 
                designdetails.Title = self.proposaltitle;                
                //if($rootScope.PricingQuoteId){
                designdetails.Quote.PartnerType = $rootScope.PartnerType;
                designdetails.Quote.ProposalID = localStorageService.get('proposalID');
                designdetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption) ;               
                designdetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                designdetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                designdetails.Quote.Year1Production = $rootScope.totalprod;
                designdetails.Quote.purchasetype = $scope.purchasetype;
                designdetails.Quote.financeprogram = $scope.financeprog;
                designdetails.Quote.ASP = $scope.ASP;
                designdetails.Quote.PricePerWatt = $scope.PriceperWatt;                
                designdetails.Quote.proposalstatus = 'Draft';
                var currentdate = new Date();                
                designdetails.Quote.lastupdatedtime = currentdate.toDateString();
                designdetails.Quote.agreementstatus = 'Not Initiated';
                designdetails.Quote.SE_ppa_$kwh = self.SE_ppa_$kwh;        
                designdetails.Quote.annualusage = retrievedObject.annualusage;
                designdetails.Quote.presolarutility = retrievedObject.presolarutility;
                designdetails.Quote.postsolarutility = retrievedObject.postsolarutility;
                designdetails.Quote.systemsize = retrievedObject.systemsize;
                designdetails.Quote.Year1Production = retrievedObject.year1production;
                designdetails.Quote.systemyield = retrievedObject.systemyield;
                designdetails.Quote.utilityprovider = self.utilityprovider;                
                designdetails.Quote.UtilityIndex = retrievedObject.utilityLseid;
                designdetails.Quote.MonthlyUsage = retrievedObject.MonthlyUsage;
                designdetails.Quote.MonthlyBill = retrievedObject.MonthlyBill;
                designdetails.Quote.Derate = retrievedObject.InverterDerate;
                designdetails.Quote.YearsSavings = $scope.savings;                
                designdetails.Quote.TaxRate = $rootScope.taxrate;
                designdetails.DesignDetails.utilityrate = retrievedObject.utilityrate;
                designdetails.DesignDetails.billsavings = self.billsavings;        
                designdetails.DesignDetails.offset = retrievedObject.offset;
                designdetails.DesignDetails.averagecost = parseFloat(retrievedObject.avgcostofelectricity);
                designdetails.DesignDetails.Base64Image = retrievedObject.Base64Image;
                designdetails.DesignDetails.PanelCount = retrievedObject.PanelCount;
                designdetails.DesignDetails.currenttariff = retrievedObject.currenttariff;
                designdetails.DesignDetails.aftertariff = retrievedObject.aftertariff;
                designdetails.DesignDetails.systemSizeACW =  retrievedObject.systemSizeACW;
                designdetails.DesignDetails.MasterTariffId =  retrievedObject.MasterTariffId;
                designdetails.CustomerDetails.customername = retrievedObject.customername;
                designdetails.CustomerDetails.address = retrievedObject.address;
                designdetails.CustomerDetails.State = retrievedObject.State;
                designdetails.CustomerDetails.ZipCode = retrievedObject.ZipCode;
                designdetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                designdetails.System.invertertype = retrievedObject.invertertype;
                designdetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                designdetails.System.ModuleId = retrievedObject.solarpanel;
                designdetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                designdetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                designdetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;
                
                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if(j>0)
                        designdetails.Array.push({});
                    designdetails.Array[j].ArrayNumber = $rootScope.arraydetails[j].ArrayNumber;
                    designdetails.Array[j].Azimuth = $rootScope.arraydetails[j].Azimuth;
                    designdetails.Array[j].ModuleQuantity = $rootScope.arraydetails[j].ModuleQuantity;
                    designdetails.Array[j].SystemSize = (($rootScope.arraydetails[j].ModuleQuantity * 270)/1000).toFixed(2);
                    designdetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt);
                    designdetails.Array[j].AnnualShading = $rootScope.arraydetails[j].AnnualShading;
                    designdetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;      
                    designdetails.Array[j].MountType = $rootScope.arraydetails[j].MountType;
                    designdetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    designdetails.Array[j].InverterType = $rootScope.arraydetails[j].invertertype;
                    designdetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    designdetails.Array[j].InverterQuantity = $rootScope.arraydetails[j].InverterQuantity;
                    var Shading = [];
                    for(var i=0; i<12;i++){
                        Shading.push($rootScope.arraydetails[j].AnnualShading);
                    }
                    designdetails.Array[j].Shading = Shading;
                }
                self.saveDisabled = true;
                DesignSave.save(designdetails).$promise
                        .then(function (response) {
                            if (response.Message === "Design created successfully") {
                                $rootScope.PricingQuoteId = response.PricingQuoteId;
                                //$rootScope.ProposalId = response.ProposalId;
                            }
                            console.log("Design saved");
                            showErrorDialog("Draft proposal saved");
                            self.waitimplementer = false;
                            self.saveDisabled = false;
                        })
                        .catch(function (error) {
                            self.waitimplementer = false;
                            showErrorDialog('Design saving api failed');
                            self.buildbutton = false;
                        });
            });            
}

function builddocument(){
        //$rootScope.proposaltitle = self.proposaltitle;
	localStorageService.remove('proposalToClone');
        $scope.set$kwh = 0;
        $scope.escalator = 0;
        $scope.term = 0;        
            if (self.dealertypeview) {
                if (self.SE_checked === 16) {
                    $scope.set$watt = self.SE_ppa_$watt;
                    $scope.set$kwh = self.SE_ppa_$kwh;
                    $scope.escalator = ppaescalatorrate;
                    $scope.purchasetype = "PPA";
                    $scope.financeprog = "PPA 1.0";
                    $scope.YearsSavings = self.SE_ppa_savings;
                    if (removeCommaFromNumbers(self.SE_ppa_savings) > 0)
                        assemblePPAjson();
                    else
                        showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
                } else if (self.SE_checked === 15) {
                    $scope.set$watt = self.SE_lease_$watt;
                    $scope.set$kwh = self.SE_lease_$kwh;
                    $scope.escalator = leaseescalatorrate;
                    $scope.purchasetype = "Lease - Monthly";
                    $scope.financeprog = "PPA 1.0";
                    $scope.YearsSavings = self.SE_lease_savings;
                    if (removeCommaFromNumbers(self.SE_lease_savings) > 0)
                        assemblePPAjson();
                    else
                        showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
                } else if (self.SE_checked === 14) {
                    if (retrievedObject.State === 'California' || retrievedObject.State === 'Connecticut' || retrievedObject.State === 'Maryland' || retrievedObject.State === 'New York') {
                        if (self.registrationnumber) {
                            $scope.set$watt = self.SE_mosaicss_$watt;
                            $scope.set$kwh = self.SE_mosaicss_$kwh;
                            $scope.term = mosaicssterm;
                            $scope.purchasetype = "Loan";
                            $scope.financeprog = "SunEdison Mosaic SCION With Signature Series";
                            $scope.YearsSavings = self.SE_mosaicss_savings;
                            if (removeCommaFromNumbers(self.SE_mosaicss_savings) > 0)
                                assembleMosaicjson();
                            else
                                showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
                        } else
                            showErrorDialog("Please enter your Home Improvement Sales Registration number for the installation agreement");
                    } else {
                        $scope.set$watt = self.SE_mosaicss_$watt;
                        $scope.set$kwh = self.SE_mosaicss_$kwh;
                        $scope.term = mosaicssterm;
                        $scope.purchasetype = "Loan";
                        $scope.financeprog = "SunEdison Mosaic SCION With Signature Series";
                        $scope.YearsSavings = self.SE_mosaicss_savings;
                        if (removeCommaFromNumbers(self.SE_mosaicss_savings) > 0)
                            assembleMosaicjson();
                        else
                            showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
                    }
                } else if (self.SE_checked === 13) {
                    if (retrievedObject.State === 'California' || retrievedObject.State === 'Connecticut' || retrievedObject.State === 'Maryland' || retrievedObject.State === 'New York') {
                        if (self.registrationnumber) {
                            $scope.set$watt = self.SE_mosaic_$watt;
                            $scope.set$kwh = self.SE_mosaic_$kwh;
                            $scope.term = mosaicterm;
                            $scope.purchasetype = "Loan";
                            $scope.financeprog = "SunEdison Mosaic SCION";
                            $scope.YearsSavings = self.SE_mosaic_savings;
                            if (removeCommaFromNumbers(self.SE_mosaic_savings) > 0)
                                assembleMosaicjson();
                            else
                                showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
                        } else
                            showErrorDialog("Please enter your Home Improvement Sales Registration number for the installation agreement");
                    } else {
                        $scope.set$watt = self.SE_mosaic_$watt;
                        $scope.set$kwh = self.SE_mosaic_$kwh;
                        $scope.term = mosaicterm;
                        $scope.purchasetype = "Loan";
                        $scope.financeprog = "SunEdison Mosaic SCION";
                        $scope.YearsSavings = self.SE_mosaic_savings;
                        if (removeCommaFromNumbers(self.SE_mosaic_savings) > 0)
                            assembleMosaicjson();
                        else
                            showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
                    }
                } else if (self.SE_checked === 12) {
                    if (retrievedObject.State === 'California' || retrievedObject.State === 'Connecticut' || retrievedObject.State === 'Maryland' || retrievedObject.State === 'New York') {
                        if (self.registrationnumber) {
                            $scope.set$watt = self.SE_cashss_$watt;
                            $scope.set$kwh = self.SE_cashss_$kwh;
                            $scope.term = 20;
                            $scope.purchasetype = "Cash";
                            $scope.financeprog = "CSS-SAI";
                            $scope.YearsSavings = self.SE_cashss_savings;
                            if (removeCommaFromNumbers(self.SE_cashss_savings) > 0)
                                assembleMosaicjson();
                            else
                                showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
                        } else
                            showErrorDialog("Please enter your Home Improvement Sales Registration number for the installation agreement");
                    } else {
                        $scope.set$watt = self.SE_cashss_$watt;
                        $scope.set$kwh = self.SE_cashss_$kwh;
                        $scope.term = 20;
                        $scope.purchasetype = "Cash";
                        $scope.financeprog = "CSS-SAI";
                        $scope.YearsSavings = self.SE_cashss_savings;
                        if (removeCommaFromNumbers(self.SE_cashss_savings) > 0)
                            assembleMosaicjson();
                        else
                            showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
                    }
                } else if (self.SE_checked === 11) {
                    if (retrievedObject.State === 'California' || retrievedObject.State === 'Connecticut' || retrievedObject.State === 'Maryland' || retrievedObject.State === 'New York') {
                        if (self.registrationnumber) {
                            $scope.set$watt = self.SE_cash_$watt;
                            $scope.set$kwh = self.SE_cash_$kwh;
                            $scope.term = 20;
                            $scope.purchasetype = "Cash";
                            $scope.financeprog = "Cash-SAI";
                            $scope.YearsSavings = self.SE_cash_savings;
                            if (removeCommaFromNumbers(self.SE_cash_savings) > 0)
                                assembleMosaicjson();
                            else
                                showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
                        } else
                            showErrorDialog("Please enter your Home Improvement Sales Registration number for the installation agreement");
                    } else {
                        $scope.set$watt = self.SE_cash_$watt;
                        $scope.set$kwh = self.SE_cash_$kwh;
                        $scope.term = 20;
                        $scope.purchasetype = "Cash";
                        $scope.financeprog = "Cash-SAI";
                        $scope.YearsSavings = self.SE_cash_savings;
                        if (removeCommaFromNumbers(self.SE_cash_savings) > 0)
                            assembleMosaicjson();
                        else
                            showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
                    }
                }
            }
        else
        {            
            if (self.ID_checked=== 5){
                $scope.set$watt = self.ID_ppa_$watt;
                $scope.set$kwh = self.ID_ppa_$kwh;
                $scope.escalator = ppaescalatorrate;
                $scope.purchasetype =  "PPA";
                $scope.financeprog =  "PPA 1.0";
                $scope.YearsSavings = self.ID_ppa_savings;
                if(removeCommaFromNumbers(self.ID_ppa_savings) > 0)
                    assemblePPAjson();
                else
                     showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
            }
            else if (self.ID_checked === 4){
                $scope.set$watt = self.ID_lease_$watt;
                $scope.set$kwh = self.ID_lease_$kwh;
                $scope.escalator = leaseescalatorrate;
                $scope.purchasetype =  "Lease - Monthly";
                $scope.financeprog =  "PPA 1.0";
                $scope.YearsSavings = self.ID_lease_savings;
                if(removeCommaFromNumbers(self.ID_lease_savings) > 0)
                    assemblePPAjson();
                else
                     showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
            }
            else if (self.ID_checked === 2) {
                $scope.set$watt = self.ID_cashss_$watt;
                $scope.set$kwh = self.ID_cashss_$kwh;
                $scope.purchasetype =  "Cash";
                $scope.financeprog =  "CSS";
                $scope.YearsSavings = self.ID_cashss_savings;
                if(removeCommaFromNumbers(self.ID_cashss_savings) > 0)
                    assembleCashjson();
                else
                     showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
            }
            else if (self.ID_checked === 1) {
                $scope.set$watt = self.ID_cash_$watt;
                $scope.set$kwh = self.ID_cash_$kwh;
                $scope.purchasetype =  "Cash";
                $scope.financeprog =  "Cash";
                $scope.YearsSavings = self.ID_cash_savings;
                if(removeCommaFromNumbers(self.ID_cash_savings) > 0)
                    assembleCashjson();
                else
                     showErrorDialog("Your savings with solar are negative. Please make the appropriate changes.");
            }
        }
}

function assemblePPAjson(){
    self.buildbutton = true;
    $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/PPAfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                var financedetails = eval("(" + payLoad + ")");                
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString();       
                if($rootScope.PricingQuoteId){                    
                    financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');                 
                if($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                if($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                if($scope.financeprog === 'PPA 1.0')
                    financedetails.Quote.VariablePricing = (!self.variablePricing_ppa);
                financedetails.Quote.YearsSavings = $scope.YearsSavings;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption) ;    
                financedetails.Quote.PurchaseType = ($scope.purchasetype).toString(); 
                financedetails.Quote.FinancingProgram = ($scope.financeprog).toString(); 
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();                
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                financedetails.Quote.PPARate = ($scope.set$kwh).toString();
                financedetails.Quote.ASP = ($scope.set$watt).toString();
                if($scope.purchasetype === "Cash" || $scope.purchasetype === "Loan"){
                    financedetails.Quote.PricePerWatt = ($scope.kwhtoconvert).toString();
                    financedetails.Quote.LoanStartDate = getSystemDate();
                    financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString(); 
                }
                if($scope.financeprog === "SunEdison Mosaic SCION With Signature Series")                    
                    financedetails.Quote.MosaicTenor = mosaicssterm;
                else if($scope.financeprog === "SunEdison Mosaic SCION")                    
                    financedetails.Quote.MosaicTenor = mosaicterm;
                else if($scope.purchasetype === "Cash")
                    financedetails.Quote.MosaicTenor = 20;
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);   
                financedetails.Quote.PeriodicRentEscalation = $scope.escalator;                
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                financedetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;
                
                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if(j>0)
                        financedetails.Array.push({});
                    var arraynumber = j+ 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270)/1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    var Shading = [];
                    for(var i=0; i<12;i++){
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }                    
                    financedetails.Array[j].Shading = Shading;
                }
                /*if($scope.kwhtowattflag)
                    financeProgramKwhToWattConversion(financedetails);
                else if($scope.watttokwhflag)
                    financeProgramWattToKwhConversion(financedetails);
                else*/
                    financecalculation(financedetails);
            });    
}

function assembleMosaicjson(){
    if($scope.purchasetype ===  "Cash")
        $rootScope.cashfinanceprog ='Cash';
    
    $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/Loanfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                var financedetails = eval("(" + payLoad + ")");                
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString(); 
                if($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                if($scope.financeprog === 'CSS-SAI')
                    financedetails.Quote.VariablePricing = (!self.variablePricing_cashss);
                if($scope.financeprog === 'Cash-SAI')
                    financedetails.Quote.VariablePricing = (!self.variablePricing_cash);
                financedetails.Quote.YearsSavings = $scope.YearsSavings;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.Proposaltitle = (self.proposaltitle).toString();
                financedetails.Quote.RegistrationNumber = self.registrationnumber;
                financedetails.Quote.PricePerWatt = (retrievedObject.utilityrate).toString();//($scope.set$kwh).toString();
                financedetails.Quote.ASP = ($scope.set$watt).toString();
                financedetails.Quote.PurchaseType = ($scope.purchasetype).toString();
                financedetails.Quote.FinancingProgram = ($scope.financeprog).toString();
                financedetails.Quote.MosaicTenor = ($scope.term).toString();
                financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString();                
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.LoanStartDate = getSystemDate();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();            
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption) ;      
                financedetails.Quote.MasterTariffId = (retrievedObject.MasterTariffId).toString();
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                 if($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = retrievedObject.inverterId;
                financedetails.System.InverterModel = retrievedObject.inverterId;
                var custname = ($rootScope.customerName.replace(/%20/g, " ")).split(" ");
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if(j>0)
                        financedetails.Array.push({});
                    var arraynumber = j+ 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270)/1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;                    
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    var Shading = [];
                    for(var i=0; i<12;i++){
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                
                financecalculation(financedetails);
            });    
}

function assembleCashjson(){
    $rootScope.cashfinanceprog ='Cash';
    $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/Cashfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");                
                financedetails.SunEdCustId = $rootScope.SunEdCustId;  
                if($rootScope.PricingQuoteId){
                   financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                
                if($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                 if($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                financedetails.Quote.YearsSavings = $scope.YearsSavings;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption) ; 
                financedetails.Quote.PurchaseType = ($scope.purchasetype).toString(); 
                financedetails.Quote.FinancingProgram = ($scope.financeprog).toString(); 
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.ASP = ($scope.set$kwh).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PricePerWatt = ($scope.set$watt).toString();
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod); 
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;                
                financedetails.Quote.PreSolarTariff  = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                //financedetails.ProposalTool = retrievedObject;
                financedetails.System.InverterId = retrievedObject.inverterId;
                financedetails.System.InverterModel = retrievedObject.inverterId;
                
                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if(j>0)
                        financedetails.Array.push({});
                    var arraynumber = j+ 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270)/1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    var Shading = [];
                    for(var i=0; i<12;i++){
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                financecalculation(financedetails);
            });    
            
}
    /*function financeProgramKwhToWattConversion(financedetails){
        self.buildbutton = true;
        PricingConversion_v1.save(financedetails).$promise
                                    .then(function (response) {
                                        $scope.kwhtowattflag = false;
                                    if (self.dealertypeview) {                                        
                                            if(response.PurchaseType ===  "PPA")
                                                self.SE_ppa_$watt = (response['DealerASP/W']);
                                            else if(response.PurchaseType ===  "Lease - Monthly")
                                                self.SE_lease_$watt = (response['DealerASP/W']);
                                    }
                                    else
                                    {
                                        if(response.PurchaseType ===  "PPA")
                                            self.ID_ppa_$watt = (response['DealerASP/W']);
                                        else if(response.PurchaseType ===  "Lease - Monthly")
                                            self.ID_lease_$watt = (response['DealerASP/W']);
                                    }
                                        self.buildbutton = false;
                                    })
                                    .catch(function () {
                                        console.log('finprog conversion failed');
                                        self.buildbutton = false;
                                        showErrorDialog('Finprog conversion failed');
                                    });
    }
    
        function financeProgramWattToKwhConversion(financedetails) {
            self.buildbutton = true;
            var FinDetails = {};
            PricingConversion_v2.save(financedetails).$promise
                    .then(function (response) {
                        if ($scope.purchasetype === "PPA"){
                            self.ID_ppa_$kwh = parseFloat(response.PPARate).toFixed(3);                    
                            FinDetails.financeprogram = 'PPA';
                            FinDetails.$kwh = self.ID_ppa_$kwh;
                            FinDetails.escalator = parseFloat((ppaescalatorrate * 100).toFixed(1));
                        }
                        else{
                            self.ID_lease_$kwh = parseFloat(response.PPARate).toFixed(3);                      
                            FinDetails.financeprogram = 'Lease';
                            FinDetails.$kwh = self.ID_lease_$kwh;
                            FinDetails.escalator = parseFloat((leaseescalatorrate*100).toFixed(1));
                        }
                        FinDetails.bypassconversion = 'true';
                        self.buildbutton = false;
                        paymentApiCall(FinDetails);
                    })
                    .catch(function () {
                        console.log('finprog conversion failed');
                        self.buildbutton = false;
                        showErrorDialog('Finprog conversion failed');
                    });
        }*/
        
        function financecalculation(financedetails) {
            self.buildbutton = true;
            self.loading = true;
            if ($rootScope.designtofinance === 0) {
                DeleteProposal.delete({proposalid: $rootScope.PricingQuoteId}).$promise
                        .then(function () {
                            FinanceCalc.save(financedetails).$promise
                                    .then(function (response) {
                                        console.log("Finprog call");
                                        $rootScope.PricingQuoteId = response.PricingQuoteId;
                                        $rootScope.FinanceProgram = response.FinanceProgram;
                                        $rootScope.PurchaseType = response.PurchaseType;
                                        $state.go('proposaloverview');
                                    })
                                    .catch(function () {
                                        console.log('finprog failed');
                                        showErrorDialog('Finprog api failed');
                                        $state.go('financeoption');
                                    });
                        })
                        .catch(function () {
                                        console.log('propsal delete failed');
                                        showErrorDialog('Delete proposal api failed');
                                        $state.go('financeoption');
                                        self.loading = false;
                                    });
            }
            else {
                FinanceCalc.save(financedetails).$promise
                        .then(function (response) {
                            console.log("Finprog call");
                            $rootScope.PricingQuoteId = response.PricingQuoteId;
                            $rootScope.FinanceProgram = response.FinanceProgram;
                            $rootScope.PurchaseType = response.PurchaseType;
                            $state.go('proposaloverview');
                        })
                        .catch(function (error) {
                            console.log('finprog failed');
                            showErrorDialog('Finprog api failed');
                            self.buildbutton = false;
                            $state.go('financeoption');
                            self.loading = false;
                        });
            }
        }
        
        function savingscalculation(FinanceArray, PaymentArray) {
            //self.buildbutton = true;
            var production = parseFloat($rootScope.totalprod).toFixed(0);
            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
            var year1saving = parseFloat(+presolarannual - +postsolarannual - +PaymentArray[0]).toFixed(2);
            var prod2 = production;
            var annualsaving = 0;
            var totalsaving = 0;
            for (var j = 1; j < 20; j++)
            {
                var temp_prod = prod2 * 0.005;
                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                var temp_pre = presolarannual * 0.034;
                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                var temp_post = postsolarannual * 0.034;
                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                annualsaving = parseFloat(+presolarannual - +postsolarannual - +PaymentArray[j]).toFixed(2);
                totalsaving = (+totalsaving + +annualsaving);
            }
            var finalsaving = (+totalsaving + +year1saving).toFixed(0);
            console.log(FinanceArray.financeprogram + " finalsaving - " + finalsaving);
            if (FinanceArray.financeprogram === 'PPA') {
                self.SE_ppa_savings = numberWithCommas(finalsaving);
                self.ID_ppa_savings = numberWithCommas(finalsaving);
            } else if (FinanceArray.financeprogram === 'Lease') {
                self.SE_lease_savings = numberWithCommas(finalsaving);
                self.ID_lease_savings = numberWithCommas(finalsaving);
            } else if (FinanceArray.financeprogram === 'Cash-SS') {
                self.SE_cash_savings = numberWithCommas(finalsaving);
            } else if (FinanceArray.financeprogram === 'Cash') {
                self.SE_cashss_savings = numberWithCommas(finalsaving);
            }
            //self.buildbutton = false;
        }
        
        function cashPaymentCalc(FinDetails){
            self.buildbutton = true;
            var Payload =
                        {
                            'Quote': {
                                'LoanStartDate': getSystemDate(),
                                'PricePerWatt': FinDetails.$watt,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': 'SALES ENGINE (Seller)',
                                'Year1Production': retrievedObject.year1production,
                                'Year1Yield': retrievedObject.systemyield,
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,                                
                                'MosaicTenor': 20,
                                'ChannelType': "Door-to-door",
                                'SignatureSeries': FinDetails.SSmarker,
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode
                            }
                        };
                
                LoanPayment.save(Payload).$promise
                        .then(function (data) {
                            var temp =0;
                            var dummyarray = [];
                            for (var k = 0; k < data.LoanPayments.length; k++)
                            {
                                temp = (data.LoanPayments[k] * 12).toString();
                                dummyarray.push(temp);
                            }
                            $scope.pricingpaymentflag = true;
                            if($scope.pricingconversionflag && $scope.pricingpaymentflag)
                               self.buildbutton = false;
                            savingscalculation(FinDetails, dummyarray);
                        });
        }
        
        function paymentApiCall(FinDetails){
            self.buildbutton = true;
            var Payload_PPA =
                        {
                            'Quote': {
                                'PPARate': FinDetails.$kwh,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': $rootScope.PartnerType,
                                'Year1Production': retrievedObject.year1production,
                                'CustomerPrepayment': "0",
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,
                                'PeriodicRentEscalation': (FinDetails.escalator / 100).toFixed(4),
                                'SubstantialCompletionDate': "11/10/2015",
                                'CurrentUtilityCost': retrievedObject.presolarutility,
                                'PostSolarUtilityCost': retrievedObject.postsolarutility,
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode,
                                'LastYear': 20
                            }
                        };
                        if ($scope.incentivechecked) {
                            Payload_PPA.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                            Payload_PPA.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                        } else {
                            Payload_PPA.Quote.UpfrontRebateAssumptionsMax = 0;
                            Payload_PPA.Quote.UpfrontRebateAssumptions = 0;
                        }
                
                self.ppapaymentCallMade = true;
                Payment.save(Payload_PPA).$promise
                        .then(function (data) {
                            var temp =0;
                            var dummyarray = [];
                             if(FinDetails.financeprogram === 'PPA'){
                                 for (var k = 0; k < data.PPAPayments.length; k++)
                                    {
                                        temp = (data.PPAPayments[k] * 12).toString();
                                        dummyarray.push(temp);
                                    }
                                    PPAPayments = [];
                                    PPAPayments = dummyarray;
                             }
                             else{
                                 for (var k = 0; k < data.LeasePayments.length; k++)
                                    {
                                        temp = (data.LeasePayments[k] * 12).toString();
                                        dummyarray.push(temp);
                                    }
                                    LeasePayments = [];
                                    LeasePayments = dummyarray;
                             }
                             $scope.pricingpaymentflag = true;
                             if($scope.pricingconversionflag && $scope.pricingpaymentflag)
                                self.buildbutton = false;
                             savingscalculation(FinDetails, dummyarray);
                        });
        }
        
        function paymentApiCallMosaic(FinDetails){            
            self.buildbutton = true;            
            if(FinDetails.financeprogram === 'Mosaic'){
                var SSmarker = "No";
                var $watt = self.SE_mosaic_$watt;
                mosaicterm = FinDetails.loanterm;
                assembleSEMosaicjson();
            }
            else{
                var SSmarker = "Yes";
                var $watt = self.SE_mosaicss_$watt;
                mosaicssterm = FinDetails.loanterm;
                assembleSEMosaicSSjson();  
            }
            
            /*var Payload_Mosaic =
                        {
                            'Quote': {
                                'LoanStartDate': getSystemDate(),
                                'PricePerWatt': $watt,
                                'SunEdCustId': $rootScope.SunEdCustId,
                                'PartnerType': 'SALES ENGINE (Seller)',
                                'Year1Production': retrievedObject.year1production,
                                'Year1Yield': retrievedObject.systemyield,
                                'State': retrievedObject.State,
                                'UtilityIndex': retrievedObject.utilityLseid,                                
                                'MosaicTenor': FinDetails.loanterm,
                                'ChannelType': "Door-to-door",
                                'SignatureSeries': SSmarker,
                                'ProposalID': "1",
                                'SystemSize': retrievedObject.systemsize,
                                'ZipCode': retrievedObject.ZipCode
                            }
                        };

                self.ppapaymentCallMade = true;
                LoanPayment.save(Payload_Mosaic).$promise
                        .then(function (data) {
                            var temp =0;
                            var dummyarray = [];
                              for (var k = 0; k < data.LoanPayments.length-5; k++)
                                    {
                                        temp = (data.LoanPayments[k] * 12).toString();
                                        dummyarray.push(temp);
                                    }
                        
                            var annualsaving = 0;
                            var totalsaving = 0;
                            var finalsaving = 0;
                            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
                            var prod2 = prod1;
                            var production = 0;
                            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
                            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
                            var year1saving = parseFloat(+presolarannual - +postsolarannual - +dummyarray[0]).toFixed(2);
                            for (var j = 1; j < 20; j++)
                            {
                                var temp_prod = (prod2 * 0.005).toFixed(0);
                                prod2 = parseFloat(+prod2 - +temp_prod).toFixed(0);
                                production = parseInt(+production + +prod2).toFixed(0);
                                var temp_pre = (presolarannual * 0.034).toFixed(2);
                                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                                var temp_post = (postsolarannual * 0.034).toFixed(2);
                                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                                annualsaving = parseFloat(+presolarannual - +postsolarannual - +dummyarray[j]).toFixed(2);
                                totalsaving = (+totalsaving + +annualsaving).toFixed(2);
                            }
                            $scope.mosaicss_totalproduction = (+production + +prod1).toFixed(2);   
                            finalsaving = (+totalsaving + +year1saving).toFixed(0);
                            if(FinDetails.financeprogram === 'Mosaic')
                                self.SE_mosaic_savings = numberWithCommas(finalsaving);
                            else
                                self.SE_mosaicss_savings = numberWithCommas(finalsaving);
                            console.log(" Mosaic FinalSaving - " + finalsaving);
                            self.buildbutton = false; 
                            if(FinDetails.financeprogram === 'Mosaic')
                                assembleSEMosaicjson();
                            else
                                assembleSEMosaicSSjson();
                        });*/
        }
        
        function watttokwhconversion() {
            self.buildbutton = true;
            //var FinDetails = {};
            if (self.dealertypeview) {
                switch (self.SE_checked) {
                    case 16:
                    {
                        $scope.ASPW = self.SE_ppa_$watt;
                        $scope.purchasetype =  "PPA";
                        $scope.financeprog =  "PPA 1.0";
                        $scope.VariablePricing = true;
                        assemblePricingConversionSE();
                        break;
                    }
                    case 12:
                    {
                        $scope.ASPW = self.SE_cashss_$watt;
                        $scope.purchasetype =  "Cash";
                        $scope.financeprog =  "CSS-SAI";
                        $scope.VariablePricing = true;
                        assemblePricingConversionSE();
                        /*FinDetails.$watt = self.SE_cashss_$watt;
                        FinDetails.financeprogram = 'Cash-SS';
                        FinDetails.SSmarker = 'Yes';
                        cashPaymentCalc(FinDetails);*/
                        break;
                    }
                    case 11:
                    {
                        $scope.ASPW = self.SE_cash_$watt;
                        $scope.purchasetype =  "Cash";
                        $scope.financeprog =  "Cash-SAI";
                        $scope.VariablePricing = true;
                        assemblePricingConversionSE();
                        /*FinDetails.$watt = self.SE_cash_$watt;
                        FinDetails.financeprogram = 'Cash';
                        FinDetails.SSmarker = 'No';
                        cashPaymentCalc(FinDetails);*/
                        break;
                    }
                }
            } else
            {
                switch (self.ID_checked) {
                    case 5:
                    {
                        if (!isNaN(self.ID_ppa_$watt) && (self.ID_ppa_$watt > 0)) {
                            $scope.ASPW = self.ID_ppa_$watt;
                            $scope.escalator = ppaescalatorrate;
                            $scope.purchasetype = "PPA";
                            $scope.financeprog = "PPA 1.0";
                            assemblePricingV2_ID();

                        }
                        break;
                    }
                    case 4:
                    {
                        if (!isNaN(self.ID_lease_$watt) && (self.ID_lease_$watt > 0)) {
                            $scope.ASPW = self.ID_lease_$watt;
                            $scope.escalator = leaseescalatorrate;
                            $scope.purchasetype = "Lease - Monthly";
                            $scope.financeprog = "PPA 1.0";
                            assemblePricingV2_ID();
                        }
                        break;
                    }
                    case 2:
                    {
                        if (!isNaN(self.ID_cashss_$watt) && (self.ID_cashss_$watt > 0)) {
                            $scope.cashflag = 'ID_cashss_watt';
                            cashCalculation();
                        }
                        break;
                    }
                    case 1:
                    {
                        if (!isNaN(self.ID_cash_$watt) && (self.ID_cash_$watt > 0)) {
                            $scope.cashflag = 'ID_cash_watt';
                            cashCalculation();
                        }
                        break;
                    }
                }
            }
        }
        
        function kwhtowattconversion() {
            self.buildbutton = true;
            //var FinDetails = {};
                switch (self.ID_checked) {
                    case 5:
                    {
                        if (!isNaN(self.ID_ppa_$kwh) && (self.ID_ppa_$kwh > 0)) {
                            $scope.pricingconversionflag = false;
                            $scope.pricingpaymentflag = false;
                            $scope.pparate = self.ID_ppa_$kwh;
                            $scope.escalator = ppaescalatorrate;
                            $scope.purchasetype = "PPA";
                            $scope.financeprog = "PPA 1.0";
                            assemblePricingV1_ID();
                            /*FinDetails.financeprogram = 'PPA';
                            FinDetails.$kwh = self.ID_ppa_$kwh;
                            FinDetails.escalator = parseFloat((ppaescalatorrate * 100).toFixed(1));
                            FinDetails.bypassconversion = 'true';
                            paymentApiCall(FinDetails);*/
                        }
                        break;
                    }
                    case 4:
                    {
                        if (!isNaN(self.ID_lease_$kwh) && (self.ID_lease_$kwh > 0)) {
                            $scope.pricingconversionflag = false;
                            $scope.pricingpaymentflag = false;
                            $scope.pparate = self.ID_lease_$kwh;
                            $scope.escalator = leaseescalatorrate;
                            $scope.purchasetype = "Lease - Monthly";
                            $scope.financeprog = "PPA 1.0";
                            assemblePricingV1_ID();
                            /*FinDetails.financeprogram = 'Lease';
                            FinDetails.$kwh = self.ID_lease_$kwh;
                            FinDetails.escalator = parseFloat((leaseescalatorrate * 100).toFixed(1));
                            FinDetails.bypassconversion = 'true';
                            paymentApiCall(FinDetails);*/
                        }
                        break;
                    }
                    case 2:
                    {
                        if (!isNaN(self.ID_cashss_$kwh) && (self.ID_cashss_$kwh > 0)) {
                            $scope.cashflag = 'ID_cashss_kwh';
                            cashCalculation();
                        }
                        break;
                    }
                    case 1:
                    {
                        if (!isNaN(self.ID_cash_$kwh) && (self.ID_cash_$kwh > 0)) {
                            $scope.cashflag = 'ID_cash_kwh';
                            cashCalculation();
                        }
                        break;
                    }
                }
        }
        
        function cashCalculation() {

            var annualsaving = 0;
            var tempsaving = 0;
            var prod1 = parseFloat($rootScope.totalprod).toFixed(0);
            var tempprod = prod1;
            //prod1 = (prod1 * 0.95).toFixed(0);
            //var prod2 = tempprod;
            var production = 0;
            var finalpresolar = parseFloat($rootScope.presolarbill).toFixed(2);
            var finalpostsolar = parseFloat($rootScope.postsolarbill).toFixed(2);
            var presolarannual = parseFloat($rootScope.presolarbill).toFixed(2);
            var postsolarannual = parseFloat($rootScope.postsolarbill).toFixed(2);
            var year1saving = parseFloat(presolarannual - postsolarannual).toFixed(2);
            for (var j = 1; j < 20; j++)
            {
                var prod = parseFloat(+tempprod - +(tempprod * 0.005)).toFixed(0);
                production = parseInt(+production + +prod).toFixed(0);
                tempprod = prod;
                var temp_pre = (presolarannual * 0.034).toFixed(2);
                presolarannual = parseFloat(+presolarannual + +temp_pre).toFixed(2);
                finalpresolar = (+finalpresolar + +presolarannual);
                var temp_post = (postsolarannual * 0.034).toFixed(2);
                postsolarannual = parseFloat(+postsolarannual + +temp_post).toFixed(2);
                finalpostsolar = (+finalpostsolar + +postsolarannual);
                var tempsaving = parseFloat(+presolarannual - +postsolarannual).toFixed(2);
                annualsaving = parseInt(+annualsaving + +tempsaving).toFixed(2);
            }
            annualsaving = parseInt(+year1saving + +annualsaving).toFixed(0);
            $scope.totalproduction = (+production + +prod1).toFixed(2);

            if ($scope.cashflag === 'ID_cash_kwh') {
                var systemcost = (270 * retrievedObject.PanelCount * self.ID_cash_$watt).toFixed(0);
                self.ID_cash_$watt = parseFloat((self.ID_cash_$kwh * $scope.totalproduction)/($rootScope.systemsize * 1000)).toFixed(2);
                var totalcost = (+finalpostsolar + +systemcost).toFixed(0);
                var finalsavings = (+finalpresolar - +totalcost).toFixed(0);
                self.ID_cash_cashprice = numberWithCommas(systemcost);
                self.ID_cash_savings = numberWithCommas(finalsavings);
            } else if ($scope.cashflag === 'ID_cash_watt') {
                //self.ID_cash_$kwh = parseFloat((self.ID_cash_$watt * ($rootScope.systemsize * 1000)) / $scope.totalproduction).toFixed(3);
                var systemcost = (270 * retrievedObject.PanelCount * self.ID_cash_$watt).toFixed(0);
                self.ID_cash_$kwh = parseFloat(systemcost / $scope.totalproduction).toFixed(3);
                var totalcost = (+finalpostsolar + +systemcost).toFixed(0);
                var finalsavings = (+finalpresolar - +totalcost).toFixed(0);
                self.ID_cash_cashprice = numberWithCommas(systemcost);
                self.ID_cash_savings = numberWithCommas(finalsavings);
            } else if ($scope.cashflag === 'ID_cashss_kwh') {
                var systemcost = (270 * retrievedObject.PanelCount * self.ID_cashss_$watt).toFixed(0);
                self.ID_cashss_$watt = parseFloat((self.ID_cashss_$kwh * $scope.totalproduction)/($rootScope.systemsize * 1000)).toFixed(2);
                var totalcost = (+finalpostsolar + +systemcost).toFixed(0);
                var finalsavings = (+finalpresolar - +totalcost).toFixed(0);
                self.ID_cashss_cashprice = numberWithCommas(systemcost);
                self.ID_cashss_savings = numberWithCommas(finalsavings);
            } else if ($scope.cashflag === 'ID_cashss_watt') {
                //self.ID_cashss_$kwh = parseFloat((self.ID_cashss_$watt * ($rootScope.systemsize * 1000)) / $scope.totalproduction).toFixed(3);
                var systemcost = (270 * retrievedObject.PanelCount * self.ID_cashss_$watt).toFixed(0);
                self.ID_cashss_$kwh = parseFloat(systemcost / $scope.totalproduction).toFixed(3);
                var totalcost = (+finalpostsolar + +systemcost).toFixed(0);
                var finalsavings = (+finalpresolar - +totalcost).toFixed(0);
                self.ID_cashss_cashprice = numberWithCommas(systemcost);
                self.ID_cashss_savings = numberWithCommas(finalsavings);
            }
            $scope.cashflag = "";
            self.buildbutton = false;
        }
        
        function financeprogchange(column) {
        //self.buildbutton = true;
            if (self.dealertypeview) {
                switch (column) {
                    case 16:
                    {
                        $scope.kwh = self.SE_ppa_$watt;
                        $scope.purchasetype_incentive = "PPA";
                        self.SE_checked = 16;
                        self.showITC = false;
                        getIncentiveData(); 
                        break;
                    }
                    case 15:
                    {
                        $scope.kwh = self.SE_lease_$watt;
                        $scope.purchasetype_incentive = "Lease - Monthly";
                        self.SE_checked = 15;
                        self.showITC = false;
                        getIncentiveData(); 
                        break;
                    }
                    case 14:
                    {
                        $scope.kwh = self.SE_mosaic_$watt;
                        self.SE_checked = 14;
                        self.showincentive = false;
                        self.showITC = false;
                        //self.buildbutton = false;
                        break;
                    }
                    case 13:
                    {
                        $scope.kwh = self.SE_mosaicss_$watt;
                        self.SE_checked = 13;
                        self.showincentive = false;
                        self.showITC = false;
                        //self.buildbutton = false;
                        break;
                    }
                    case 12:
                    {
                        $scope.kwh = self.SE_cashss_$watt;
                        self.SE_checked = 12;
                        self.showincentive = false;
                        self.showITC = false;
                        //self.buildbutton = false;
                        break;
                    }
                    case 11:
                    {
                        $scope.kwh = self.SE_cash_$watt;
                        self.SE_checked = 11;
                        self.showincentive = false;
                        self.showITC = false;
                        //self.buildbutton = false;
                        break;
                    }
                }
            }
            else
            {
                switch (column) {
                    case 5:
                    {
                        $scope.kwh = self.ID_ppa_$watt;
                        $scope.purchasetype_incentive = "PPA";
                        self.ID_checked = 5;
                        self.showITC = false;
                        getIncentiveData(); 
                        break;
                    }
                    case 4:
                    {
                        $scope.kwh = self.ID_lease_$watt;
                        $scope.purchasetype_incentive = "Lease - Monthly";
                        self.ID_checked = 4;            
                        self.showITC = false;
                        getIncentiveData(); 
                        break;
                    }
                    case 2:
                    {
                        $scope.kwh = self.ID_cashss_$watt;
                        $scope.purchasetype_incentive =  "Cash";
                        self.ID_checked = 2;
                        getIncentiveData(); 
                        break;
                    }
                    case 1:
                    {
                        $scope.kwh = self.ID_cash_$watt;
                        $scope.purchasetype_incentive =  "Cash";
                        self.ID_checked = 1;
                        getIncentiveData(); 
                        break;
                    }
                }
            }
        }
        
        function getIncentiveData(){                   
            var systemcost = (270 * ($scope.kwh) * (retrievedObject.PanelCount)).toFixed(0);            
            var Payload = {
                                'systemCost': (systemcost).toString(),
                                'systemSizeAcW': (retrievedObject.systemSizeACW).toString(),
                                'systemSizeDcW': (retrievedObject.systemsize * 1000).toString(),
                                'zipCode': (retrievedObject.ZipCode).toString(),
                                'purchaseType': ($scope.purchasetype_incentive).toString(),
                                'consumption': (retrievedObject.annualusage).toString(),
                                'production': (retrievedObject.year1production).toString(),
                                'isConEdCustomer': 'false',
                                'azimuth': retrievedObject.Array[0].Azimuth,
                                'tilt': retrievedObject.Array[0].Tilt
                        };
            if($rootScope.utilityLseid === '2252')
                Payload.isConEdCustomer = 'true';
            Incentives.save(Payload).$promise
                    .then(function (data) {
                            for (var k = 0; k < data.incentives.length; k++)
                            {
                                self.showincentive = true;
                                if (data.incentives[0].incentiveType === 'utility') {
                                    self.incentivetitle = 'Utility Rebate';
                                } else if (data.incentives[0].incentiveType === 'state') {
                                    self.incentivetitle = 'State Rebate';
                                }
                                if (data.incentives[0].quantityKey){
                                    self.incentivevalue = data.incentives[0].incentiveValue + ' (' + data.incentives[0].rate + '/watt)';
                                    $scope.incentivevalue = data.incentives[0].incentiveValue;
                                }
                                if (!data.incentives[0].quantityKey) {
                                    self.incentivevalue = data.incentives[0].incentiveValue;
                                    $scope.incentivevalue = data.incentives[0].incentiveValue;
                                    $scope.UpfrontRebateAssumptionsMax = data.incentives[0].rate;
                                }
                                if (data.incentives[0].quantityKey === 'systemSizeDcW' || data.incentives[0].quantityKey === 'systemSizeAcW')
                                    $scope.UpfrontRebateAssumptions = data.incentives[0].rate;
                            }
                            
                        if (!self.dealertypeview) {
                            if (self.ID_checked === 1) {
                                self.showITC = true;
                                if ($("#checkbox2").is(":checked"))
                                    self.ITCincentive = ((removeCommaFromNumbers(self.ID_cash_cashprice) - $scope.incentivevalue) * 0.3).toFixed(2);
                                else
                                    self.ITCincentive = (removeCommaFromNumbers(self.ID_cash_cashprice) * 0.3).toFixed(2);
                            } else if (self.ID_checked === 2) {
                                self.showITC = true;
                                if ($("#checkbox2").is(":checked"))
                                    self.ITCincentive = ((removeCommaFromNumbers(self.ID_cashss_cashprice) - $scope.incentivevalue) * 0.3).toFixed(2);
                                else
                                    self.ITCincentive = (removeCommaFromNumbers(self.ID_cashss_cashprice) * 0.3).toFixed(2);
                            } else
                                self.showITC = false;
                        }
                        //self.buildbutton = false;
                       
                    })
                    .catch(function () {
                        console.log('incentive call failed');
                        self.buildbutton = false;
                    });
        }
        
        function incentiveChecked() {
            
            self.buildbutton = true;
            if (self.dealertypeview) {                
                if (self.SE_checked === 16) {
                    $scope.incentiveconversion = true;
                    if ($("#checkbox2").is(":checked"))
                    {
                        $scope.incentivechecked = true;
                        $scope.pparate = self.SE_ppa_$kwh;
                        $scope.escalator = ppaescalatorrate;
                        $scope.purchasetype = "PPA";
                        $scope.financeprog = "PPA 1.0";
                        assemblePricingV1_ID();
                    } else
                    {
                        $scope.incentivechecked = false;
                        $scope.pparate = self.SE_ppa_$kwh;
                        $scope.escalator = ppaescalatorrate;
                        $scope.purchasetype = "PPA";
                        $scope.financeprog = "PPA 1.0";
                        assemblePricingV1_ID();
                    }
                } else if (self.SE_checked === 15) {
                    $scope.incentiveconversion = true;
                    if ($("#checkbox2").is(":checked"))
                    {
                        $scope.incentivechecked = true;
                        $scope.pparate = self.SE_lease_$kwh;
                        $scope.escalator = leaseescalatorrate;
                        $scope.purchasetype = "Lease - Monthly";
                        $scope.financeprog = "PPA 1.0";
                        assemblePricingV1_ID();
                    } else
                    {
                        $scope.incentivechecked = false;
                        $scope.pparate = self.SE_lease_$kwh;
                        $scope.escalator = leaseescalatorrate;
                        $scope.purchasetype = "Lease - Monthly";
                        $scope.financeprog = "PPA 1.0";
                        assemblePricingV1_ID();
                    }
                }                
            } else {                
                if (self.ID_checked === 5) {
                    $scope.incentiveconversion = true;
                    if ($("#checkbox2").is(":checked"))
                    {
                        $scope.incentivechecked = true;
                        $scope.pparate = self.ID_ppa_$kwh;
                        $scope.escalator = ppaescalatorrate;
                        $scope.purchasetype = "PPA";
                        $scope.financeprog = "PPA 1.0";
                        assemblePricingV1_ID();
                    } else
                    {
                        $scope.incentivechecked = false;
                        $scope.pparate = self.ID_ppa_$kwh;
                        $scope.escalator = ppaescalatorrate;
                        $scope.purchasetype = "PPA";
                        $scope.financeprog = "PPA 1.0";
                        assemblePricingV1_ID();
                    }
                } else if (self.ID_checked === 4) {
                    $scope.incentiveconversion = true;
                    if ($("#checkbox2").is(":checked"))
                    {
                        $scope.incentivechecked = true;
                        $scope.pparate = self.ID_lease_$kwh;
                        $scope.escalator = leaseescalatorrate;
                        $scope.purchasetype = "Lease - Monthly";
                        $scope.financeprog = "PPA 1.0";
                        assemblePricingV1_ID();
                    } else
                    {
                        $scope.incentivechecked = false;
                        $scope.pparate = self.ID_lease_$kwh;
                        $scope.escalator = leaseescalatorrate;
                        $scope.purchasetype = "Lease - Monthly";
                        $scope.financeprog = "PPA 1.0";
                        assemblePricingV1_ID();
                    }
                }
                
                if (self.ID_checked === 1) {
                    self.showITC = true;
                    if ($("#checkbox1").is(":checked"))
                        $scope.ITCChecked = true;
                    else
                        $scope.ITCChecked = false;
                    if ($("#checkbox2").is(":checked"))
                        self.ITCincentive = ((removeCommaFromNumbers(self.ID_cash_cashprice) - $scope.incentivevalue) * 0.3).toFixed(2);
                    else
                        self.ITCincentive = (removeCommaFromNumbers(self.ID_cash_cashprice) * 0.3).toFixed(2);
                    self.buildbutton = false;
                } else if (self.ID_checked === 2) {
                    self.showITC = true;
                    if ($("#checkbox1").is(":checked"))
                        $scope.ITCChecked = true;
                    else
                        $scope.ITCChecked = false;
                    if ($("#checkbox2").is(":checked"))
                        self.ITCincentive = ((removeCommaFromNumbers(self.ID_cashss_cashprice) - $scope.incentivevalue) * 0.3).toFixed(2);
                    else
                        self.ITCincentive = (removeCommaFromNumbers(self.ID_cashss_cashprice) * 0.3).toFixed(2);
                    self.buildbutton = false;
                }                
            }                        
            /*if (!self.dealertypeview) {
                 else{
                    self.showITC = false;
                    self.buildbutton = false;
                }
            }*/
        
        }
        
        function numberWithCommas(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        
        function removeCommaFromNumbers(x) {
            return x.toString().replace(',', "");
        }
        
        function getSystemDate() {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            if (dd < 10) 
                dd = '0' + dd;
            if (mm < 10) 
                mm = '0' + mm;
            return (mm + '/' + dd + '/' + yyyy);
        }
        
        function assembleSECashjson() {
            self.buildbutton = true;
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/PPAfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString();
                if ($rootScope.PricingQuoteId) {
                    financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                
                if ($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                if ($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption);
                financedetails.Quote.PurchaseType = "Cash";
                financedetails.Quote.FinancingProgram = "Cash-SAI";
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if ($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                
                financedetails.Quote.PricePerWatt = (retrievedObject.utilityrate).toString();
                financedetails.Quote.LoanStartDate = getSystemDate();
                financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString();
                financedetails.Quote.MosaicTenor = 20;
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);
                financedetails.Quote.PeriodicRentEscalation = 0;
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                financedetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;

                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if (j > 0)
                        financedetails.Array.push({});
                    var arraynumber = j + 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270) / 1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    var Shading = [];
                    for (var i = 0; i < 12; i++) {
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                    FirstPricingConversionSE(financedetails);
            });
        }
        
        function assembleSECashSSjson() {
            self.buildbutton = true;
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/PPAfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString();
                if ($rootScope.PricingQuoteId) {
                    financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                
                if ($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                if ($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption);
                financedetails.Quote.PurchaseType = "Cash";
                financedetails.Quote.FinancingProgram = "CSS-SAI";
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if ($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                
                    financedetails.Quote.PricePerWatt = (retrievedObject.utilityrate).toString();
                    financedetails.Quote.LoanStartDate = getSystemDate();
                    financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString();
                    financedetails.Quote.MosaicTenor = 20;
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);
                financedetails.Quote.PeriodicRentEscalation = 0;
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                financedetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;

                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if (j > 0)
                        financedetails.Array.push({});
                    var arraynumber = j + 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270) / 1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    var Shading = [];
                    for (var i = 0; i < 12; i++) {
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                FirstPricingConversionSE(financedetails);

            });
        }
        
        function assembleSEMosaicjson() {
            self.buildbutton = true;
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/PPAfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString();
                if ($rootScope.PricingQuoteId) {
                    financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                
                if ($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                if ($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption);
                financedetails.Quote.PurchaseType = "Loan";
                financedetails.Quote.FinancingProgram = "SunEdison Mosaic SCION";
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if ($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                    financedetails.Quote.PricePerWatt = (retrievedObject.utilityrate).toString();
                    financedetails.Quote.LoanStartDate = getSystemDate();
                    financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString();
                    financedetails.Quote.MosaicTenor = mosaicterm;
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);
                financedetails.Quote.PeriodicRentEscalation = 0;
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                financedetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;

                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if (j > 0)
                        financedetails.Array.push({});
                    var arraynumber = j + 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270) / 1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    var Shading = [];
                    for (var i = 0; i < 12; i++) {
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                FirstPricingConversionSE(financedetails);

            });
        }
        
        function assembleSEMosaicSSjson() {
            self.buildbutton = true;
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/PPAfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString();
                if ($rootScope.PricingQuoteId) {
                    financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                
                if ($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                if ($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption);
                financedetails.Quote.PurchaseType = "Loan";
                financedetails.Quote.FinancingProgram = "SunEdison Mosaic SCION With Signature Series";
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if ($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                
                financedetails.Quote.PricePerWatt = (retrievedObject.utilityrate).toString();
                financedetails.Quote.LoanStartDate = getSystemDate();
                financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString();
                financedetails.Quote.MosaicTenor = mosaicssterm;
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);
                financedetails.Quote.PeriodicRentEscalation = 0;
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                financedetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;

                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if (j > 0)
                        financedetails.Array.push({});
                    var arraynumber = j + 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270) / 1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    var Shading = [];
                    for (var i = 0; i < 12; i++) {
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                    FirstPricingConversionSE(financedetails);

            });
        }
        
        function assembleLeaseJSONpricing() {
            self.buildbutton = true;
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/PPAfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString();
                if ($rootScope.PricingQuoteId) {
                    financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                
                if ($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                if ($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption);
                financedetails.Quote.PurchaseType = "Lease - Monthly";
                financedetails.Quote.FinancingProgram = "PPA 1.0";
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if ($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                financedetails.Quote.PPARate = ($scope.pricing).toString();
                financedetails.Quote.PeriodicRentEscalation = ($scope.escalator).toString();
                financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString();
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);                
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                financedetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;

                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if (j > 0)
                        financedetails.Array.push({});
                    var arraynumber = j + 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270) / 1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    var Shading = [];
                    for (var i = 0; i < 12; i++) {
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                    FirstPricingConversionSE(financedetails);

            });
        }
        
        function assemblePPAJSONpricing() {
            self.buildbutton = true;
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/PPAfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString();
                if ($rootScope.PricingQuoteId) {
                    financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                
                if ($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                if ($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption);
                financedetails.Quote.PurchaseType = "PPA";
                financedetails.Quote.FinancingProgram = "PPA 1.0";
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if ($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                financedetails.Quote.PPARate = ($scope.pricing).toString();
                financedetails.Quote.PeriodicRentEscalation = ($scope.escalator).toString();
                financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString();
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);                
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                financedetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;

                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if (j > 0)
                        financedetails.Array.push({});
                    var arraynumber = j + 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270) / 1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    var Shading = [];
                    for (var i = 0; i < 12; i++) {
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                    FirstPricingConversionSE(financedetails);

            });
        }
        
        function FirstPricingConversionSE(financedetails) {
            self.buildbutton = true;
            PricingConversion_v1.save(financedetails).$promise
                    .then(function (response) {
                        if(self.dealertypeview){
                        if (response.FinanceProgram === 'SunEdison Mosaic SCION With Signature Series') {
                            for (var i = 0; i < response.Pricing.output.length; i++) {
                                if (response.Pricing.output[i].name === "ASP ($/W)")
                                    self.SE_mosaicss_$watt = parseFloat(response.Pricing.output[i].value);
                            }
                            for (var i = 0; i < response.Pricing.output.length; i++) {
                                if (response.Pricing.output[i].name === "Customer 25-year LCOE ($/kWh)")
                                    self.SE_mosaicss_$kwh = parseFloat(response.Pricing.output[i].value).toFixed(3);
                            }
                            self.SE_mosaicss_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            $scope.mosaicsssavingsflag = true;
                        } else if (response.FinanceProgram === 'SunEdison Mosaic SCION') {
                            for (var i = 0; i < response.Pricing.output.length; i++) {
                                if (response.Pricing.output[i].name === "ASP ($/W)")
                                    self.SE_mosaic_$watt = parseFloat(response.Pricing.output[i].value);
                            }
                            for (var i = 0; i < response.Pricing.output.length; i++) {
                                if (response.Pricing.output[i].name === "Customer 25-year LCOE ($/kWh)")
                                    self.SE_mosaic_$kwh = parseFloat(response.Pricing.output[i].value).toFixed(3);
                            }
                            self.SE_mosaic_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            $scope.mosaicsavingsflag = true;
                        } else if (response.FinanceProgram === 'CSS-SAI') {
                            for (var i = 0; i < response.Pricing.output.length; i++) {
                                if (response.Pricing.output[i].name === "ASP ($/W)")
                                    self.SE_cashss_$watt = parseFloat(response.Pricing.output[i].value);
                            }
                            for (var i = 0; i < response.Pricing.output.length; i++) {
                                if (response.Pricing.output[i].name === "Customer 25-year LCOE ($/kWh)")
                                    self.SE_cashss_$kwh = parseFloat(response.Pricing.output[i].value).toFixed(3);
                            }
                            self.SE_cashss_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            self.SE_cashss_cashprice = numberWithCommas((270 * retrievedObject.PanelCount * self.SE_cashss_$watt).toFixed(0));
                            $scope.cashsssavingsflag = true;
                        } else if (response.FinanceProgram === 'Cash-SAI') {
                            for (var i = 0; i < response.Pricing.output.length; i++) {
                                if (response.Pricing.output[i].name === "Customer 25-year LCOE ($/kWh)")
                                    self.SE_cash_$kwh = parseFloat(response.Pricing.output[i].value).toFixed(3);
                            }
                            for (var i = 0; i < response.Pricing.output.length; i++) {
                                if (response.Pricing.output[i].name === "ASP ($/W)")
                                    self.SE_cash_$watt = parseFloat(response.Pricing.output[i].value);
                            }
                            self.SE_cash_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            self.SE_cash_cashprice = numberWithCommas((270 * retrievedObject.PanelCount * self.SE_cash_$watt).toFixed(0));                            
                            $scope.cashsavingsflag = true;
                        }
                        else if (response.PurchaseType === 'Lease - Monthly') {
                            self.SE_lease_$watt = (response['DealerASP/W']);
                            self.SE_lease_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            $scope.leasesavingsflag = true;
                        }
                        else if (response.PurchaseType === 'PPA') {
                             self.SE_ppa_$watt = (response['DealerASP/W']);
                             self.SE_ppa_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                             $scope.ppasavingsflag = true;
                        }                         
                    }
                    else
                    {
                        if (response.PurchaseType === 'Lease - Monthly') {
                            self.ID_lease_$watt = (response['DealerASP/W']);
                            self.ID_ppa_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            $scope.leasesavingsflag = true;
                        }
                        else if (response.PurchaseType === 'PPA') {
                            self.ID_ppa_$watt = (response['DealerASP/W']);
                            self.ID_ppa_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            $scope.ppasavingsflag = true;
                        }
                    }
                        if ($scope.cashsavingsflag && $scope.cashsssavingsflag && $scope.mosaicsavingsflag && $scope.mosaicsssavingsflag && $scope.leasesavingsflag && $scope.ppasavingsflag) {

                            for(var i=0; i<financeinfo.results.length; i++){
                                if(self.dealertypeview){
                                    if(($('#SE_cash_column').css('display') === 'none') && ($('#SE_cashss_column').css('display') === 'none') && ($('#SE_mosaic_column').css('display') === 'none') && ($('#SE_mosaicss_column').css('display') === 'none') && ($('#SE_lease_column').css('display') === 'none') && ($('#SE_ppa_column').css('display') === 'none')){
                                        if(financeinfo.results[i].errormsg === "missing homeowner id" || financeinfo.results[i].errormsg === "missing partner id" || financeinfo.results[i].errormsg === "HomeOwner State is Missing"){
                                            showErrorDialog('An error has occurred. Please open a support ticket if you continue experiencing issues.');
                                        }
                                        else if(financeinfo.results[i].errormsg === "HomeOwner State is not found in Partner Eligible States"){
                                            showErrorDialog('The Partner you are associated with is not set up in this State.  If you feel this is incorrect, please open a support ticket.');
                                        }
                                        else if(financeinfo.results[i].errormsg === "No Pricing Results available for the HomeOwner and Partner eligible Finance Programs"){
                                            showErrorDialog('The Partner you are associated with is not set up with eligible Finance programs.  If you feel this is incorrect, please open a support ticket.');
                                        }
                                    }
                                }
                                else
                                {
                                    if(($('#ID_cash_column').css('display') === 'none') && ($('#ID_cashss_column').css('display') === 'none') && ($('#ID_lease_column').css('display') === 'none') && ($('#ID_ppa_column').css('display') === 'none')){
                                        if(financeinfo.results[i].errormsg === "missing homeowner id" || financeinfo.results[i].errormsg === "missing partner id" || financeinfo.results[i].errormsg === "HomeOwner State is Missing"){
                                            showErrorDialog('An error has occurred. Please open a support ticket if you continue experiencing issues.');
                                            $scope.elligblestate = false;
                                        }
                                        else if(financeinfo.results[i].errormsg === "HomeOwner State is not found in Partner Eligible States"){
                                            showErrorDialog('The Partner you are associated with is not set up in this State.  If you feel this is incorrect, please open a support ticket.');
                                            $scope.elligblestate = false;
                                        }
                                        else if(financeinfo.results[i].errormsg === "No Pricing Results available for the HomeOwner and Partner eligible Finance Programs"){
                                            //showErrorDialog('The Partner you are associated with is not set up with eligible Finance programs.  If you feel this is incorrect, please open a support ticket.');
                                        }
                                    }                                    
                                    if ($rootScope.dealer === 'ID' && $('#ID_cash_column').css('display') === 'none' && $scope.elligblestate) {
                                        self.ID_cash_$watt = (4).toFixed(2);
                                        console.log("default cash pricing data");
                                        cashsavings();
                                    }
                                    if ($rootScope.dealer === 'ID' && $('#ID_cashss_column').css('display') === 'none' && $scope.elligblestate) {
                                        self.ID_cashss_$watt = (4).toFixed(2);
                                        console.log("default cashss pricing data");
                                        cashWithsignature();
                                    }
                                }
                            }
                            incentivecall();
                            self.buildbutton = false;
                            self.loading = false;
                        }
                    })
                    .catch(function () {
                        console.log('finprog conversion failed');
                        self.loading = false;
                        self.buildbutton = false;
                        showErrorDialog('Finprog conversion failed');
                    });
        }
        
        function assemblePricingConversionSE() {
            //$scope.pricingcoversionflag = false;
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/PPAfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString();
                if ($rootScope.PricingQuoteId) {
                    financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                
                if ($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                if ($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption);
                financedetails.Quote.PurchaseType = ($scope.purchasetype).toString();
                financedetails.Quote.FinancingProgram = ($scope.financeprog).toString();
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if ($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                
                financedetails.Quote.VariablePricing = ($scope.VariablePricing).toString();
                if($scope.purchasetype !== 'PPA')
                    financedetails.Quote.PricePerWatt = (retrievedObject.utilityrate).toString();
                financedetails.Quote.ASPW = ($scope.ASPW).toString();
                financedetails.Quote.LoanStartDate = getSystemDate();
                financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString();
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);
                if($scope.purchasetype === 'PPA')
                    financedetails.Quote.PeriodicRentEscalation = ppaescalatorrate;
                else if($scope.purchasetype === 'Lease - Monthly')
                    financedetails.Quote.PeriodicRentEscalation = leaseescalatorrate;
                else{
                    financedetails.Quote.PeriodicRentEscalation = 0;
                    financedetails.Quote.MosaicTenor = (20).toString();
                }
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                financedetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;

                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if (j > 0)
                        financedetails.Array.push({});
                    var arraynumber = j + 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270) / 1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    var Shading = [];
                    for (var i = 0; i < 12; i++) {
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                if($scope.purchasetype === 'PPA')
                    PricingConversionV2_ID(financedetails);
                else
                    PricingConversionSE(financedetails);
            });
        }
        
        function PricingConversionSE(financedetails){
        self.buildbutton = true;
        PricingConversion_v1.save(financedetails).$promise
                                    .then(function (response) {
                                        //$scope.pricingcoversionflag = true;
                                        //$scope.kwhtowattflag = false;
                                            /*if(response.FinanceProgram === 'SunEdison Mosaic SCION With Signature Series'){
                                                for(var i=0; i<response.Pricing.output.length; i++){
                                                    if(response.Pricing.output[i].name === "Customer 25-year LCOE ($/kWh)")
                                                        self.SE_mosaicss_$kwh = (response.Pricing.output[i].value).toFixed(3);
                                                }
                                            }
                                            else if(response.FinanceProgram === 'SunEdison Mosaic SCION'){
                                                for(var i=0; i<response.Pricing.output.length; i++){
                                                    if(response.Pricing.output[i].name === "Customer 25-year LCOE ($/kWh)")
                                                        self.SE_mosaic_$kwh = (response.Pricing.output[i].value).toFixed(3);
                                                }
                                            }*/
                                        
                                            if(response.FinanceProgram === 'CSS-SAI'){
                                                    for(var i=0; i<response.Pricing.output.length; i++){
                                                        if(response.Pricing.output[i].name === "Customer 25-year LCOE ($/kWh)")
                                                            self.SE_cashss_$kwh = parseFloat(response.Pricing.output[i].value).toFixed(3);
                                                    }
                                                    self.SE_cashss_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                                                    self.SE_cashss_cashprice = numberWithCommas((270 * retrievedObject.PanelCount * self.SE_cashss_$watt).toFixed(0));
                                            }
                                            else if(response.FinanceProgram === 'Cash-SAI'){
                                                    for(var i=0; i<response.Pricing.output.length; i++){
                                                        if(response.Pricing.output[i].name === "Customer 25-year LCOE ($/kWh)")
                                                            self.SE_cash_$kwh = parseFloat(response.Pricing.output[i].value).toFixed(3);
                                                    }
                                                    self.SE_cash_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                                                    self.SE_cash_cashprice = numberWithCommas((270 * retrievedObject.PanelCount * self.SE_cash_$watt).toFixed(0));
                                            }
                                            else if(response.PurchaseType === 'PPA'){
                                                    for(var i=0; i<response.Pricing.output.length; i++){
                                                        if(response.Pricing.output[i].name === "Customer 25-year LCOE ($/kWh)")
                                                            self.SE_ppa_$kwh = parseFloat(response.Pricing.output[i].value).toFixed(3);
                                                    }
                                                    self.SE_ppa_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                                            }
                                            else if(response.PurchaseType === 'Lease - Monthly'){
                                                    for(var i=0; i<response.Pricing.output.length; i++){
                                                        if(response.Pricing.output[i].name === "Customer 25-year LCOE ($/kWh)")
                                                            self.SE_lease_$kwh = parseFloat(response.Pricing.output[i].value).toFixed(3);
                                                    }
                                                    self.SE_lease_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                                            }
                                        $scope.VariablePricing = false;
                                        //if($scope.pricingcoversionflag)
                                            self.buildbutton = false;
                                    })
                                    .catch(function () {
                                        console.log('finprog conversion failed');
                                        self.buildbutton = false;
                                        showErrorDialog('Finprog conversion failed');
                                    });
        }
        
        function assemblePricingV2_ID(){
            
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/PPAfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString();
                if ($rootScope.PricingQuoteId) {
                    financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                
                if ($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                if ($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption);
                financedetails.Quote.PurchaseType = ($scope.purchasetype).toString();
                financedetails.Quote.FinancingProgram = ($scope.financeprog).toString();
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if ($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                financedetails.Quote.ASPW = ($scope.ASPW).toString();
                financedetails.Quote.LoanStartDate = getSystemDate();
                financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString();
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);
                financedetails.Quote.PeriodicRentEscalation = $scope.escalator ;
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                financedetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;
                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if (j > 0)
                        financedetails.Array.push({});
                    var arraynumber = j + 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270) / 1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    var Shading = [];
                    for (var i = 0; i < 12; i++) {
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                PricingConversionV2_ID(financedetails);
            });
        }
        
        function PricingConversionV2_ID(financedetails) {
            PricingConversion_v2.save(financedetails).$promise
                    .then(function (response) {
                        //var FinDetails = {};
                        //$scope.pricingcoversionflag = true;
                    if(self.dealertypeview){
                        if (response.PurchaseType === 'PPA') {
                            self.SE_ppa_$kwh = parseFloat(response.PPARate).toFixed(3);
                            self.SE_ppa_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            /*FinDetails.financeprogram = 'PPA';
                            FinDetails.$kwh = self.SE_ppa_$kwh;
                            FinDetails.escalator = parseFloat((ppaescalatorrate * 100).toFixed(1));*/
                        } else if (response.PurchaseType === 'Lease - Monthly') {
                            self.SE_lease_$kwh = parseFloat(response.PPARate).toFixed(3);
                            self.SE_lease_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                        }
                    }
                    else
                    {
                        if (response.PurchaseType === 'PPA') {
                            self.ID_ppa_$kwh = parseFloat(response.PPARate).toFixed(3);
                            self.ID_ppa_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            /*FinDetails.financeprogram = 'PPA';
                            FinDetails.$kwh = self.ID_ppa_$kwh;
                            FinDetails.escalator = parseFloat((ppaescalatorrate * 100).toFixed(1));*/
                        } else if (response.PurchaseType === 'Lease - Monthly') {
                            self.ID_lease_$kwh = parseFloat(response.PPARate).toFixed(3);
                            self.ID_lease_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                        }
                    }
                     //if($scope.pricingcoversionflag)
                    self.buildbutton = false;
                    //paymentApiCall(FinDetails);
                    });
        }
        
        function assemblePricingV1_ID(){
            //self.buildbutton = true;
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: 'app/Ziba_UI/PPAfinanceprog.json'
            }).done(function (data) {
                var payLoad = JSON.stringify(data);
                //alert(payLoad);
                var financedetails = eval("(" + payLoad + ")");
                financedetails.SunEdCustId = ($rootScope.SunEdCustId).toString();
                if ($rootScope.PricingQuoteId) {
                    financedetails.PricingQuoteId = $rootScope.PricingQuoteId;
                }
                financedetails.Quote.ProposalID = localStorageService.get('proposalID');
                
                if ($("#checkbox2").is(":checked"))
                    financedetails.Quote.IncentiveValue = $scope.incentivevalue;
                if ($("#checkbox1").is(":checked"))
                    financedetails.Quote.ITCIncentives = self.ITCincentive;
                financedetails.Quote.TaxRate = $rootScope.taxrate;
                financedetails.Quote.YearlyUsage = parseInt($rootScope.presolarconsumption);
                financedetails.Quote.PurchaseType = ($scope.purchasetype).toString();
                financedetails.Quote.FinancingProgram = ($scope.financeprog).toString();
                financedetails.Quote.PostSolarUtilityCost = parseInt($rootScope.postsolarbill);
                financedetails.Quote.CurrentUtilityCost = parseInt($rootScope.presolarbill);
                financedetails.Quote.ProposalTitle = (self.proposaltitle).toString();
                financedetails.Quote.Derate = (retrievedObject.InverterDerate).toString();
                financedetails.Quote.SystemSize = (retrievedObject.systemsize).toString();
                financedetails.Quote.UtilityIndex = (retrievedObject.utilityLseid).toString();
                financedetails.Quote.UtilityProvider = (retrievedObject.utilityprovider).toString();
                financedetails.Quote.PreSolarTariff = (retrievedObject.currenttariff).toString();
                financedetails.Quote.PostSolarTariff = (retrievedObject.aftertariff).toString();
                if ($scope.incentivechecked) {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                    financedetails.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
                } else {
                    financedetails.Quote.UpfrontRebateAssumptionsMax = 0;
                    financedetails.Quote.UpfrontRebateAssumptions = 0;
                }
                if ($scope.ITCChecked)
                    financedetails.Quote.ITCChecked = "true";
                else
                    financedetails.Quote.ITCChecked = "false";
                financedetails.Quote.PPARate = ($scope.pparate).toString();
                financedetails.Quote.LoanStartDate = getSystemDate();
                financedetails.Quote.Year1Yield = (retrievedObject.systemyield).toString();
                financedetails.Quote.Year1Production = parseInt($rootScope.totalprod);
                financedetails.Quote.PeriodicRentEscalation = $scope.escalator ;
                financedetails.Quote.Usage = retrievedObject.MonthlyUsage;
                financedetails.System.InverterManufacturer = retrievedObject.invertermanufacturer;
                financedetails.System.InverterQuantity = (retrievedObject.InverterQuantity).toString();
                financedetails.System.ModuleId = retrievedObject.solarpanel;
                financedetails.System.ModuleQuantity = (retrievedObject.PanelCount).toString();
                financedetails.System.InverterType = (retrievedObject.invertertype).toString();
                financedetails.System.InverterId = $rootScope.arraydetails[0].InverterId;
                financedetails.System.InverterModel = $rootScope.arraydetails[0].InverterId;

                for (var j = 0; j < $rootScope.numberofarray; j++) {
                    if (j > 0)
                        financedetails.Array.push({});
                    var arraynumber = j + 1;
                    financedetails.Array[j].ArrayNumber = (arraynumber).toString();
                    financedetails.Array[j].Azimuth = ($rootScope.arraydetails[j].Azimuth).toString();
                    financedetails.Array[j].ModuleQuantity = ($rootScope.arraydetails[j].ModuleQuantity).toString();
                    financedetails.Array[j].SystemSize = parseFloat(($rootScope.arraydetails[j].ModuleQuantity * 270) / 1000).toFixed(2);
                    financedetails.Array[j].Tilt = ($rootScope.arraydetails[j].Tilt).toString();
                    financedetails.Array[j].MonthlyProduction = $rootScope.arraydetails[j].MonthlyProduction;
                    financedetails.Array[j].Orientation = "Portrait";
                    financedetails.Array[j].ModuleType = $rootScope.arraydetails[j].ModuleType;
                    financedetails.Array[j].InverterId = $rootScope.arraydetails[j].InverterId;
                    financedetails.Array[j].InverterModel = $rootScope.arraydetails[j].InverterModel;
                    var Shading = [];
                    for (var i = 0; i < 12; i++) {
                        Shading.push(($rootScope.arraydetails[j].AnnualShading).toString());
                    }
                    financedetails.Array[j].Shading = Shading;
                }
                PricingConversionV1_ID(financedetails);
            });
        }
        
        function PricingConversionV1_ID(financedetails) {
            PricingConversion_v1.save(financedetails).$promise
                    .then(function (response) {                        
                        //$scope.escalatorapiflag = true;    
                        $scope.pricingconversionflag = true;
                        if (self.dealertypeview) {
                            if (response.PurchaseType === 'PPA') {
                                self.SE_ppa_$watt = response['DealerASP/W'];
                                self.SE_ppa_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            } else if (response.PurchaseType === 'Lease - Monthly') {
                                self.SE_lease_$watt = response['DealerASP/W'];
                                self.SE_lease_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            }
                        } else
                        {
                            if (response.PurchaseType === 'PPA') {
                                self.ID_ppa_$watt = response['DealerASP/W'];
                                self.ID_ppa_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                           } else if (response.PurchaseType === 'Lease - Monthly') {
                                self.ID_lease_$watt = response['DealerASP/W'];
                                self.ID_lease_savings = numberWithCommas(response.EstimatedSavingsFor20Years);
                            }
                        }
                        //if($scope.pricingconversionflag && $scope.pricingpaymentflag)
                            self.buildbutton = false;
                    });
        }
        
        function Changeofescalator(FinDetails) {
            $scope.pricingpaymentflag = true;
            self.buildbutton = true;
            /*var Payload_PPA =
                    {
                        'Quote': {
                            'PPARate': FinDetails.$kwh,
                            'SunEdCustId': $rootScope.SunEdCustId,
                            'PartnerType': $rootScope.PartnerType,
                            'Year1Production': retrievedObject.year1production,
                            'CustomerPrepayment': "0",
                            'State': retrievedObject.State,
                            'UtilityIndex': retrievedObject.utilityLseid,
                            'PeriodicRentEscalation': (FinDetails.escalator / 100).toFixed(4),
                            'SubstantialCompletionDate': "11/10/2015",
                            'CurrentUtilityCost': retrievedObject.presolarutility,
                            'PostSolarUtilityCost': retrievedObject.postsolarutility,
                            'ProposalID': "1",
                            'SystemSize': retrievedObject.systemsize,
                            'ZipCode': retrievedObject.ZipCode,
                            'LastYear': 20
                        }
                    };
            if ($scope.incentivechecked) {
                Payload_PPA.Quote.UpfrontRebateAssumptionsMax = $scope.UpfrontRebateAssumptionsMax;
                Payload_PPA.Quote.UpfrontRebateAssumptions = $scope.UpfrontRebateAssumptions;
            } else {
                Payload_PPA.Quote.UpfrontRebateAssumptionsMax = 0;
                Payload_PPA.Quote.UpfrontRebateAssumptions = 0;
            }

            self.ppapaymentCallMade = true;
            Payment.save(Payload_PPA).$promise
                    .then(function (data) {
                        var temp = 0;
                        var dummyarray = [];
                        if (FinDetails.financeprogram === 'PPA') {
                            for (var k = 0; k < data.PPAPayments.length; k++)
                            {
                                temp = (data.PPAPayments[k] * 12).toString();
                                dummyarray.push(temp);
                            }
                            PPAPayments = [];
                            PPAPayments = dummyarray;
                        } else {
                            for (var k = 0; k < data.LeasePayments.length; k++)
                            {
                                temp = (data.LeasePayments[k] * 12).toString();
                                dummyarray.push(temp);
                            }
                            LeasePayments = [];
                            LeasePayments = dummyarray;
                            PaymentArray = LeasePayments;
                        }
                    });*/
                        var currentvalues = [];
                        //var PaymentArray = [];
                        if (FinDetails.financeprogram === 'PPA') {
                            currentvalues = self.ppa_Array;
                            //PaymentArray = PPAPayments;
                        } else if (FinDetails.financeprogram === 'Lease') {
                            currentvalues = self.lease_Array;
                            //PaymentArray = LeasePayments;
                        }

                        for (var i = 0; i < currentvalues.length; i++)
                        {
                            if (FinDetails.escalator === currentvalues[i].escalator)
                            {
                                if (FinDetails.financeprogram === 'PPA') {
                                    ppaescalatorrate = parseFloat(currentvalues[i].escalator / 100).toFixed(4);
                                    if (self.dealertypeview) {
                                        self.SE_ppa_$kwh = parseFloat(currentvalues[i].$kwh).toFixed(3);
                                        $scope.pparate = self.SE_ppa_$kwh;
                                        $scope.escalator = ppaescalatorrate;
                                        $scope.purchasetype = "PPA";
                                        $scope.financeprog = "PPA 1.0";
                                    } else
                                    {
                                        self.ID_ppa_$kwh = parseFloat(currentvalues[i].$kwh).toFixed(3);
                                        $scope.pparate = self.ID_ppa_$kwh;
                                        $scope.escalator = ppaescalatorrate;
                                        $scope.purchasetype = "PPA";
                                        $scope.financeprog = "PPA 1.0";
                                    }
                                } else if (FinDetails.financeprogram === 'Lease') {
                                    leaseescalatorrate = parseFloat(currentvalues[i].escalator / 100).toFixed(4);
                                    if (self.dealertypeview) {
                                        self.SE_lease_$kwh = parseFloat(currentvalues[i].$kwh).toFixed(3);
                                        $scope.pparate = self.SE_lease_$kwh;
                                        $scope.escalator = leaseescalatorrate;
                                        $scope.purchasetype = "Lease - Monthly";
                                        $scope.financeprog = "PPA 1.0";
                                    } else
                                    {
                                        self.ID_lease_$kwh = parseFloat(currentvalues[i].$kwh).toFixed(3);
                                        $scope.pparate = self.ID_lease_$kwh;
                                        $scope.escalator = leaseescalatorrate;
                                        $scope.purchasetype = "Lease - Monthly";
                                        $scope.financeprog = "PPA 1.0";
                                    }
                                }
                                    //savingscalculation(FinDetails, PaymentArray);
                                    assemblePricingV1_ID();
                            }
                        }
        }
        
        function variableChange(){            
            if(self.SE_checked === 11){
                if(self.cashvariable.value === 'cash'){
                    self.SE_cash_$watt = $scope.temp_cash_watt;
                    self.SE_cash_$kwh = $scope.temp_cash_kwh;
                    self.SE_cash_cashprice = $scope.temp_cash_cashprice;
                    self.variablePricing_cash = true;
                    self.setvariable_cash = "variableproperty";
                }
                else{
                    $scope.temp_cash_watt = self.SE_cash_$watt;
                    $scope.temp_cash_kwh = self.SE_cash_$kwh;
                    $scope.temp_cash_cashprice = self.SE_cash_cashprice;
                    self.variablePricing_cash = false;
                    self.setvariable_cash = "";
                }                
            }else if(self.SE_checked === 12){
                if(self.cashssvariable.value === 'cashss'){
                    self.SE_cashss_$watt = $scope.temp_cashss_watt;
                    self.SE_cashss_$kwh = $scope.temp_cashss_kwh;
                    self.SE_cashss_cashprice = $scope.temp_cashss_cashprice;
                    self.variablePricing_cashss = true;
                    self.setvariable_cashss = "variableproperty";
                }
                else{
                    $scope.temp_cashss_watt = self.SE_cashss_$watt;
                    $scope.temp_cashss_kwh = self.SE_cashss_$kwh;
                    $scope.temp_cashss_cashprice = self.SE_cashss_cashprice;
                    self.variablePricing_cashss = false;
                    self.setvariable_cashss = "";
                }                
            }
            else if(self.SE_checked === 16){
                if(self.ppavariable.value === 'ppa'){
                    self.SE_ppa_$watt = $scope.temp_ppa_watt;
                    self.SE_ppa_$kwh = $scope.temp_ppa_kwh;
                    self.variablePricing_ppa = true;
                    self.setvariable_ppa = "variableproperty";
                }
                else{
                    $scope.temp_ppa_watt = self.SE_ppa_$watt;
                    $scope.temp_ppa_kwh = self.SE_ppa_$kwh;
                    self.variablePricing_ppa = false;
                    self.setvariable_ppa = "";
                }                
            }
        }
        
        self.cashPaymentCalc = cashPaymentCalc;
        self.cashCalculation = cashCalculation;
        self.assemblePricingV2_ID = assemblePricingV2_ID;
        self.PricingConversionV2_ID = PricingConversionV2_ID;
        self.assemblePricingV1_ID = assemblePricingV1_ID;
        self.PricingConversionV1_ID = PricingConversionV1_ID;
        self.assemblePPAJSONpricing = assemblePPAJSONpricing;
        self.assembleLeaseJSONpricing = assembleLeaseJSONpricing;
        self.PricingConversionSE = PricingConversionSE;
        self.variableChange = variableChange;
        self.Changeofescalator = Changeofescalator;
        self.assembleSECashSSjson = assembleSECashSSjson;
        self.assembleSECashjson = assembleSECashjson;
        self.assembleSEMosaicjson = assembleSEMosaicjson;
        self.assembleSEMosaicSSjson = assembleSEMosaicSSjson;
        self.incentiveChecked = incentiveChecked;
        self.savingscalculation = savingscalculation;
        self.getSystemDate = getSystemDate;
        self.removeCommaFromNumbers = removeCommaFromNumbers;
        self.numberWithCommas = numberWithCommas;
	self.redirectToDesignPage = redirectToDesignPage;
        self.financeprogchange = financeprogchange;
        self.MosaicSavings = MosaicSavings;
        self.MosaicSSSavings = MosaicSSSavings;
        self.paymentApiCallMosaic = paymentApiCallMosaic;
        self.paymentApiCall = paymentApiCall;
        self.kwhtowattconversion = kwhtowattconversion;
        self.watttokwhconversion = watttokwhconversion;
        self.showErrorDialog = showErrorDialog;
        self.builddocument = builddocument;
        self.assemblePPAjson = assemblePPAjson;
        self.customertofinance = customertofinance;
        self.designtofinance = designtofinance;        
        self.financecalculation = financecalculation;
        self.designsaving = designsaving;
        self.showhidecancelbox = showhidecancelbox;        
        self.showanalysiscategory = showanalysiscategory;
        self.showutilitycategory = showutilitycategory;
        }

    angular
        .module('dealerportal.financeoption', ['dealerportal.service', 'ui.router', 'ui.bootstrap'])
        .controller('FinanceOptionsCtrl', ['$timeout', '$state', '$scope','$rootScope', '$log', 'sessionService', 'FinanceDetails', 'DesignSave', 'FinanceCalc', 'DesignDetails', 'DeleteProposal', 'managedModal','Payment', 'LoanPayment', 'localStorageService','Incentives', 'PricingConversion_v2', '$window', '$location', 'PricingConversion_v1', FinanceOptionsCtrl]);
})();
