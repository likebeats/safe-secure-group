var keystone = require('keystone'),
    async = require('async'),
    csv = require("fast-csv"),
    Customer = keystone.list('Customer'),
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
                //for (var ps = 0; ps < parkingSpots.length; ps++) {

                    //var parkingSpot = parkingSpots[ps];

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


    // parkingNumber, KeyCode1, company, fullName, street, city/state, zipCode, phone, email

//     view.on('init', function(next) {

//         locals.csvContent = [];
//         csv.fromPath("records.csv")
//         .on("data", function(data){

//             locals.csvContent.push(data);

//         })
//         .on("end", function(){


//             async.each(locals.csvContent, function(data, next) {
//             //for (var i = 0; i < locals.csvContent.length; i++) {

//                 //var data = locals.csvContent[i];

//                 var parkingNumber = data[0];
//                 var keyCode1 = data[1];
//                 var company = data[2];
//                 var fullName = data[3];
//                 var street = data[4];
//                 var cityAndState = data[5];
//                 var zipCode = data[6];
//                 var phone = data[7];
//                 var email = data[8];

//                 var nameParts = fullName.split(" ");
//                 var firstName = null;
//                 var lastName = null;
//                 if (nameParts.length == 1) {
//                     firstName = nameParts[0];
//                     lastName = '';
//                 } else if (nameParts.length == 2) {
//                     firstName = nameParts[0];
//                     lastName = nameParts[1];
//                 } else if (nameParts.length == 3) {
//                     firstName = nameParts[0] + " " + nameParts[1];
//                     lastName = nameParts[2];
//                 }

//                 //create Customer
//                 if (firstName && lastName) {
//                     //console.log(nameParts + "      " + firstName + "/" + lastName);

//                     var cityParts = cityAndState.split(", ");
//                     var city = cityParts[0] ? cityParts[0] : null;
//                     var state = cityParts[1] ? cityParts[1] : null;

//                     var address = null;
//                     if (street) {
//                         address = {
//                             street1: street,
//                             suburb: city,
//                             state: state,
//                             postCode: zipCode,
//                             country: 'United States'
//                         }
//                     }


//                     console.log("FINDING CUSTOMER");
//                     var customerModel = null;
//                     Customer.model.findOne().where('customerName.first').equals(firstName)
//                                         .where('customerName.last').equals(lastName)
//                                         .where('company').equals(company)
//                                         .exec(function(err, customer)
//                     {
//                         console.log("FINDING FINISHED");
//                         if (!customer) {


//                         } else {
//                             //console.log("CUSTOMER ALREADY EXISTS!");
//                             next(err);
//                         }
//                     });

//                 }


// //                                             var newCustomer = new Customer.model({
// //                                 customerName: {
// //                                     first: firstName,
// //                                     last: lastName
// //                                 },
// //                                 company: company,
// //                                 address: address,
// //                                 email: email,
// //                                 phone: phone,
// //                                 keyNumberOne: keyCode1
// //                             });
// //                             //console.log("saving: " + newCustomer.customerName);

// //                             newCustomer.save(function(err) {
// //                                 next(err);
// //                             });

//             }, function(err) {
//                 next(err);
// 			});

//         });

//     });



    // Render the view
    view.render('index');

};
