'use strict';
describe('format module', function () {
  beforeEach(angular.mock.module('dealerportal.format'));

  describe('asAddress', function () {
    var address, asAddress;

    beforeEach(inject(function(asAddressFilter) {
      address = {
        Street: '101 Main St.',
        City: 'Golden',
        State: 'Colorado',
        Zip: '12345'
      };
      asAddress = asAddressFilter;
    }));

    it('formats an address', function () {
      expect(asAddress(address)).toBe('101 Main St., Golden, Colorado, 12345');
    });

    it('formats an address missing a street', function () {
      delete address.Street;
      expect(asAddress(address)).toBe('Golden, Colorado, 12345');
    });

    it('formats an address missing a street', function () {
      delete address.City;
      expect(asAddress(address)).toBe('101 Main St., Colorado, 12345');
    });

    it('formats an address missing a street', function () {
      delete address.State;
      expect(asAddress(address)).toBe('101 Main St., Golden, 12345');
    });

    it('formats an address missing a street', function () {
      delete address.Zip;
      expect(asAddress(address)).toBe('101 Main St., Golden, Colorado');
    });
  });
});
