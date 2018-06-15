/*jslint node:true*/
'use strict'
var express = require('express');
var bodyParser = require('body-parser');
var dbconfig = require('./dbconfig.js');
var pg = require('pg');
var connectionString =  dbconfig.connectionString;  //process.env.DATABASE_URL ||  dbConfig.connectionString ; 
//var pool = new pg.Pool(connectionString)
//var client = await pool.connect()

var pgp = require('pg-promise')(/*options*/)



 
function ejecutarsql (sentencia_sql,parametros_sql, res_env) {
  var client      = new   pg.Client(connectionString); 
  var vsql        = sentencia_sql;  
  var vparam      = parametros_sql; 

  var db = pgp( connectionString);

  console.log('vsql '+ vsql);
  db.any(sentencia_sql, parametros_sql)
  .then(data => {
    console.log('{"resultado":"OK"}');
      
    console.log(data.value);

   // res_env.contentType('application/json').status(200);
   // res_env.send(JSON.stringify( data.value)); 
  })
  .catch(error => {
      console.log('ERROR:', error); // print the error;
  })
  .finally(db.$pool.end); 

};

async  function ejecutarsql_ORIG (sentencia_sql,parametros_sql, res_env) {
  var client      = new   pg.Client(connectionString); 
  var vsql        = sentencia_sql;  
  var vparam      = parametros_sql; 

 await client.connect() 
  .catch(e => {
    res_env.set('Content-Type', 'application/json');
    res_env.status(500).send(JSON.stringify({
                  status: 500,
                  message: "Error al intentar conectar Base de Datos",
                  detailed_message: e.message 
        }));  

      })
 await client.query(vsql,vparam)
  .then(res => { 
      //if (res.rows) {
        console.log('{"resultado":"OK"}');
        res_env.contentType('application/json').status(200);
        res_env.send(JSON.stringify( res.rows)); 
     /* } else {
        console.log('{"resultado":"OK"}');
        res_env.contentType('application/json').status(200);
        res_env.send(JSON.stringify('{"resultado":"OK"}')); 
      } */
     })   
  .catch(e => {
      res_env.set('Content-Type', 'application/json');
      res_env.status(500).send(JSON.stringify({
                    status: 500,
                    message: "Error al ejecutar " + vsql ,
                    detailed_message: e.message 
          }));  
   })  
  .then(() => { 
      client.end(); 
   })    ; 
   
 

};

function cierra_conn (client_conn) {
   console.log('cerrando conexion');
   client_conn.on('end', () => {
         console.log('Cerrando');  
         client_conn.end(); 
         console.log('Cerrada');  
     });  
    console.log('Conexion Cerrada');  
    return;
};

async function query (q) {
  const client = await pool.connect()
  let res
  try {
    await client.query('BEGIN')
    try {
      res = await client.query(q)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  } finally {
    client.release()
  }
  return res
}


module.exports =   {ejecutarsql, cierra_conn, query}