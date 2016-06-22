'use strict';
(function () {

    function createApiWrapper($window) {
        var location = $window.location;
        var components = [location.protocol, '//', location.host, '/api'];
        //var components = [location.protocol, '//', location.host, '/ns'];
        var search = _(location.search.substring(1).split('&')).reduce(function splitParams(result, param) {
            param = param.split('=');
            result[param[0]] = param[1];
            return result;
        }, {});

        if (search.stub) {
            components.push('?stub=');
            components.push(search.stub);
        }

        return function wrapUrl(path) {
            var url = components.slice();
            url.splice(4, 0, path);
            return url.join('');
        };
    }
    
    function api(path, idProperty) {
        if(!idProperty) {
            idProperty = 'id';
        }

        return function ($resource, apiUrl) {
            return $resource(apiUrl(path), {'id': '@' + idProperty}, {
                'login': { method: 'POST' },
                'save': { method: 'POST' },
                'update': { method: 'PUT' },
                'get': { method: 'GET'},
                'delete': { method: 'DELETE'},
                // Yes, this is normally a response header. But it's what the
                // backend wants in order to get data directly from netsuite, foricbly
                // updating the cache.
                'getNoCache': {method: 'GET', headers: {'Cache-Control': 'no-cache'}}
            });
        };
    }

    angular
        .module('dealerportal.resource', ['ngResource'])
    /**
     * Forms an appropriate url to our API. Includes passing along the stub param to use the local file serving stub.
     */
        .factory('apiUrl',['$window', createApiWrapper])

    /**
     * Authenticate to the backend.
     */
        .factory('Login', ['$resource', 'apiUrl', api('/login')])

        .factory('PasswordReset', ['$resource', 'apiUrl', api('/resetpassword')])

    /**
     * Resource for creating, updating, and reading lists of homeowners.
     */
        .factory('Homeowner', ['$resource', 'apiUrl', api('/homeowners/:id', 'SunEdCustId', 'LastUpdatedOn')])

        .factory('CreditCheck', ['$resource', 'apiUrl', api('/homeowners/:id/credit_v1', 'SunEdCustId')])

    /**
     * API call to get the proposal PDF 
     */
        .factory('ProposalIDfact', ['$resource' , 'apiUrl', api('/proposal/:proposal', '')])

    /**
     * API call to get the proposal PDF 
     */
        .factory('ContractIdfact', ['$resource' , 'apiUrl', api('/contract/:proposal', '')])
	
	.factory('ProjectStatus', ['$resource', 'apiUrl', api('/site/:id', 'PartnerId')])
    
    /**
     * API call to get homeowner details for customer details page
     */
       .factory('CustomerDetailsfact', ['$resource' , 'apiUrl', api('/userprofile/:id', '')])
       
       .factory('CustomerNote', ['$resource', 'apiUrl', api('/notes')])

       .factory('DesignPage', ['$resource', 'apiUrl', api('/genability/tariffs/:zip', '')])
       
       .factory('FinanceDetails', ['$resource', 'apiUrl', api('/homeowners/:id/financeprograms', '', '')])
       
       .factory('DeleteProposal', ['$resource', 'apiUrl', api('/proposal/:proposalid', '')])
       
       .factory('DesignSave', ['$resource', 'apiUrl', api('/design')])
       
       .factory('DesignDetails', ['$resource', 'apiUrl', api('/design/:proposalId', '')])
       
       .factory('FinanceCalc', ['$resource', 'apiUrl', api('/finprog_v2')])
       
       .factory('Proposal', ['$resource', 'apiUrl', api('/proposal')])
       
       .factory('Contract', ['$resource', 'apiUrl', api('/contract')])
       
       .factory('GetProposal', ['$resource', 'apiUrl', api('/proposal/:id', '')])
       
       .factory('GetContract', ['$resource', 'apiUrl', api('/contract/:id','')])
       
       .factory('CashContract', ['$resource', 'apiUrl', api('/cashcontract')])
       
       .factory('ProposalTitle', ['$resource', 'apiUrl', api('/proposalTitle/:proposalId', '')])
       
       .factory('ProposalEmail', ['$resource', 'apiUrl', api('/proposal/email')])
       
       .factory('EmailDocusign', ['$resource', 'apiUrl', api('/docusign')])
       
       .factory('DesignInfo', ['$resource', 'apiUrl', api('/proposal/json/:pricingid', '')])
       
       .factory('FileUpload', ['$resource', 'apiUrl', api('/utilitybill/:filename')])
       
       .factory('CreditCheckPoll', ['$resource', 'apiUrl', api('/homeowners/:id')])
       
       .factory('Payment', ['$resource', 'apiUrl', api('/payments/')])    
       
       .factory('LoanPayment', ['$resource', 'apiUrl', api('/loanPayments/')])  
       
       .factory('Incentives', ['$resource', 'apiUrl', api('/genability/incentives/')])  
       
       .factory('DocusignUpdate', ['$resource', 'apiUrl', api('/proposal/:id/docusignenvelope/contract', 'pricing')])    
       
       .factory('DocusignStatus', ['$resource', 'apiUrl', api('/docusign/:envelope')])
       
       .factory('Partner', ['$resource', 'apiUrl', api('/partner')])
       
       .factory('Clone', ['$resource', 'apiUrl', api('/proposal/:id/clone', '')])
       
       .factory('AgreementStatus', ['$resource', 'apiUrl', api('/docusign/:id', '')])
    ;
})();
