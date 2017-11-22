const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const Web3 = require('web3');
const contract = require('truffle-contract');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./config/database');

var port = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

mongoose.connect(config.database, { useMongoClient: true });
mongoose.Promise = global.Promise;

// invoice model
let Invoice = require('./models/invoice');
// company model
let Company = require('./models/company');
// user model
let User = require('./models/user');

// load view engine
app.set('view engine', 'pug');

// set public folder
app.use(express.static('public'))

// express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
}));

// home route
app.get('/', function(req, res){
    Invoice.find({}, function(err, invoice){
      if(err){
        console.log(err);
      } else {
        User.find({}, function(err, user){
          if(err){
            console.log(err);
          } else {
            Company.find({}, function(err, company){
              if(err){
                console.log(err);
              } else {
                res.render('index', {
                  invoice: invoice,
                  user:user,
                  company:company
                });
              }
            });
          }
        });
      }
    });
  });

// router files
app.use('/companys', require('./routers/companys'));
app.use('/invoices', require('./routers/invoices'));
app.use('/messengers', require('./routers/messengers'));
app.use('/wallets', require('./routers/wallets'));

// Start Server
app.listen(1000, function(){
    console.log('Server started on port 1000...');
});