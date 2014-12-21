var keystone = require('keystone'),
	  Types = keystone.Field.Types;

var Customer = new keystone.List('Customer', {
  searchFields: 'name, company, email'
});

Customer.add({
  name: { type: Types.Name, required: true, initial: true },
  company: { type: String },
  email: { type: Types.Email },
  address: { type: String },
  phone: { type: String },
  keyNumberOne: { type: String },
  keyNumberTwo: { type: String }
});

Customer.schema.add({
  nameAndCompany: { type: String }
});

Customer.schema.virtual('nameAndCompany', function() {
  return this.name + ' ' + this.company;
});

Customer.relationship({ ref: 'ParkingSpot', path: 'customer' });

Customer.defaultColumns = 'name, company, email';
Customer.register();
