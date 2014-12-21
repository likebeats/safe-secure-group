var keystone = require('keystone'),
    Types = keystone.Field.Types;

var Payment = new keystone.List('Payment', {
    map: { name: 'paymentDate' }
});

Payment.add({
    paymentDate: { type: Types.Date, initial: true, required: true },
    parkingNumber: { type: Types.Relationship, ref: 'ParkingSpot' },
    customer: { type: Types.Relationship, ref: 'Customer' },
    paymentAmount: { type: Types.Money },
    checkNumber: { type: String },
    lateFeeAmount: { type: Types.Money }
});

Payment.defaultColumns = 'paymentDate, parkingNumber, customer, paymentAmount, checkNumber';
Payment.register();
