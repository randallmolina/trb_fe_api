/*jslint node:true*/

var express = require('express');
var router = express.Router(); 
var dbconfig = require('./dbconfig.js');
var database = require('./database.js'); 
var pg = require('pg');
var connectionString =  dbconfig.connectionString;
 

router.post('/', (req, res, next) => {
  var client      = new   pg.Client(connectionString);
  var resultado = [];
  // Grab data from http request
  //const data = {text: req.body.text, complete: false};
  // Get a Postgres client from the connection pool
  var body        = JSON.stringify(req.body); 
  //var vusuario    = body.usuario;   
  var vparam      = [body];  

  if (body) { 
      /* valida usuario
          http://192.190.42.116:3000/validausuario 
         {"usuario":"randall",
          "clave":"xe"}  */
      vsql = "SELECT trbf_registra_fac_json($1) as respuesta "; 
  

    client.connect()
      //.then(() => console.log('connected'))
      .catch(e => console.error('connection error', e.stack));
       client.query(vsql,vparam)
      .then(res2 => {  
        res.contentType('application/json').status(200);
        res.send(JSON.stringify(res2.rows));   
         })    
      .catch(e => {
        res.set('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({
                      status: 500,
                      message: "Error al registrar documento " + vsql ,
                      detailed_message: e.message 
            }));  
          //console.error(e.stack) 
          //resultado.push(e) 
       })  
      .then(() => {
         
          client.end(); 
       })    ; 

   } else {
     res.set('Content-Type', 'application/json');
     res.status(500).send(JSON.stringify({
                    status: 500,
                    message: "No hay datos para procesar"   ,
                    detailed_message: "Complete los datos"
          }));
   }
   // resultado = database.ejecutarsql(vsql,vparam)  ;  
   
     
});


module.exports = router;