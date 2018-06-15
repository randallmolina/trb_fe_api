/*jslint node:true*/

var express = require('express'); 
var router = express.Router(); 
var dbconfig = require('./dbconfig.js');
var database = require('./database.js');
var pg = require('pg');
var connectionString =  dbconfig.connectionString;
//var Promise = require('promise');
var qs = require("querystring");
var http = require("https");

router.post('/', (req, res, next) => {
  var client      = new   pg.Client(connectionString);
  var resultado = [];
  
  var body        = req.body; 
  var vid_empresa  = body.id_empresa;  
  var vparam       = [vid_empresa];  
  
  if (vid_empresa) { 
      /* valida usuario
          http://192.190.42.116:3000/validausuario 
         {"usuario":"randall",
          "clave":"xe"}  */
      vsql = "SELECT public.tbrf_obtiene_token($1) as token"; 
      vreq_hc =[vsql,vparam]
 
     // var vresultado= database.test2(vsql,vparam);
     var client      = new   pg.Client(connectionString);

     client.connect()
       //.then(() => console.log('connected'))
       .catch(e => console.error('connection error', e.stack));
 
 
       client.query(vsql,vparam)
       .then(res2 => {   
        var vtoken   =res2.rows[0].token;
        res.contentType('application/json').status(200);      
        res.send(JSON.stringify({ token: vtoken  }));                    
        //res.send(vrespuesta); 
           
        })    
       .catch(e => {
           console.error(e.stack) 
           resultado.push(e) 
        })  
       .then(() => {
          
           client.end(); 
        })    ; 
 
     

   } else {
     res.set('Content-Type', 'application/json');
     res.status(500).send(JSON.stringify({
                    status: 500,
                    message: "No ha indicado la empresa"   ,
                    detailed_message: "Complete el dato de la empresa"
          }));
   }



});


router.post('/prueba', (req, res, next) => {
    var client      = new   pg.Client(connectionString);
    var resultado = [];
    
    // Grab data from http request
    //const data = {text: req.body.text, complete: false};
    // Get a Postgres client from the connection pool
    var body        = req.body; 
    var vid_empresa  = body.id_empresa;  
    var vparam       = [vid_empresa];  
    
    if (vid_empresa) { 
        /* valida usuario
            http://192.190.42.116:3000/validausuario 
           {"usuario":"randall",
            "clave":"xe"}  */
        vsql = "SELECT id_empresa, razon_social, tipo_identificacion, num_identificacion, id_webservice, server_hc,port_hc , iden_ingreso, clave_ingreso, ult_token, fecha_hora_token, tiene_homogen, token_ws_exp Tiempo_Vigencia, token_interno, hora_token_int,  descripcion_ws, token_url, url_api_recepcion, client_id, client_secret, scope  FROM trb_empresas_ws where id_empresa=$1"; 
        vreq_hc =[vsql,vparam]
  
        //var Promise = require("promise").Promise;
       // var promise = new Promise();
       var vdatos = function (vdatos) {
                    return  database.get(vsql,vparam);  
                      console.log('vdatos '+vdatos);
                      console.log(vdatos)
       }
      
  /*
       database.rev_datos(vsql,vparam).then(function(response) {
          console.log("Success!", response);
          res.contentType('application/json').status(200);      
          res.send(response);
          //rev_datos(vsql,vparam);
        }, function(error) {
          console.log("Failed!", error);
         
        //  rev_datos(vsql,vparam);
         
         
        }) */
        
  
  
      //rev_datos(vsql,vparam);
  
     } else {
       res.set('Content-Type', 'application/json');
       res.status(500).send(JSON.stringify({
                      status: 500,
                      message: "No ha indicado la empresa"   ,
                      detailed_message: "Complete el dato de la empresa"
            }));
     }
  
  
  
  });

function rev_datos(vsql,vparam) { 
   // var vresultado= database.test2(vsql,vparam);
    var client      = new   pg.Client(connectionString);

    client.connect()
      //.then(() => console.log('connected'))
      .catch(e => console.error('connection error', e.stack));


      client.query(vsql,vparam)
      .then(res2 => {   
          
       // **   if ( (Sysdate-res2.rows[0].Hora_Token)*24 >= res2.rows[0].Tiempo_Vigencia)    {      
              var options = {
                  "method": "POST",
                  "hostname":  res2.rows[0].server_hc,
                  "path": res2.rows[0].token_url,
                  "port":res2.rows[0].port_hc,
                  "headers": {
                    "grant_type": "password&client_id="+res2.rows[0].client_id+"&username="+res2.rows[0].iden_ingreso+"&password="+res2.rows[0].clave_ingreso,
                    "Content-Type": "application/x-www-form-urlencoded"
                  }
              };

              var req_hacienda = http.request(options, function (res_hacienda) {
                var chunks = [];         
                res_hacienda.on("data",  function (chunk) { 
                  chunks.push(chunk); 
                });
              
                res_hacienda.on("end", function () {
                  var body = Buffer.concat(chunks); 
                  var vrespuesta =JSON.parse(body.toString());   
                  var vtoken = vrespuesta.access_token;
                  var vexpires_in = vrespuesta.expires_in;
                  var vrefresh_expires_in = vrespuesta.refresh_expires_in
                  var vrefresh_token = vrespuesta.refresh_expires_in;
                  var vtoken_type= vrespuesta.token_type;
                  var vid_token= vrespuesta.id_token;
                  //var vnot_before_policy= vrespuesta.not-before-policy;
                  var vsession_state= vrespuesta.session_state;
                 return vrespuesta;
                 // res.contentType('application/json').status(200);      
                 // res.send(vrespuesta);   
                });
              });
            
              req_hacienda.write(qs.stringify({ 
                  grant_type: 'password',
                  username: res2.rows[0].iden_ingreso,
                  password: res2.rows[0].clave_ingreso,
                  client_id: res2.rows[0].client_id }));
              req_hacienda.end();
         // ** }    
          
       })    
      .catch(e => {
          console.error(e.stack) 
          resultado.push(e) 
       })  
      .then(() => {
         
          client.end(); 
       })    ; 
    
    }; //rev_datos

module.exports = router;