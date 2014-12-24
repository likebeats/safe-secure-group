var keystone = require('keystone'),
    Types = keystone.Field.Types,
    moment = require('moment');

var Payment = new keystone.List('Payment', {
    map: { name: 'paymentDate' },
    defaultSort: '-paymentDate'
});

var monthNames = [ { value: 0, label: "January" },
                  { value: 1, label: "February" },
                 { value: 2, label: "March" },
                 { value: 3, label: "April" },
                 { value: 4, label: "May" },
                 { value: 5, label: "June" },
                 { value: 6, label: "July" },
                 { value: 7, label: "August" },
                 { value: 8, label: "September" },
                 { value: 9, label: "October" },
                 { value: 10, label: "November" },
                 { value: 11, label: "December" } ];

Payment.add({
    paymentDate: { type: Types.Date, format: 'MMM DD, YYYY', default: Date.now, initial: false, required: true },
    parkingSpot: { type: Types.Relationship, ref: 'ParkingSpot', required: true, initial: true },
    customer: { type: Types.Relationship, ref: 'Customer', required: true, initial: true },
    paymentForMonth: { type: Types.Select, numeric: true, options: monthNames, /*default: moment().format("MMMM"),*/ emptyOption: true, required: true, initial: true },
    paymentForYear: { type: Types.Number, format: false, default: new Date().getFullYear(), required: true, initial: true },
    paymentAmount: { type: Types.Money, required: true, initial: true },
    paymentMethod: { type: Types.Select, options: 'check, cash', default: 'check', emptyOption: false },
    checkNumber: { type: String, dependsOn: { paymentMethod: 'check' } },
    lateFeeAmount: { type: Types.Money }
});

Payment.defaultColumns = 'paymentDate, parkingSpot, customer, paymentForMonth, paymentForYear, paymentAmount';
Payment.register();
