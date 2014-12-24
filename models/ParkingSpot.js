var keystone = require('keystone'),
    Types = keystone.Field.Types;

var ParkingSpot = new keystone.List('ParkingSpot', {
    map: { name: 'parkingNumber' },
//     drilldown: 'customer',
    searchFields: 'parkingNumber, customer.nameAndCompany'
});

ParkingSpot.add({
    parkingNumber: { type: String, required: true, initial: true },
    customer: { type: Types.Relationship, ref: 'Customer' },
    monthlyRent: { type: Types.Money },
    deposit: { type: Types.Money }
});

ParkingSpot.relationship({ ref: 'Payment', path: 'parkingSpot' });

ParkingSpot.defaultColumns = 'parkingNumber, customer, monthlyRent, deposit';
ParkingSpot.register();
