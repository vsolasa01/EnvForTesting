'use strict';

(function () {
    function ProposalViewCtrl($state, $scope, $rootScope, $log, sessionService, GetProposal, GetContract, DesignInfo, localStorageService, managedModal, ProposalEmail, EmailDocusign, DocusignStatus, DocusignUpdate, ProposalSign) {
        var self = this;
        
        self.proposaldisplay = 'active';
        self.contractdisplay = '';
        self.proposalsection = 'true';
        self.contractsection = '';
        self.email ='hidden';
        self.addemailid = false;
        self.loading = true;
        self.popupadd === '';
        self.homeowneremail = $rootScope.homeowneremail;
        self.salespersonemail = $rootScope.SalespersonEmail;
        self.proposaltitle = $rootScope.proposaltitle;
        self.previewInputInProcess = false;
        self.waitimplementer = false;
        var proposaldisplay = false;
        var contractdisplay = false;
        self.proposalsign = false;
        
        function init(){
            
            //var proposalId = ($rootScope.PricingQuoteId).split('_');
            self.proposalId = $rootScope.proposalId;            
                DesignInfo.get({pricingid: $rootScope.PricingQuoteId}).$promise
                    .then(function (response) {
                        console.log('get success on design');
                        self.proposaltitle = response.Quote.ProposalTitle;
                        self.proposalId = response.Quote.ProposalID;
                        self.utilityprovider = response.Quote.UtilityProvider;
                        self.utilitytariff = response.Quote.PreSolarTariff;
                        self.presolarutility = response.Quote.CurrentUtilityCost;
                        self.annualusage = response.Quote.YearlyUsage;
                        self.averagecost = (response.Quote.CurrentUtilityCost/response.Quote.YearlyUsage).toFixed(2);
                        self.taxrate = response.Quote.TaxRate;
                        self.savings = response.Quote.YearsSavings;
                        self.postsolarutility = response.Quote.PostSolarUtilityCost;
                        self.systemsize = parseFloat(response.ModsolarProjectOutput.systemSize).toFixed(2);
                        self.year1production = response.Quote.Year1Production;
                        self.panelarrays = [];
                        for (var i = 0; i < response.Array.length; i++) {
                            self.panelarrays.push(response.Array[i]);
                        }
                        $rootScope.numberofarray = self.panelarrays.length;
                        $rootScope.arraydetails = self.panelarrays; 
                        self.billsavings = parseFloat(+response.Quote.CurrentUtilityCost - +response.Quote.PostSolarUtilityCost).toFixed(2);
                        self.financeprogram = response.Quote.PurchaseType; 
                        
                        if(self.financeprogram === 'Cash'){
                            self.escalator = 'n/a';
                            self.monthlypayment = 0;
                            var watt = (( response.Quote.Year1Production * response.ModsolarProjectOutput.pricePerWatt)/(response.ModsolarProjectOutput.systemSize *1000));
                            self.systemcost = (watt * response.ModsolarProjectOutput.numPanels * 270).toFixed(2);
                        }
			else if(self.financeprogram === 'Loan'){
                            self.escalator = 'n/a';
                            self.monthlypayment = 0;
                            var watt = (( response.Quote.Year1Production * response.ModsolarProjectOutput.pricePerWatt)/(response.ModsolarProjectOutput.systemSize *1000));
                            self.systemcost = (watt * response.ModsolarProjectOutput.numPanels * 270).toFixed(2);
                        }
                        else{
                            self.escalator = (response.Quote.PeriodicRentEscalation * 100).toFixed(2);
                            self.monthlypayment = $rootScope.proposalpayment;
                            self.systemcost = (response.ModsolarProjectOutput.pricePerWatt * response.ModsolarProjectOutput.numPanels * 270).toFixed(2);
                        }
                        self.downpayment = (self.systemcost/10).toFixed(2);
                        
                        contractDocumentCall();
                    })
                    .catch(function (error) {
                        console.log('get design api failed');
                        showErrorDialog("Design call failed to retrieve data right now.");
                        self.loading = false;
                    });                       
            
                     GetProposal.get({id: $rootScope.PricingQuoteId}).$promise
                    .then(function (data) {
                        proposaldisplay = true;
                        $scope.ProposalData = data.pdf;
                        var proposalURL = "data:application/pdf;base64," + data.pdf;
                        window.parent.document.getElementById("proposalpdf").src = proposalURL;
                        console.log('proposal --- ');
                        if(contractdisplay)
                                    self.loading = false;
                    })
                    .catch(function () {
                        GetProposal.get({id: $rootScope.PricingQuoteId}).$promise
                            .then(function (data) {
                                proposaldisplay = true;
                                $scope.ProposalData = data.pdf;
                                var proposalURL = "data:application/pdf;base64," + data.pdf;
                                window.parent.document.getElementById("proposalpdf").src = proposalURL;
                                console.log('proposal --- ');
                                 if(contractdisplay)
                                    self.loading = false;
                            })
                            .catch(function () {
                                console.log('Proposal api failed');
                                self.loading = false;
                                showErrorDialog("Proposal: Sorry unable to generate the proposal right now. Please try again.");
                                $state.go('customerDetails');
                            });
                    });

                                        
        }
        
        init();
        
        function contractDocumentCall(){
            if(self.financeprogram === 'Cash' && $rootScope.mediumtype === 'Integrated Dealer')
                    {   
                        self.contractDisabled = true;
                        $('#contractblock').css('display','none');
                        self.proposalsign = true;
                        contractdisplay = true;
                    }
                    else
                    {
                        GetContract.get({id: $rootScope.PricingQuoteId}).$promise
                        .then(function (data) {
                            contractdisplay = true;
                            $scope.ContractData = data.pdf;
                            var contractURL = "data:application/pdf;base64," + data.pdf;
                            window.parent.document.getElementById("contractpdf").src = contractURL;
                            console.log('contract');
                            if (proposaldisplay)
                                self.loading = false;
                        })
                        .catch(function () {
                            GetContract.get({id: $rootScope.PricingQuoteId}).$promise
                                .then(function (data) {
                                    contractdisplay = true;
                                    $scope.ContractData = data.pdf;
                                    var contractURL = "data:application/pdf;base64," + data.pdf;
                                    window.parent.document.getElementById("contractpdf").src = contractURL;
                                    console.log('contract');
                                    if (proposaldisplay)
                                            self.loading = false;
                                })
                                .catch(function () {
                                    console.log('contract api failed');
                                    self.loading = false;
                                    showErrorDialog("Contract: Sorry unable to generate the contract right now. Please try again.");
                                    $state.go('customerDetails');
                                });
                        });
                    }
        }
        function showcontract(){            
            self.proposaldisplay = '';
            self.contractdisplay = 'active'; 
            self.proposalsection = '';
            self.contractsection = 'true';
        }
        function showproposal(){            
            self.proposaldisplay = 'active';
            self.contractdisplay = '';  
            self.proposalsection = 'true';
            self.contractsection = '';
        }
        function showemailbox(){
            if(self.email === 'hidden')
                self.email = '';
            else
                self.email = 'hidden';
        }
        function showemail(){
            if(self.addemailid === false)
                self.addemailid = true;
            else
                self.addemailid = false;
        }
        
        function showpreviewinputs(){
            self.previewInputInProcess = true;
            $('.popup').css('display','block');
            $('.popup').css('z-index','9999');
            $('.popup').css('transition-delay','.2s');
           
        }
        function hidepreviewinputs(){
            $('.popup').css('display','none');
            $('.popup').css('z-index','9999');
            $('.popup').css('transition-delay','.2s');
            self.previewInputInProcess = false;
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
        
        
        function validateEmail(){
            if((self.email).indexOf('@') === -1){
                showErrorDialog("Please enter a valid Email Address");
                self.email = '';
            }
            else if((self.email).indexOf('.') === -1){
                showErrorDialog("Please enter a valid Email Address");
                self.email = '';
            }
            else if(self.email === ""){
                showErrorDialog("Please enter a valid Email Address");
                self.email = '';
            }
        }  
        
         function EmailProposal(){
             self.waitimplementer = true;            
            var emailpayload = {};
            emailpayload.Email = $rootScope.homeowneremail;
            emailpayload.PricingQuoteId = $rootScope.PricingQuoteId +'_proposal.pdf';
            //emailpayload.proposalDocBase64 = retrievedObject.Base64Image;
            
            ProposalEmail.save(emailpayload).$promise
                    .then(function () {
                        self.waitimplementer = false;
                        showErrorDialog("Email proposal: The proposal was sent to "+ $rootScope.homeowneremail);
                    })
                    .catch(function (error) {
                        //self.loading = false;
                        showErrorDialog("Email proposal: Something went wrong while emailing the proposal");
                        console.log(error);
                    });
            
        }
        function EmailContract(){ 
            
            if((document.getElementById("checkbox2").checked) && self.email && (document.getElementById("checkbox3").checked) && (document.getElementById("checkbox1").checked)){
                SendContractMail(self.salespersonemail);
                SendContracttoHO();
                if(self.email)
                     SendContractMail(self.email);
                 else
                     validateEmail();
            }
            else if ((document.getElementById("checkbox1").checked) && (document.getElementById("checkbox2").checked)){
                SendContracttoHO();           
                SendContractMail(self.salespersonemail);
            }
            else if ((document.getElementById("checkbox1").checked) && self.email && (document.getElementById("checkbox3").checked)){
                SendContracttoHO();
                if(self.email)
                     SendContractMail(self.email);
                 else
                     validateEmail();
            }
            else if((document.getElementById("checkbox2").checked) && self.email && (document.getElementById("checkbox3").checked)){  
                SendContractMail(self.salespersonemail);
                if(self.email)
                     SendContractMail(self.email);
                 else
                     validateEmail();
            }
            else if(document.getElementById("checkbox3").checked){
                if(self.email)
                     SendContractMail(self.email);
                 else
                     validateEmail();
            }
            else if(document.getElementById("checkbox2").checked)   
                SendContractMail(self.salespersonemail);
            else if ((document.getElementById("checkbox1").checked))
                SendContracttoHO();
           
        }
        function SendContracttoHO(){
            self.waitimplementer = true;
		EmailDocusign.save({PricingQuoteId: $rootScope.PricingQuoteId, EmbeddedSigning : "false", ProposalId :$rootScope.ProposalId, PurchaseType: $rootScope.PurchaseType, FinanceProgram: $rootScope.FinanceProgram}).$promise                        .then(function () {
                            self.waitimplementer = false;
                            console.log('sent for docusigning');
                            showErrorDialog("Email contract: The contract was sent to "+ $rootScope.homeowneremail);
                        })
                        .catch(function (error) {
                            //self.loading = false;
                            self.waitimplementer = false;
                            showErrorDialog("Email contract: Something went wrong while emailing the contract");
                            console.log(error);
                        });
        }
        
        function SendContractMail(allemails){
            self.waitimplementer = true;
            var emailpayload = {};
            emailpayload.Email = allemails;
            emailpayload.PricingQuoteId = $rootScope.PricingQuoteId +'_contract.pdf';
            
            ProposalEmail.save(emailpayload).$promise
                    .then(function () {
                        showemailbox();
                        self.waitimplementer = false;
                        showErrorDialog("Email contract: The contract was sent to "+ allemails);
                    })
                    .catch(function (error) {
                        //self.loading = false;
                        self.waitimplementer = false;
                        showErrorDialog("Email contract: Something went wrong while emailing the contract");
                        console.log(error);
                    });             
        }
        
        function SignContract(){
           self.waitimplementer = true;
           if($rootScope.envelopeId){
                DocusignStatus.get({envelope: $rootScope.envelopeId}).$promise
                        .then(function (data){ 
                        if(data.Status === 'completed'){
                            self.waitimplementer = false;
                             showErrorDialog("Contract Signature: Contract has already been signed"); 
                        }
                        else
                            DocusignOpenInLink();
                        });                
            }
            else
            {
                DocusignOpenInLink();
            }        
            
        }
        function DocusignOpenInLink(){
            self.waitimplementer = true;
            EmailDocusign.save({PricingQuoteId: $rootScope.PricingQuoteId, EmbeddedSigning : "true", ProposalId :$rootScope.ProposalId, PurchaseType: $rootScope.PurchaseType, FinanceProgram: $rootScope.FinanceProgram}).$promise
                    .then(function (data) {
                        console.log('Opening for docusign');
                        self.waitimplementer = false;
                        var docusignurl = data.url;                        
                        var win = window.open(docusignurl, '_blank');
                        win.focus();
                        $rootScope.envelopeId = data.envelopeId;
                        
                        /*DocusignUpdate.save({pricing: $rootScope.PricingQuoteId, EnvId: data.envelopeId}).$promise
                                .then(function (response) {
                            });*/
                    })
                    .catch(function (error) {
                        self.waitimplementer = false;
                        showErrorDialog("Docusing: Please check browser popup blocker is allowed to open a new tab.");
                        console.log(error);
                    });
        }      
        function SignProposal() {
            self.waitimplementer = true;
            if ($rootScope.envelopeId) {
                DocusignStatus.get({envelope: $rootScope.envelopeId}).$promise
                        .then(function (data) {
                            if (data.Status === 'completed') {
                                self.waitimplementer = false;
                                 showErrorDialog("Proposal Signature: Proposal has already been signed");
                            } else
                                DocusignOpenInLinkProposal();
                        });
            } else
                DocusignOpenInLinkProposal();
        }
        function DocusignOpenInLinkProposal(){
            self.waitimplementer = true;
            ProposalSign.save({PricingQuoteId: $rootScope.PricingQuoteId, SunEdCustId: $rootScope.SunEdCustId, ProposalId :$rootScope.ProposalId}).$promise
                    .then(function (data){
                        self.waitimplementer = false;
                            console.log('Opening for docusign');
                            var docusignurl = data.url;
                            var win = window.open(docusignurl, '_blank');
                            win.focus();
                            $rootScope.envelopeId = data.envelopeId;
                    })
                    .catch(function (error) {
                        self.waitimplementer = false;
                        showErrorDialog("Docusign: Please check browser popup blocker is allowed to open a new tab.");
                        console.log(error);
                    });
        }
        
        function downloadProposal() {
            var byteCharacters = atob($scope.ProposalData);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var blob = new Blob([byteArray], {type: "application/pdf"});
            saveAs(blob, "Proposal.pdf");
        
        }
        function downloadContract() {
            var byteCharacters = atob($scope.ContractData);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var blob = new Blob([byteArray], {type: "application/pdf"});
            saveAs(blob, "Contract.pdf");
        }
        
        self.SignProposal = SignProposal;
        self.hidepreviewinputs = hidepreviewinputs;
        self.showpreviewinputs = showpreviewinputs;
        self.downloadProposal = downloadProposal;
        self.downloadContract = downloadContract;
        self.SignContract = SignContract;
        self.EmailContract = EmailContract;
        self.EmailProposal = EmailProposal;
        self.validateEmail = validateEmail; 
        self.showErrorDialog = showErrorDialog;         
        self.showemail = showemail;        
        self.showemailbox = showemailbox;
        self.showproposal = showproposal;
        self.showcontract = showcontract;
        }

    angular
        .module('dealerportal.proposalview', ['dealerportal.service', 'ui.router', 'ui.bootstrap'])
        .controller('ProposalViewCtrl', ['$state', '$scope','$rootScope', '$log', 'sessionService', 'GetProposal', 'GetContract', 'DesignInfo' ,'localStorageService', 'managedModal','ProposalEmail','EmailDocusign', 'DocusignStatus','DocusignUpdate','ProposalSign', ProposalViewCtrl]);
})();