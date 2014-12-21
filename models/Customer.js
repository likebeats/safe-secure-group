var keystone = require('keystone'),
    Types = keystone.Field.Types;

var Customer = new keystone.List('Customer', {
    map: { name: 'nameAndCompany' },
    searchFields: 'nameAndCompany, email'
});

Customer.add({
    customerName: { type: Types.Name, required: true, initial: true },
    company: { type: String, required: true, initial: true },
    nameAndCompany: { type: String, hidden: true, initial: false },
    email: { type: Types.Email },
    address: { type: String },
    phone: { type: String },
    keyNumberOne: { type: String },
    keyNumberTwo: { type: String }
});

// Customer.schema.virtual('nameAndCompany').get(function() {
//     console.log(this);
//     return
// });

Customer.schema.pre('save', function(next) {
    this.nameAndCompany = this.customerName.first + ' ' + this.customerName.last + ' / ' + this.company;
    next();
});

Customer.relationship({ ref: 'Payment', path: 'customer' });
// Customer.relationship({ ref: 'ParkingSpot', path: 'customer' });

Customer.defaultColumns = 'email';
Customer.register();
