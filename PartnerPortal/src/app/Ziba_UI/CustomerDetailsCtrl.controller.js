'use strict';

(function () {
    function CustomerDetailsCtrl($window, $state, $scope, $rootScope, $log, sessionService, GoogleMapApi, geoCodeService, CustomerDetailsfact, Homeowner, DeleteProposal, CustomerNote, managedModal, CreditCheck, proposalModalService, ProposalTitle, homeownerService, usSpinnerService, localStorageService, DocusignStatus, FileUpload) {
        var self = this;
        self.VMtosubmit ='';
        self.checked = false;
        self.classForExpandButton = '';
        self.classForDeleteButton = '';
        self.classForUserNotes = '';
        self.classForProposalDelete = 'false';
        self.hideproposal = 'false';
        self.SunEdCustId = '';
        self.loading = true;      
        self.isDisabled = false;
        self.updateclicked = 0;
        $rootScope.designtofinance = 1;
        $rootScope.yield = 0;
        $rootScope.totalprod = 0;
        $rootScope.systemsize = 0;
        $rootScope.proposalId;
        self.editarrow = false;
	self.PartnerType = localStorageService.get('se-user').profile.PartnerType;
        if(typeof self.PartnerType === 'undefined' || _.isEmpty(self.PartnerType)){
            self.PartnerType = 'IntegratedDealer';
        }
        
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
        
        var googleMaps;
        var autocompleteInstance;
        var googleMapsInitialized = GoogleMapApi.then(function (gmaps) {
                googleMaps = gmaps;
                return googleMaps;
            });    
        var retrievedObject = JSON.parse(localStorage.getItem('ls.se-user'));
        if(retrievedObject.profile.PartnerId === '226055')
            $rootScope.mediumtype = 'Sales Engine';
        else
            $rootScope.mediumtype = 'Integrated Dealer';
      	
	var retrievedObject = JSON.parse(localStorage.getItem('ls.se-user'));
        if(retrievedObject.profile.PartnerType === 'SALES ENGINE (Seller)'){
            $rootScope.mediumtype = 'Sales Engine';
        }else
            $rootScope.mediumtype = 'Integrated Dealer';
        
    function init(){        
        var suncustid = JSON.parse(localStorage.getItem('SunEdCustId'));
        cleanupLocalStorage();
        CustomerDetailsfact.get({id: suncustid}).$promise
                .then(function(response){
                    if(response.message){
                        self.loading = false;
                        showErrorDialog(response.message);
                    }
                    else
                    {
                    self.customerName = response.FirstName + ' ' + response.LastName ;
                    self.FirstName = response.FirstName;
                    self.LastName = response.LastName;
                    $rootScope.FirstName = self.FirstName;
                    $rootScope.LastName = self.LastName;
                    $rootScope.customerName = self.customerName;
                    $rootScope.PartnerType = response.PartnerType;
                    self.addressLine1 = response.Street;
                    $scope.prevaddress = response.Street;
                    self.addressLine2 = response.City + ' , ' + response.State + ' , ' + response.Zip ;
                    $rootScope.addr1 = self.addressLine1;
                    $rootScope.addr2 = self.addressLine2;
                    $rootScope.zip = response.Zip;
                    self.setter = response.Setter;
                    self.closer = response.Closer;
                    self.closeremail = response.CloserEmail;
                    self.setter = response.Setter;
                    self.proposaldesk = response.ProposalDesk;
                    self.email = response.Email;
                    $rootScope.homeowneremail = response.Email;
                    $rootScope.SalespersonEmail = response.SalespersonEmail;
                    self.phone = response.HomePhone;
                    self.CoHFirstName = response.CoHFirstName; 
                    self.CoHLastName = response.CoHLastName;
                    self.CoHHomePhone = response.CoHHomePhone;
                    self.CoHEmail = response.CoHEmail;
                    if(response.ProposalDetails[0])
                    self.proposals = response.ProposalDetails;  
                    if(response.NotesDetails[0])
                    self.CustomerNotes = response.NotesDetails[0].Notes;
                    $rootScope.SunEdCustId = response.SunEdCustId;
                    self.SunEdCustId = response.SunEdCustId;
                    $rootScope.LatLng = response.LatLng;
                    $rootScope.PartnerId = response.PartnerId;
		    if(localStorage.getItem('ls.userCurrentRole') === 'SalesManager' && response.OrigContractSignedDate  !== null){
                        $rootScope.PartnerIDForFinanceOptions = JSON.parse(localStorage.getItem('ls.se-user')).profile.PartnerId;
                    }else if($rootScope.PartnerIDForFinanceOptions){
                        delete $rootScope.PartnerIDForFinanceOptions;
                    }
                    $rootScope.SalesPersonId = response.SalesPersonId;
                    self.agreementstatus = response.ContractStatus;
		    self.PurchaseType = response.PurchaseType;
                    self.FinancingProgram = response.FinancingProgram;
                    if(self.FinancingProgram === 'WGSW'){
                        self.PurchaseType = 'Lease - Monthly(WGSW)';
                    }
                    if(self.FinancingProgram === 'SunEdison Mosaic SCION'){
                        self.PurchaseType = 'Loan Mosaic';
                    }
                    if(self.FinancingProgram === 'SunEdison Mosaic SCION With Signature Series'){
                        self.PurchaseType = 'Loan Mosaic Signature';
                    }
                    if(response.CreditStatus === null)
                        self.creditcheckstatus = 'Not started yet';
                    else if(response.CreditStatus === 'In Process' || response.CreditStatus === 'Initiated')
                        self.creditcheckstatus = 'Initiated';
                    else if(response.CreditStatus === 'Accepted' || response.CreditStatus === 'CC Passed')
                        self.creditcheckstatus = 'Credit Check Passed';
                    else if(response.CreditStatus === 'CC Failed')
                        self.creditcheckstatus = 'Credit Check Failed';
                    
                     self.VMtosubmit = {PartnerId: response.PartnerId,
                            SalesPersonId: response.SalesPersonId,
                            FirstName: response.FirstName,
                            LastName: response.LastName,
                            Street: response.Street,
                            City: response.City,
                            State: response.State,
                            Zip: response.Zip,
                            LatLng: response.LatLng,
                            Email: response.Email,
                            HomePhone: response.phone,
                            PurchaseType: response.PPA,
                            CoHFirstName: response.CoHFirstName,
                            CoHLastName: response.CoHLastName,
                            CoHEmail: response.CoHEmail
                            //FinancingProgram: response.FinancingProgram
                        };
                        
                        self.draftProposals = [];
                        for (var i = 0; i < response.ProposalDetails.length; i++) {
                            if (response.ProposalDetails[i].Status === 'Draft') {                                
                                self.draftProposals.push(response.ProposalDetails[i]);
                                var index = self.draftProposals.length-1;
                                //var dummyproposalId = (response.ProposalDetails[i].ProposalId).split('_');
                                //$rootScope.ProposalId = response.ProposalDetails[i].ProposalId;
                                //$rootScope.PricingQuoteId = response.ProposalDetails[i].PricingQuoteId;
                                var temp = new Date(response.ProposalDetails[i].LastUpdatedTime);
                                var temp1 = temp.toUTCString();
                                var currentdate = temp1.slice(5,22);
                                self.draftProposals[index].timetodisplay = currentdate;
                                if(response.ProposalDetails[i].Payment  === null)
                                    self.draftProposals[index].Payment = '-';
                                if(response.ProposalDetails[i].SystemSize  === null)
                                    self.draftProposals[index].SystemSize = '-';
                                if(response.ProposalDetails[i].FinanceProgram  === null)
                                    self.draftProposals[index].FinanceProgram = '-';
                                if(response.ProposalDetails[i].AgreementStatus  === null)
                                    self.draftProposals[index].AgreementStatus = '-';
                                self.draftProposals[index].editarrow = false;
                                self.draftProposals[index].edit = true;
                                self.draftProposals[index].titlechange = '';
                            }
                        } 
                        self.draftProposals.sort(compareProposals);
                        self.completedProposals = [];
                        for (var i = 0; i < response.ProposalDetails.length; i++) {
                            if (response.ProposalDetails[i].Status === "Completed") {                                
                                self.completedProposals.push(response.ProposalDetails[i]);
                                var index = self.completedProposals.length-1;
                                //var dummyproposalId = (response.ProposalDetails[i].ProposalId).split('_');                                
                                //self.completedProposals[index].dummyproposalId = dummyproposalId[1];
                                //$rootScope.ProposalId = response.ProposalDetails[i].ProposalId;
                                //$rootScope.PricingQuoteId = response.ProposalDetails[i].PricingQuoteId;
                                var temp = new Date(response.ProposalDetails[i].LastUpdatedTime);
                                var temp1 = temp.toUTCString();
                                var currentdate = temp1.slice(5,22);
                                self.completedProposals[index].timetodisplay = currentdate;
                                if(response.ProposalDetails[i].Payment  === null)
                                    self.completedProposals[index].Payment = '-';
                                if(response.ProposalDetails[i].SystemSize  === null)
                                    self.completedProposals[index].SystemSize = '-';
                                if(response.ProposalDetails[i].FinanceProgram  === null)
                                    self.completedProposals[index].FinanceProgram = '-';
                                if(response.ProposalDetails[i].AgreementStatus  === null)
                                    self.completedProposals[index].AgreementStatus = '-';
                                self.completedProposals[index].editarrow = false;
                                self.completedProposals[index].edit = true;
                                self.completedProposals[index].titlechange = '';
                            }
                        }
			for(var i=0; i<self.completedProposals.length; i++){
                            if (self.completedProposals[i].ContractDocusignEnvId && self.completedProposals[i].AgreementStatus === "Contract Generated") {
                                DocusignStatus.get({envelope: self.completedProposals[i].ContractDocusignEnvId}).$promise
                                    .then(function (data) {
                                        for(var k=0; k<self.completedProposals.length; k++){
                                            if(self.completedProposals[k].ContractDocusignEnvId === data.ContractDocusignEnvId){
                                                if (data.Status === 'sent') {
                                                    self.completedProposals[k].AgreementStatus = "Contract sent for signature";
                                                } else if (data.Status === 'completed') {
                                                    self.completedProposals[k].AgreementStatus = "Contract signed";
                                                    $scope.contractSigned = true;
                                                }
                                                break;
                                            }
                                        }
                                    })
                                    .catch(function (e) {
                                        $log.error(e);
                                    });
                            }
                        }
			self.completedProposals.sort(compareProposals);
                        $rootScope.FinancingProgram = response.FinancingProgram;
                        $rootScope.homeownerDetails = {latitude:response.LatLng.Lat, 
                           longitude:response.LatLng.Lng, SunEdCustId: response.SunEdCustId, 
                           Zip: response.Zip, FinancingProgram: response.FinancingProgram, 
                           addr1: self.addressLine1, addr2: self.addressLine2, customerName:$rootScope.customerName};       
                        
                        $rootScope.homeownerState = response.State;
                        self.loading = false;
			
			if(response.UtilityBills && response.UtilityBills !== ''){
                            self.utilityBillRetrieveInProcess = true;
                            FileUpload.get({filename:response.UtilityBills}).$promise
                                .then(function(response) {                    
                                   self.UtilityBillBase64 = response.Message;
                                   self.utilityBillRetrieveInProcess = false;
                                })
                                .catch(function() {
                                    $rootScope.utilityBillRetrieveInProcess = false;
                                });
                            var temparray = response.UtilityBills.split('_');
                            temparray.shift();
                            self.utilityBillNameForDisplay = temparray.join('_');
                        }
                    }
                    
                    })
                    .catch(function (error) {                        
                        self.loading = false;
                        console.log(error);
                        $state.go('homeowners');
                    });                 
                            
    }
    
    init();
         
    function customertofinance(proposalId, PricingQuoteId){
        
        localStorageService.add('proposalToClone', proposalId);
        localStorageService.add('proposalID', proposalId);
        localStorageService.add('bypassProposalIDGeneration', true);
        $rootScope.PricingQuoteId = PricingQuoteId;
        $rootScope.proposalId = proposalId;
        $rootScope.designtofinance = 0;
        $state.go('financeoption');
        
    }
    
    function compareProposals(a, b) {
        if (a.LastUpdatedTime < b.LastUpdatedTime)
            return -1;
        else if (a.LastUpdatedTime > b.LastUpdatedTime)
            return 1;
        else
            return 0;
    }
    
    function updatehomeowner(){
        if(!self.isDisabled && validateEmail() && validateCoHEmail() && validateName() && validateCloser() && validateHomeOwnerFname() && validateHomeOwnerLname() &&
                validateCoHomeOwnerFname() && validateCoHomeOwnerLname())
        {            
        self.VMtosubmit ={};
        if(self.cohomeowner)
        {
            self.coowner = self.cohomeowner.split(/(\s+)/);
            self.VMtosubmit['CoHFirstName'] = self.coowner[0];
            self.VMtosubmit['CoHLastName'] = self.coowner[2];
        }
                self.addr = self.addressLine2.split(',');
                self.VMtosubmit['Email'] = self.email;
                self.VMtosubmit['HomePhone'] = self.phone;
                self.VMtosubmit['Street'] = self.addressLine1;
                self.VMtosubmit['City'] =  self.addr[0];
                self.VMtosubmit['State'] = (self.addr[1]).trim();
                self.VMtosubmit['Zip'] = self.addr[2];
                self.VMtosubmit['SunEdCustId'] = $rootScope.SunEdCustId;
                self.VMtosubmit['LatLng'] = $rootScope.LatLng;
                self.VMtosubmit['PartnerId'] = $rootScope.PartnerId;
                self.VMtosubmit['SalesPersonId'] = $rootScope.SalesPersonId;
		self.VMtosubmit['PurchaseType'] = self.PurchaseType;
                self.VMtosubmit['CoHFirstName'] = self.CoHFirstName;
                self.VMtosubmit['CoHLastName'] = self.CoHLastName;
                self.VMtosubmit['CoHEmail'] = self.CoHEmail;
                self.VMtosubmit['FirstName'] = self.FirstName;
                self.VMtosubmit['LastName'] = self.LastName;
                
                self.VMtosubmit.ByPassModsolar = 'true';
                populateFinancingProgram(self.VMtosubmit);
                if(self.VMtosubmit.PurchaseType === 'Lease - Monthly(WGSW)'){
                    self.VMtosubmit.PurchaseType = 'Lease - Monthly';
                }
                if(self.VMtosubmit.PurchaseType === 'Loan Mosaic' || self.VMtosubmit.PurchaseType === 'Loan Mosaic Signature'){
                    self.VMtosubmit.PurchaseType = 'Loan';
                }
                if(self.setter)
                    self.VMtosubmit['Setter'] =self.setter;
                else
                    self.VMtosubmit['Setter'] ='';
                if(self.closer){
                    self.VMtosubmit['Closer'] =self.closer;
                    self.VMtosubmit['CloserEmail'] =self.closeremail;
                }
                else{
                    self.VMtosubmit['Closer'] ='';
                    self.VMtosubmit['CloserEmail'] ='';
                }
                if(self.proposaldesk)
                    self.VMtosubmit['ProposalDesk'] =self.proposaldesk;
                else
                    self.VMtosubmit['ProposalDesk'] ='';
                //self.VMtosubmit['NotesDetails'] = self.CustomerNotes;
                $rootScope.homeownerState = (self.addr[1]).trim();
                $rootScope.zip = (self.addr[2]).trim();
                $rootScope.homeowneremail = self.Email;
                
            self.isDisabled = true;  
            Homeowner.update({id: $rootScope.SunEdCustId}, self.VMtosubmit).$promise
                    .then(function (response) {                   
                        
                        //syncModelProperties(vmToSubmit.model, originalVM.model);
                        // this could break if the back end is returning something different that we PUT.
                        //return originalVM;
                        if(response.message){
                             //self.isDisabled = false;
                            showErrorDialog(response.message);
                        }
                        else
                        {
                        if($scope.prevaddress !== self.addressLine1){
                        $rootScope.homeownerDetails = {latitude:$scope.homeownerVM.latitude, 
                           longitude:$scope.homeownerVM.longitude, SunEdCustId: $rootScope.SunEdCustId, 
                           Zip: (self.addr[2]), FinancingProgram: $rootScope.FinancingProgram, 
                           addr1: self.addressLine1, addr2: self.addressLine2, customerName:$rootScope.customerName};
                        }
                        else
                        {
                            $rootScope.homeownerDetails = {latitude:$rootScope.LatLng.Lat, 
                           longitude:$rootScope.LatLng.Lng, SunEdCustId: $rootScope.SunEdCustId, 
                           Zip: (self.addr[2]), FinancingProgram: $rootScope.FinancingProgram, 
                           addr1: self.addressLine1, addr2: self.addressLine2, customerName:$rootScope.customerName};
                        }
                        self.isDisabled = false;
                        showErrorDialog("Lead Update: Lead Information has been successfully updated");
                        console.log('lead details saved');
                        }
                        })
                        .catch (function (response) {
                             self.isDisabled = false;
                            if(response.data.message.indexOf("already exists!") !== -1){
                                showErrorDialog("Update lead failed: " + response.data.message);
                            }else{
                                showErrorDialog("Update lead api failed");
                            }
                        });
            
        }
    }

    function populateFinancingProgram(VMtosubmit) {
            switch (VMtosubmit.PurchaseType) {
                case 'Lease - Monthly':
                    self.VMtosubmit.FinancingProgram = 'PPA 1.0';
                    self.FinancingProgram = 'PPA 1.0';
                    break;
                case 'Lease - Monthly(WGSW)':
                    self.VMtosubmit.FinancingProgram = 'WGSW';
                    self.FinancingProgram = 'WGSW';
                    break;
                case 'Loan':
                    self.VMtosubmit.FinancingProgram = 'WJB';
                    self.FinancingProgram = 'WJB';
                    break;
                case 'Cash':
                    self.VMtosubmit.FinancingProgram = '';
                    self.FinancingProgram = '';
                    break;
                case 'Undecided':
                    self.VMtosubmit.FinancingProgram = '';
                    self.FinancingProgram = '';
                    break;
                case 'PPA':
                    self.VMtosubmit.FinancingProgram = 'PPA 1.0';
                    self.FinancingProgram = 'PPA 1.0';
                    break;
                case 'Loan Mosaic':
                    self.VMtosubmit.FinancingProgram = 'SunEdison Mosaic SCION';
                    self.FinancingProgram = 'SunEdison Mosaic SCION';
                    break;
                case 'Loan Mosaic Signature':
                    self.VMtosubmit.FinancingProgram = 'SunEdison Mosaic SCION With Signature Series';
                    self.FinancingProgram = 'SunEdison Mosaic SCION With Signature Series';
                    break;
            }
        }



    function saveCustomerNotes(){
        CustomerNote.save({Notes: self.CustomerNotes, SunEdCustId:$rootScope.SunEdCustId});
    }
    
    function openDesginPage(){
        //$rootScope.PricingQuoteId;
        $rootScope.PricingQuoteId = '';
        $rootScope.proposalId = '';
           $state.go('designpage');
    }
       
    function openCloseDetails(id){  
            for(var i=0; i<self.proposals.length; i++){
                if(self.proposals[i].PricingQuoteId === id){
                    if(!self.proposals[i].open || self.proposals[i].open === ''){
                        self.proposals[i].open = 'open';
                    }else{
                        self.proposals[i].open = '';
                    }
                }
            }
    }
    
    function deleteProposalbox(id){   
            for(var i=0; i<self.proposals.length; i++){
                if(self.proposals[i].PricingQuoteId === id){
                    if(!self.proposals[i].delete || self.proposals[i].delete === ''){
                        self.proposals[i].open = '';
                        self.proposals[i].delete = 'delete';
                    }else{
                        self.proposals[i].delete = '';
                    }
                }
            }
    }
    
    function canceldeleteProposal(id){         
          /*  if(self.classForDeleteButton === 'delete'){            
                self.classForDeleteButton = '';
            }  */
            for(var i=0; i<self.proposals.length; i++){
                if(self.proposals[i].PricingQuoteId === id){
                    if(self.proposals[i].delete === 'delete'){
                        self.proposals[i].delete = '';
                    }
                }
            }
    }
    
    function deleteProposal(id){
        for(var i=0; i<self.proposals.length; i++){
                if(self.proposals[i].PricingQuoteId === id){
                    if(self.proposals[i].delete === 'delete'){
                        self.proposals[i].delete = '';
                        self.proposals[i].hideproposal ='true';
                    }
                }
            }
            DeleteProposal.delete({proposalid: id}).$promise
                    .then(function(){
                        console.log('proposal deleted '+id);                    
                        showErrorDialog("Delete Proposal: Proposal has been successfully deleted");
                    });
    }
   
    function OpenProposalpage(proposalId, proposaltitle, financeprog, envelopeId, pay,ProposalId){
            $rootScope.PricingQuoteId = proposalId;
            $rootScope.proposaltitle = proposaltitle;
            $rootScope.envelopeId = envelopeId;
            $rootScope.proposalpayment = pay;
            $rootScope.ProposalId = ProposalId;
            if(financeprog == 'PPA SCION' || financeprog == 'Lease SCION' || financeprog == 'PPA' || financeprog == 'Lease'){
                $rootScope.FinanceProgram = financeprog;
                $rootScope.PurchaseType = 'PPA';
            } else if(financeprog == 'Mosaic SCION' || financeprog == 'Mosaic SS SCION' ){
                $rootScope.FinanceProgram = financeprog;
                $rootScope.PurchaseType = 'Loan';
            } else if(financeprog == 'Cash SS SCION' || financeprog == 'Cash SCION' || financeprog == 'Cash' || financeprog == 'CSS'){
                $rootScope.FinanceProgram = financeprog;
                $rootScope.PurchaseType = 'Cash';
            }                
            $state.go('proposalview');
        }
        
        function tochangetitle(id) {
            for (var i = 0; i < self.proposals.length; i++) {
                if (self.proposals[i].ProposalId === id) {
                    if (self.proposals[i].titlechange || self.proposals[i].titlechange !== '') {
                        ProposalTitle.update({proposalId: id}, {"ProposalTitle": self.proposals[i].Title}).$promise
                                .then(function () {
                                    console.log('Proposal title chnaged ' + id);
                                    //showErrorDialog("Proposal title chnaged");
                                });
                        self.proposals[i].titlechange ='';
                        self.proposals[i].edit = true;
                        self.proposals[i].editarrow = false;
                    }
                    /*if (!self.proposals[i].titlechange  || self.proposals[i].titlechange === '') {
                        self.proposals[i].editarrow = true;
                        self.proposals[i].edit = false;
                        self.proposals[i].titlechange = 'tochange';                       
                    }
                    else
                    {
                        var title = self.proposals[i].Title;
                        ProposalTitle.update({proposalId: id}, {"ProposalTitle": title}).$promise
                                .then(function () {
                                    console.log('Proposal title chnaged ' + id);
                                    //showErrorDialog("Proposal title chnaged");
                                });
                        self.proposals[i].titlechange ='';
                        self.proposals[i].edit = true;
                        self.proposals[i].editarrow = false;
                    }*/
                }
            }
        }
        
        function getFocus(id){
            for (var i = 0; i < self.proposals.length; i++) {
                if (self.proposals[i].PricingQuoteId === id) {
                    self.proposals[i].editarrow = true;
                    self.proposals[i].edit = false;
                    self.proposals[i].titlechange = 'tochange';  
                    document.getElementById("proposaltitle_" + id).focus();
                }
            }
        }
        
    function enableUserNotes(){         
            if(self.classForUserNotes === ''){            
                self.classForUserNotes = 'to-change';
            }  
    }
    
    
    function prepLatLongModel(latLng) {
            if (!$scope.homeownerVM) {
                $scope.homeownerVM = {
                    latitude: 0,
                    longitude: 0
                };
            }
            if ($scope.homeownerVM.latitude && _.isObject($scope.homeownerVM.latitude)) {
                if (!$scope.homeownerVM.latitude) {
                    $scope.homeownerVM.latitude = 0;
                }
                if (!$scope.homeownerVM.longitude) {
                    $scope.homeownerVM.longitude = 0;
                }
            }

            return latLng;
        }
    
    function initializeAddressAutoComplete() {
            googleMapsInitialized.then(function() {
                autocompleteInstance = new googleMaps.places.Autocomplete((document.getElementById('addressLine1')), { types: ['geocode'] });

                googleMaps.event.addListener(autocompleteInstance, 'place_changed', function() {
                    var place = autocompleteInstance.getPlace();
                    var addressModel = geoCodeService.parsePlaceObject(place);
                    self.addressLine1 = addressModel.Street;
                    self.addressLine2 = addressModel.City + ', ' + addressModel.State + ', ' + addressModel.Zip;
                    //console.log(addressModel);
                    geoCodeService
                        .latitudeAndLongitude(addressModel.Street, addressModel.City, addressModel.State, addressModel.Zip)
                        .then(prepLatLongModel)
                        .then(function (latLng) {
                            $scope.homeownerVM.latitude = latLng.latitude;
                            $scope.homeownerVM.longitude = latLng.longitude;
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
        
        function validateCloser(){
            if(self.closer){
                if(!self.closeremail)
                {
                    showErrorDialog("Please enter Closer's email address.");
                    return false;
                }
                else
                {
                    if(!validateCloserEmail())
                        return false;
                }
                return true;
            }
            else if(self.closeremail && validateCloserEmail()){
                if(!self.closer){
                    showErrorDialog("Please enter Closer's First Name and Last Name.");
                    return false;
                }
                return true;
            }
            else{
                return true;
            }
        }
                                        
        function validateCloserEmail(){
            if((self.closeremail).indexOf('@') === -1){
                showErrorDialog("Please enter a valid Email Address  for Closer Email");
                return false;
            }
            else if((self.closeremail).indexOf('.') === -1){
                showErrorDialog("Please enter a valid Email Address  for Closer Email");
                return false;
            }else{
                return true;
            }
        }
        
        function validateEmail(){
            if((self.email).indexOf('@') === -1){
                showErrorDialog("Please enter a valid Email Address");
                return false;
            }
            else if((self.email).indexOf('.') === -1){
                showErrorDialog("Please enter a valid Email Address");
                return false;
            }else{
                return true;
            }
        }
        
        function validateCoHEmail(){
            if(self.CoHEmail && self.CoHEmail !== null &&(self.CoHEmail).indexOf('@') === -1){
                showErrorDialog("Please enter a valid Email Address");
                return false;
            }
            else if(self.CoHEmail && self.CoHEmail !== null &&(self.CoHEmail).indexOf('.') === -1){
                showErrorDialog("Please enter a valid Email Address");
                return false;
            }else{
                return true;
            }
        }
        
      /* function validateInputVal(){
        var regEx =/^[A-Za-z'-]+$/;
        var ctrl = document.getElementById('HomeOwnerFname').value;
        var HoLname = document.getElementById('HomeOwnerLname').value;
        var CoHFname = document.getElementById('CoHomeOwnerFname').value;
        var CoHLname = document.getElementById('CoHomeOwnerLname').value;
        if(regEx.test(ctrl,HoLname,CoHFname,CoHLname)){
            return true;
        }else{
            showErrorDialog("Name should not include numbers or special characters aside from hyphen(-) and apostrophe('). Please fix and try again.");
            return false;
        }
    }*/
    
     function validateHomeOwnerFname(){
        var regEx =/^[A-Za-z'-]+$/;
        var ctrl = document.getElementById('HomeOwnerFname').value;
        if(regEx.test(ctrl)){
            return true;
        }else if(regEx.test(ctrl) === ""){
            return false;
        }
        else{
            showErrorDialog("Name should not include numbers or special characters aside from hyphen(-) and apostrophe('). Please fix and try again.");
            return false;
        }
    }
    
    function validateHomeOwnerLname(){
        var regEx =/^[A-Za-z'-]+$/;
        var HoLname = document.getElementById('HomeOwnerLname').value;
        if(regEx.test(HoLname)){
            return true;
        }else if(regEx.test(HoLname) === ""){
            return false;
        }
        else{
            showErrorDialog("Name should not include numbers or special characters aside from hyphen(-) and apostrophe('). Please fix and try again.");
            return false;
        }
    }
    
    function validateCoHomeOwnerFname(){
        var regEx =/^[A-Za-z'-]+$/;
        var CoHFname = document.getElementById('CoHomeOwnerFname').value;
        if(regEx.test(CoHFname)){
            return true;
        }else if(CoHFname === ""){
            return true;
        }
        else{
            showErrorDialog("Name should not include numbers or special characters aside from hyphen(-) and apostrophe('). Please fix and try again.");
            return false;
        }
    }
    
    function validateCoHomeOwnerLname(){
        var regEx =/^[A-Za-z'-]+$/;
        var CoHLname = document.getElementById('CoHomeOwnerLname').value;
        if(regEx.test(CoHLname)){
            return true;
        }else if(CoHLname === ""){
            return true;
        }
        else{
            showErrorDialog("Name should not include numbers or special characters aside from hyphen(-) and apostrophe('). Please fix and try again.");
            return false;
        }
    }
    
    
       
        function validateName(){
            if(!/^([a-zA-Z\s-'])*$/.test(self.cohomeowner)){
                showErrorDialog("Co-owner name should not include numbers or special characters aside from hyphen(-) and apostrophe('). Please fix and try again.");
                return false;
            }else{
                return true;
            }
        } 
        
        function stopSpinner(spinnerId) {
            return usSpinnerService.stop(spinnerId);
        }

        function startSpinner(spinnerId) {
            return usSpinnerService.spin(spinnerId);
        }
        
        function startCreditCheck(){
            
            self.creditCheckInProcess = true;
            startSpinner($rootScope.SunEdCustId);
            //$('#resendblock').css('display','none');
            if($rootScope.sendresendflag === 'send'){
                $('#sendblock').css('display','none');
                $('#spinblock').css('display','block');
            }
            else
            {
                $('#resendblock').css('display','none');
                $('#spinblock').css('display','block');  
            }
       
            CreditCheck.save({'SunEdCustId': $rootScope.SunEdCustId, SalesPersonId: localStorageService.get('se-user').profile.NSInternalId}).$promise
                    .then(function (data) {
                        self.creditCheckInProcess = false;
                        stopSpinner($rootScope.SunEdCustId);
                        if(data.CreditCheckStatus === "Initiated")
                            self.creditcheckstatus = 'Initiated';
                        showErrorDialog('Credit Check has been successfully initiated');
                        if($rootScope.sendresendflag === 'send'){
                            $('#sendblock').css('display', 'block');
                            $('#spinblock').css('display', 'none');
                        }
                        else
                        {
                            $('#resendblock').css('display', 'block');
                            $('#spinblock').css('display', 'none');
                        }
                    })
                    .catch(function (error) {
                        showErrorDialog('Credit Check request has been failed to post because '+ error.CreditCheckStatus);
                        self.creditCheckInProcess = false;
                        stopSpinner($rootScope.SunEdCustId);
                        if($rootScope.sendresendflag === 'send'){
                            $('#sendblock').css('display', 'block');
                            $('#spinblock').css('display', 'none');
                        }
                        else
                        {
                            $('#resendblock').css('display', 'block');
                            $('#spinblock').css('display', 'none');
                        }
                    });
        }
        
        function initiateCreditCheck() {
            
            $rootScope.sendresendflag;
            if (self.creditCheckInProcess) {
                $log.warn('Credit check is currently in process.  Cannot activate again.');
                return;
            }
            self.creditCheckInProcess = true;
            startSpinner($rootScope.SunEdCustId);

            if (self.creditcheckstatus === 'In Process' || self.creditcheckstatus === 'Initiated') {
                var modalInstance = managedModal.open({
                    templateUrl: 'app/navbar/resendCreditCheckMsg.html',
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'modal-call-resendCreditCheck-message',
                    controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.cancel = function (val) {
                                $modalInstance.dismiss('cancel');
                                if(!val){
                                    stopSpinner($rootScope.SunEdCustId);
                                    self.creditCheckInProcess = false;
                                }
                            };
                            $scope.proceed = function (value) {
                                if(value){
                                    if(self.PartnerType === 'SALES ENGINE (Seller)'){
                                        chooseCreditCheck($rootScope.homeownerVM);
                                    }else{
                                        startCreditCheck();
                                    }
                                }else{
                                    stopSpinner($rootScope.SunEdCustId);
                                    self.creditCheckInProcess = false;
                                }
                                $scope.cancel(true);
                            };
                        }]
                });
            }
            else {
                if(self.PartnerType === 'SALES ENGINE (Seller)'){
                    chooseCreditCheck();
                }else{
                    startCreditCheck();
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
                                    stopSpinner($rootScope.SunEdCustId);
                                    self.creditCheckInProcess = false;
                                }
                            };
                            $scope.proceed = function (value) {
                                if(value){
                                    if($('input[name="loanType"]:checked').val() === 'Loan-Mosaic'){
                                        if(self.FinancingProgram !== 'SunEdison Mosaic SCION' && self.FinancingProgram !== 'SunEdison Mosaic SCION With Signature Series'){
                                            confirmLeadUpdate();
                                        }else{
                                            startCreditCheck();
                                            $scope.cancel(true);
                                        }
                                    }else{
                                        if(self.FinancingProgram !== 'PPA 1.0'){
                                            confirmLeadUpdate();
                                        }else{
                                            startCreditCheck();
                                            $scope.cancel(true);
                                        }
                                    }
                                }else{
                                    stopSpinner($rootScope.SunEdCustId);
                                    self.creditCheckInProcess = false;
                                    $scope.cancel(true);
                                }
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
                        $scope.homeOwnerName = self.customerName;
                        $scope.currentPurchaseType = self.PurchaseType;
                        $scope.calledFromCustomerDetailsPage = true;
                        $scope.cancel = function (val) {
                            $modalInstance.dismiss('cancel');
                            if(!val){
                                stopSpinner($rootScope.SunEdCustId);
                                self.creditCheckInProcess = false;
                            }
                        };
                        $scope.proceed = function (value) {
                            if(value){
                                $scope.cancel(true);
                            }else{
                                $scope.cancel(true);
                            }
                                    
                        };
                    }]
            });
        }

        function openProposalModal(){
            proposalModalService.openDesignPage($scope.homeownerDetails );
        }
        
        function customerlist(){
            $state.go('homeowners');
            $window.location.reload();
        }
        
        function cloneProposal(pricingQuoteID){
            localStorageService.add('proposalToClone', pricingQuoteID);
        }
        
        function cleanupLocalStorage(){
            localStorageService.remove('proposalToClone');
            localStorageService.remove('proposalID');
            localStorageService.remove('bypassProposalIDGeneration');
            localStorageService.remove('ProposalTool');
	    localStorageService.remove('FirstVisitToFinance');
            localStorageService.remove('FirstVisitToProposalView');
            localStorageService.remove('FirstVisitToDesign');
        }
    	function downloadFile(){
            if(self.UtilityBillBase64){
                var fileExtension = self.utilityBillNameForDisplay.split('.').pop();  
                var blob = null;
                if(fileExtension === 'zip' || fileExtension === 'xls' || fileExtension === 'xlsx'){
                    blob = new Blob([str2bytes(atob(self.UtilityBillBase64))], {type: "application/octet-stream;charset=utf-8"});
                }else{
                    blob = new Blob([str2bytes(atob(self.UtilityBillBase64))], {type: "application/pdf"});
                }
                saveAs(blob, self.utilityBillNameForDisplay);
            }      
        };        
        function deleteFile(){
            FileUpload.delete({filename:($rootScope.SunEdCustId + '_' + self.utilityBillNameForDisplay)}).$promise
                .then(function() {                    
                   self.utilityBillNameForDisplay = null;
                   self.UtilityBills = null;
                   self.FileBase64 = null;
                })
                .catch(function() {
                    $rootScope.$broadcast('backendError', error);
                    $rootScope.fileUploadInProgress = false;
                });            
        };
        
        $scope.fileUpload = function(){
            self.fileUploadInProgress = true;
            var fileSelect = document.getElementById('upload');            
            var file1 = fileSelect.files[0];          
            var reader = new FileReader();
            var validFileExtensions = ['jpg', 'zip', 'pdf', 'png', 'doc', 'xls', 'xlsx', 'docx', 'txt', 'gif', 'jpeg', 'ppt', 'pptx'];
            var tempArray = file1.name.split('.');            
            if(validFileExtensions.indexOf(tempArray[tempArray.length-1].toLowerCase()) !== -1){
                if(file1.size < 5242880){
                    var payload = {};       
                    reader.onload = function(readerEvt) {                        
                        if($rootScope.fileType === 'utilityBill'){
                            self.utilityBillUploadInProgress = true;
                            if(typeof payload.Bill === 'undefined'){
                                payload.Bill = {};
                            }
                            payload.Bill.Base64 = arrayBufferToBase64(readerEvt.target.result);
                        }else{
                            if(typeof payload.Docs === 'undefined'){
                                payload.Docs = [];
                                payload.Docs[0] = {};
                            }
                            payload.Docs[0].Base64 = arrayBufferToBase64(readerEvt.target.result);
                        }
                    };
                    reader.readAsArrayBuffer(file1);
                    payload.SunEdCustId = $rootScope.SunEdCustId ;
                    payload.PartnerName = $rootScope.PartnerName;
                    if($rootScope.fileType === 'utilityBill'){
                        self.utilityBillUploadInProgress = true;
                        if(typeof payload.Bill === 'undefined'){
                            payload.Bill = {};
                        }
                        payload.Bill.Ext = tempArray.pop();
                        payload.Bill.Name = tempArray.join('.');
                    }else{
                        if(typeof payload.Docs === 'undefined'){
                            payload.Docs = [];
                            payload.Docs[0] = {};
                        }
                        payload.Docs[0].Ext = tempArray.pop();
                        payload.Docs[0].Name = tempArray.join('.');                        
                    }
                    /*var zip = new JSZip();
                    zip.file(file1.name, binaryString);
                    zip.file(file2);*/          
                    if($rootScope.SunEdCustId && $rootScope.SunEdCustId !== ''){
                        setTimeout(function(){
                            
                            /*if(homeownerVM.model.UtilityBills && homeownerVM.model.UtilityBills !== ''){
                                FileUpload.delete({filename:homeownerVM.model.UtilityBills}).$promise
                                .then(function() {              
                                })
                                .catch(function() {
                                });
                            }*/
                            FileUpload.save(payload).$promise
                                .then(function (response) {
                                    self.fileUploadInProgress = false;
                                    self.utilityBillUploadInProgress = false;
                                    self.utilityBillNameForDisplay = file1.name;
				    if($rootScope.fileType === 'utilityBill'){
                                        self.UtilityBillBase64 = payload.Bill.Base64;
                                    }
                                })
                                .catch(function (error) {
                                    $rootScope.$broadcast('backendError', error);
                                    self.fileUploadInProgress = false;
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
                                $scope.fileTypeConfirm = function(value){
                                    if(value==='bill'){
                                        $rootScope.fileType = 'utilityBill';
                                        if(typeof  self.utilityBillNameForDisplay != 'undefined' && self.utilityBillNameForDisplay !== null && self.utilityBillNameForDisplay !== ''){
                                            openConfirmOrErrorDialogue('confirmUpload');
                                        }else{
                                             $scope.uploadfile(true);
                                        }
                                    }else{
                                        $rootScope.fileType = 'otherDocs';
                                        openConfirmOrErrorDialogue('confirmUpload');
                                        $scope.uploadfile(true);
                                    }
                                    $scope.cancel(true);
                                };
                                $scope.uploadfile = function(value){
                                    if(value){
                                        $('#upload').click();
                                        $scope.cancel(true);
                                    }else{
                                        $scope.cancel(true);
                                    }
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
    
    function deleteFileConfirm(){            
        openConfirmOrErrorDialogue('fileDelete');            
    };
        
    function fileUploadConfirm(){ 
        $rootScope.fileUploadInProgress = true;
        openConfirmOrErrorDialogue('fileType');
    };
      
    self.fileUploadConfirm = fileUploadConfirm;
    self.deleteFileConfirm = deleteFileConfirm;
    self.downloadFile = downloadFile;
    self.validateCloser = validateCloser;
    self.validateCloserEmail = validateCloserEmail;
    self.getFocus = getFocus;
    self.cleanupLocalStorage = cleanupLocalStorage;
    self.cloneProposal = cloneProposal;
    self.startSpinner = startSpinner;
    self.stopSpinner = stopSpinner;
    self.startCreditCheck = startCreditCheck;
    self.customerlist = customerlist;    
    self.openProposalModal = openProposalModal;   
    self.initiateCreditCheck = initiateCreditCheck;   
    self.validateEmail = validateEmail;
    self.validateCoHEmail = validateCoHEmail;
    self.saveCustomerNotes = saveCustomerNotes;
    self.showErrorDialog = showErrorDialog;
    self.tochangetitle = tochangetitle;    
    self.OpenProposalpage = OpenProposalpage;    
    self.customertofinance = customertofinance;
    self.geolocate = geolocate;
    self.initializeAddressAutoComplete = initializeAddressAutoComplete;
    self.updatehomeowner = updatehomeowner; 
    self.deleteProposal = deleteProposal;
    self.enableUserNotes = enableUserNotes;    
    self.canceldeleteProposal = canceldeleteProposal;
    self.deleteProposalbox = deleteProposalbox;
    self.openCloseDetails = openCloseDetails;
    self.openDesginPage = openDesginPage;
    self.validateName = validateName;
    //self.validateInputVal= validateInputVal;
    self.validateHomeOwnerFname = validateHomeOwnerFname;
    self.validateHomeOwnerLname = validateHomeOwnerLname;
    self.validateCoHomeOwnerFname = validateCoHomeOwnerFname;
    self.validateCoHomeOwnerLname = validateCoHomeOwnerLname;
    //self.dragdrop = dragdrop;
    
    }

    angular
        .module('dealerportal.customerDetails', ['dealerportal.service', 'ui.router', 'ui.bootstrap'])
        .controller('CustomerDetailsCtrl', ['$window', '$state', '$scope','$rootScope', '$log', 'sessionService', 'uiGmapGoogleMapApi', 'geoCodeService', 'CustomerDetailsfact','Homeowner', 'DeleteProposal', 'CustomerNote', 'managedModal', 'CreditCheck', 'proposalModalService','ProposalTitle','homeownerService', 'usSpinnerService', 'localStorageService', 'DocusignStatus', 'FileUpload', CustomerDetailsCtrl]);
})();
