'use strict';
(function() {
  function formatAddress(address) {
    return _.compact([address.Street, address.City, address.State, address.Zip]).join(', ');
  }

  angular.module('dealerportal.format', [])
    .filter('asAddress' , function() { return formatAddress; });
})();
