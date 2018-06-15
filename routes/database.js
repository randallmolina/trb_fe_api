 
/*jslint node:true*/
'use strict'
var express = require('express');
var bodyParser = require('body-parser');
var dbconfig = require('./dbconfig.js');
var pg = require('pg');
var connectionString =  dbconfig.connectionString;  //process.env.DATABASE_URL ||  dbConfig.connectionString ; 
//var pool = new pg.Pool(connectionString)
//var client = await pool.connect()
var Promise = require('promise');
  
 
async  function ejecutarsql (sentencia_sql,parametros_sql, res_env) {
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
        //console.log('{"resultado":"OK"}');
        res_env.contentType('application/json').status(200);
        res_env.send(JSON.stringify( res.rows)); 
     
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
       //  console.log('Cerrando');  
         client_conn.end(); 
         //console.log('Cerrada');  
     });  
    //console.log('Conexion Cerrada');  
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
};

function database_sql (sentencia_sql,parametros_sql  )  {
  var client      = new   pg.Client(connectionString); 
  var vsql        = sentencia_sql;  
  var vparam      = parametros_sql; 
 //return Promise.resolve()
// return new  Promise((resolve, reject) => {
 //.then(() => {
   
     client.connect() 
      .then ( 
        client.query(vsql,vparam)
          .then(res => { 
              //if (res.rows) {
                //console.log('{"resultado":"OK"}');
              // res_env.contentType('application/json').status(200);
              // res_env.send(JSON.stringify( res.rows)); 
          //  resolve ( res.rows);  
            // res_datos = res;
            return (res);
            
            })   
          .catch(e => {
          // reject (e); 
          //res_datos = e;
          return (e);
          /*
              res_env.set('Content-Type', 'application/json');
              res_env.status(500).send(JSON.stringify({
                            status: 500,
                            message: "Error al ejecutar " + vsql ,
                            detailed_message: e.message 
                  }));   */
          }) 
      )
      .catch(e => {
       // reject (e) 
       //res_datos =e;
       return (e) 
      /*  res_env.set('Content-Type', 'application/json');
        res_env.status(500).send(JSON.stringify({
                      status: 500,
                      message: "Error al intentar conectar Base de Datos",
                      detailed_message: e.message 
            }));  */

          })

      
      .then(() => { 
         client.end(); 
      })    ; 
   
   // });
 
}
 

function test2(req, res) { //sentencia_sql,parametros_sql) {
  const results = [];
  // Get a Postgres client from the connection pool
  //pg.connection(connectionString, (err, client, done) => {
    
    pg.Client(connectionString, (err, client, done) => {
    // Handle connection errors
    
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }     

    // SQL Query > Select Data
    const query = client.query(req.sentencia_sql,req.parametros_sql);
    // Stream results back one row at a time
    query.on('row', (row) => {
      return (results.push(row)) ;
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
     // return res.json(results);
    });
  });
}

function get(sentencia_sql,parametros_sql) {
    var pg = require('pg-promise-strict');
    
    var conString = connectionString; //"postgres://postgres:exdesa@192.190.42.116/trb_bd";
    
    var client = new pg.Client(conString);  
    
    try { 
    
    client.connect().then(function(client){
        console.log('conectado');
        return client.query(sentencia_sql,parametros_sql).execute();
    }).then(function(result){
        console.log(result.rows);
    //    console.log(row.name);
        result.client.done();
        return result;
    }).catch(function(err){
        return err;  //console.error('error connecting or running query' + err.message);
    });
  } finally {
    return ''; 
  } 
}


module.exports =   {ejecutarsql, cierra_conn, query,database_sql,test2,get}