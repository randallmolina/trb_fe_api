var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser'); 
//Definicion de los metodos 

var index = require('./routes/index');
var users = require('./routes/users');  
var validausuario    = require('./routes/validausuario');
var getdatos    = require('./routes/getdatos');
var regdatos    = require('./routes/regdatos');
var upload    = require('./routes/upload');
var hacienda    = require('./routes/hacienda');
var reg_documento    = require('./routes/reg_documento');
var genera_firma    = require('./routes/genera_firma');

var app = express(); 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware 
    next();
});

function ensureSecure(req, res, next){
  if(req.secure){
    return next();
  };
  res.redirect('https://'+req.hostname+':' + 3035 + req.url);
  console.log('Redireciones : '+ 'https://'+req.hostname+':' + 3030 + req.url )
};

//app.all('*', ensureSecure); 

app.use('/', index);
app.use('/users', users);
//app.use('/dbconfig', dbconfig);
app.use('/validausuario', validausuario);
app.use('/getdatos', getdatos);
app.use('/regdatos', regdatos);
app.use('/upload', upload); 
app.use('/hacienda', hacienda); 
app.use('/reg_documento', reg_documento); 
app.use('/genera_firma', genera_firma); 
 

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Ruta no fue encontrada');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
