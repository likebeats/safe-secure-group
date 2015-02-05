var keystone = require('keystone'),
    Types = keystone.Field.Types,
    moment = require('moment');
    ParkingSpot = keystone.list('ParkingSpot');

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
    parkingSpot: { type: Types.Relationship, ref: 'ParkingSpot', required: true, initial: true /*, filters: { customer: ':customer' }*/ },
    customer: { type: Types.Relationship, ref: 'Customer', required: false, initial: false },
    paymentForMonth: { type: Types.Select, numeric: true, default: moment().format("M")-1, options: monthNames, emptyOption: true, required: false, initial: true },
    paymentForYear: { type: Types.Number, format: false, default: new Date().getFullYear(), required: true, initial: true },
    paymentAmount: { type: Types.Money, required: true, initial: true },
    paymentMethod: { type: Types.Select, options: 'check, cash', default: 'check', emptyOption: false },
    checkNumber: { type: String, dependsOn: { paymentMethod: 'check' } },
    lateFeeAmount: { type: Types.Money }
});


Payment.schema.pre('save', function(next) {

    var payment = this;
    ParkingSpot.model.findOne().where('_id').equals(this.parkingSpot).exec(function(err, spot) {
        payment.customer = spot.customer;
        next();
    });

})

Payment.defaultColumns = 'paymentDate, parkingSpot, customer, paymentForMonth, paymentForYear, paymentAmount';
Payment.register();
