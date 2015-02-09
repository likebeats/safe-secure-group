var keystone = require('keystone'),
    Types = keystone.Field.Types,
    moment = require('moment');
    ParkingSpot = keystone.list('ParkingSpot');

var Payment = new keystone.List('Payment', {
    map: { name: 'paymentDate' },
    defaultSort: '-paymentDate -_id'
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
    paymentFrom: { type: Types.Date, format: 'MMM DD, YYYY', required: true, initial: true, hidden: true },
    paymentTo: { type: Types.Date, format: 'MMM DD, YYYY', required: false, initial: true, hidden: true },
    paymentForMonth: { type: Types.Select, numeric: true, options: monthNames, emptyOption: true, initial: false },
    paymentForYear: { type: Types.Number, format: false, initial: false },
    paymentAmount: { type: Types.Money, required: true, initial: true },
    paymentMethod: { type: Types.Select, options: 'check, cash', default: 'check', emptyOption: false },
    checkNumber: { type: String, dependsOn: { paymentMethod: 'check' } },
    lateFeeAmount: { type: Types.Money }
});

Payment.schema.pre('validate', function(next) {

    if (!this.paymentFrom) this.paymentFrom = new Date();
    next();

});

Payment.schema.pre('save', function(next) {

    var payment = this;

    payment.paymentDate = new Date(payment.paymentDate.setHours(0,0,0,0));

    if (!payment.customer) {

        ParkingSpot.model.findOne().where('_id').equals(this.parkingSpot).exec(function(err, spot) {
            var customer = spot.customer;
            payment.customer = customer;

            if (payment.paymentFrom) {
                payment.paymentForMonth = payment.paymentFrom.getMonth();
                payment.paymentForYear = payment.paymentFrom.getFullYear();
            }

            if (payment.paymentTo) {

                payment.paymentFrom.setDate(1);
                payment.paymentTo.setDate(1);

                var current = payment.paymentFrom;
                var end = payment.paymentTo;

                if (current.getTime() !== end.getTime()) {
                    current = new Date(current.setMonth(current.getMonth() + 1));
                    while(current <= end) {
                        console.log(current);

                        // create multiple payment objects
                        var newPayment = new Payment.model();
                        newPayment.paymentDate = payment.paymentDate;
                        newPayment.parkingSpot = payment.parkingSpot;
                        newPayment.customer = payment.customer;
                        newPayment.paymentAmount = payment.paymentAmount;
                        newPayment.paymentForMonth = current.getMonth();
                        newPayment.paymentForYear = current.getFullYear();
                        newPayment.paymentFrom = new Date(current);
                        newPayment.save();

                        var newDate = current.setMonth(current.getMonth() + 1);
                        current = new Date(newDate);
                    }
                }

            }

            next();
        });

    } else {
        next();
    }

});

Payment.defaultColumns = 'paymentDate, parkingSpot, customer, paymentForMonth, paymentForYear, paymentAmount';
Payment.register();
