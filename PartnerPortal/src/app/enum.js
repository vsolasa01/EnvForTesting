/**
 * Created by jamesonnyeholt2 on 10/27/14.
 */

'use strict';
(function () {
  var usStateList = [
      'Alabama',
      'Alaska',
      'Arizona',
      'Arkansas',
      'California',
      'Colorado',
      'Connecticut',
      'Delaware',
      'Florida',
      'Georgia',
      'Hawaii',
      'Idaho',
      'Illinois',
      'Indiana',
      'Iowa',
      'Kansas',
      'Kentucky',
      'Louisiana',
      'Maine',
      'Maryland',
      'Massachusetts',
      'Michigan',
      'Minnesota',
      'Mississippi',
      'Missouri',
      'Montana',
      'Nebraska',
      'Nevada',
      'New Hampshire',
      'New Jersey',
      'New Mexico',
      'New York',
      'North Carolina',
      'North Dakota',
      'Ohio',
      'Oklahoma',
      'Oregon',
      'Pennsylvania',
      'Rhode Island',
      'South Carolina',
      'South Dakota',
      'Tennessee',
      'Texas',
      'Utah',
      'Vermont',
      'Virginia',
      'Washington',
      'West Virginia',
      'Wisconsin',
      'Wyoming'
    ],

    snapflowConstants = {
      EVENT: {
        USER_LOGIN: 'EVENT_USER_LOGIN',
        USER_LOGOUT: 'EVENT_USER_LOGOUT',
        APPLICATION_ERROR: 'EVENT_APPLICATION_ERROR'
      },
      ERROR: {
        REQUIRES_AUTHENTICATION: 'REQUIRES_AUTHENTICATION',
        REQUIRES_TENANT_IN_URL: 'REQUIRES_TENANT_IN_URL',
        UNKNOWN_TENANT: 'UNKNOWN_TENANT'
      }
    };


  angular.module('dealerportal.enum', [])
    .constant('snapflowConstant', snapflowConstants)
    .constant('usStateList', usStateList);
})();
