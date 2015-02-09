var keystone = require('keystone'),
    async = require('async'),
    csv = require("fast-csv"),
    Customer = keystone.list('Customer'),
    ParkingSpot = keystone.list('ParkingSpot'),
    Payment = keystone.list('Payment');

exports = module.exports = function(req, res) {

    // Payment.model.find(function(err, payments) {

    //     console.log(payments.length);
    //     if (err) {
    //         console.log("find error:" + err);
    //         return;
    //     }

    //     async.eachSeries(payments, function(payment, next) {

    //         var d = moment(payment.paymentDate).zone('+0300');
    //         d = d.date(d.date()+1);
    //         d = d.hour(0).minute(0).second(0);
    //         payment.paymentDate = new Date(d);

    //         console.log(d + " ||| " + payment.paymentDate);

    //         payment.save(function(err) {

    //             if (!err) {
    //                 console.log("payment saved");
    //             }
    //             else {
    //                 console.log("Error: could not save payment: " + err);
    //             }

    //             next();

    //         });

    //     }, function(err) {

    //         console.log("async error:" + err);

    //     });

    // });

    var view = new keystone.View(req, res),
        locals = res.locals;

    locals.moment = require('moment');

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'home';

    var numOfMonthsToCheck = 12;
    var dayOfMonthPaymentsDue = 5;

    locals.hasMissingPayments = false;

    // create empty groups
    locals.missingPayments = {};
    var d = new Date();
    for (var i = 0; i < numOfMonthsToCheck; i++) {
        var m = d.getMonth();
        var y = d.getFullYear();

        locals.missingPayments[(m + '/' + y)] = [];

        d.setMonth(d.getMonth()-1);
    }

    if (locals.user) {

        view.on('init', function(next) {

            ParkingSpot.model.find().where('customer').ne(null)
                                    .populate('customer')
                                    .exec(function(err, parkingSpots)
            {
                if (err || !parkingSpots.length) {
                    return next(err);
                }

                async.each(parkingSpots, function(parkingSpot, next2) {

                    Payment.model.find().where('parkingSpot').equals(parkingSpot._id)
                                        .where('customer').equals(parkingSpot.customer)
                                        .sort('paymentForYear paymentForMonth')
                                        .exec(function(err, payments)
                    {
                        if (payments.length > 0) {
                            var now = new Date();
                            var startMonth = payments[0].paymentForMonth;
                            var startYear = payments[0].paymentForYear;

                            var startDate = new Date();
                            startDate.setMonth(startMonth);
                            startDate.setDate(dayOfMonthPaymentsDue);
                            startDate.setYear(startYear);

                            var n = 0;
                            var i = (now.getDate() > dayOfMonthPaymentsDue) ? now.getMonth() : now.getMonth()-1;
                            while( startDate < now.setMonth(i) ) {

                                var lookForMonth = now.getMonth();
                                var lookForYear = now.getFullYear();
                                var found = false;

                                for (var p = 0; p < payments.length; p++) {
                                    if ((parseInt(payments[p].paymentForYear, 10) == lookForYear) &&
                                        (parseInt(payments[p].paymentForMonth, 10) == lookForMonth)) {
                                        found = true;
                                        break;
                                    }
                                }

                                if (!found) {
                                    locals.hasMissingPayments = true;
                                    var item = {
                                        forDate: new Date(now),
                                        parkingSpot: parkingSpot
                                    };
                                    locals.missingPayments[lookForMonth + '/' +lookForYear].push(item);
                                }

                                i -= 1;
                                n += 1;
                                if ((n >= numOfMonthsToCheck) || !(startDate < now.setMonth(i))) {
                                    break;
                                }
                            }
                        }

                        next2(err);

                    });

                }, function(err) {
                    next(err);
                });

            });

        });

    }

    // Render the view
    view.render('index');

};
