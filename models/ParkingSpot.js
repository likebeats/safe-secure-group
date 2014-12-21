var keystone = require('keystone'),
	  Types = keystone.Field.Types;

var ParkingSpot = new keystone.List('ParkingSpot', {
  map: { name: 'parkingNumber' },
  drilldown: 'customer'
});

ParkingSpot.add({
  parkingNumber: { type: String, required: true, initial: true },
  customer: { type: Types.Relationship, ref: 'Customer' },
  customerCompany: { type: String, hidden: true },
  monthlyRent: { type: Types.Money },
  deposit: { type: Types.Money }
});

ParkingSpot.defaultColumns = 'parkingNumber, customer, customerCompany, monthlyRent, deposit';

ParkingSpot.register();
