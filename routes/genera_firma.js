/*jslint node:true*/

var express = require('express');
var router = express.Router(); 
var xadesjs_epes = require('./xadesjs_epes.js');
//var dbconfig = require('./xadesjs_firma.js');
//var pg = require('pg');
//var connectionString =  dbconfig.connectionString;
//var fs = require("fs");
/* 
http://192.190.42.116:3000/genera_firma 
{"keypath":"/u01/NodeJS_WServises/trb_fe/upload/15/llaveCripto",  //Ruta de la llave (archivo .p12) generado en ATV (https://www.hacienda.go.cr/ATV/login.aspx).
 "keyPassword":"3003", //Pin elegido a la hora de descargar la llave
 "xmlInPath":"/u01/NodeJS_WServises/trb_fe/upload/15/xml/xml_112.xml", //ruta del archivo XML origen
 "xmlOutPath":"/u01/NodeJS_WServises/trb_fe/upload/15/xml/xml_112_sing.xml"}  */   //ruta del archivo XML firmado

router.post('/', (req, res, next) => {
  
  
  var body        = JSON.stringify(req.body); 
  //var vusuario    = body.usuario;   
         
  var vkeypath =body.keypath;
  var vkeyPassword =body.keyPassword;
  var vxmlInPath =body.xmlInPath;
  var vxmlOutPath =body.xmlOutPath; 
  
  /*
  var exec = require('child_process').exec, child; 
  child = exec('java -jar .jar/xadessignercr.jar sign  '+vkeypath+' '+  vkeyPassword+' '+vxmlInPath +' '+vxmlOutPath, 
  function (error, stdout, stderr)
    { console.log('stdout: ' + stdout); 
       console.log('stderr: ' + stderr); 
        if(error !== null){ 
          --console.log('exec error: ' + error); 
          res.contentType('application/json').status(400);
          res.send(JSON.stringify(  'stdout: ' + stdout+ 'stderr: ' + stderr));   
       } 
       
      });     
      //if(error == null){ 
        res.contentType('application/json').status(200);
        res.send(JSON.stringify('OK'));   
      // }  
      */

    //xadesjs_firma.SignXml(xmlString, keys, algorithm);
    xadesjs_epes.main();
   
     
});


module.exports = router;