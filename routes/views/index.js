var keystone = require('keystone'),
    async = require('async'),
    ParkingSpot = keystone.list('ParkingSpot'),
    Payment = keystone.list('Payment');

exports = module.exports = function(req, res) {

    var view = new keystone.View(req, res),
        locals = res.locals;

    locals.moment = require('moment');

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'home';

    var numOfMonthsToCheck = 12;
    var dayOfMonthPaymentsDue = 5;

    // create empty groups
    locals.missingPayments = {};
    var d = new Date();
    for (var i = 0; i < numOfMonthsToCheck; i++) {
        var m = d.getMonth();
        var y = d.getFullYear();

        locals.missingPayments[(m + '/' + y)] = [];

        d.setMonth(d.getMonth()-1);
    }

    view.on('init', function(next) {

        ParkingSpot.model.find().where('customer').ne(null)
                                .populate('customer')
                                .exec(function(err, parkingSpots)
        {
            if (err || !parkingSpots.length) {
                return next(err);
            }

            async.each(parkingSpots, function(parkingSpot, next) {
            //for (var ps = 0; ps < parkingSpots.length; ps++) {

                //var parkingSpot = parkingSpots[ps];

                Payment.model.find().where('parkingSpot').equals(parkingSpot._id)
                                    .where('customer').equals(parkingSpot.customer)
                                    .sort('paymentForYear paymentForMonth')
                                    .exec(function(err, payments)
                {
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
                            var item = {
                                forDate: new Date(now),
                                parkingSpot: parkingSpot
                            };
                            locals.missingPayments[lookForMonth + '/' +lookForYear].push(item);
                        }

                        i -= 1;
                        n += 1;
                        if ((n >= numOfMonthsToCheck) || !(startDate < now.setMonth(i))) {
                            next(err);
                            break;
                        }
                    }

                    console.log(locals);

                    console.log('----- \n');
                });

            }, function(err) {
				next(err);
			});

        });

    });

    // Render the view
    view.render('index');

};
