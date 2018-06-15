/*jslint node:true*/

var express = require('express');
var router = express.Router();    
var fileUpload = require('express-fileupload');
var fs = require('fs');
 

//const app = express();

 

 //default options
//router.use(fileUpload());


 
router.post('/', function(req, res ) {
  if (req.files) {

      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      var archivo = req.files.archivo;
      var archivo_cortado = archivo.name.split('.');
      var archivo_ext     = archivo_cortado[archivo_cortado.length-1];
      var vid_empresa     = req.empresa_id;
      var vnombre_archivo = req.nombre_archivo;
      var vtipo_archivo   = req.tipo_archivo;  //imagen,LlaveCriptografica
      
      var path_archivo    = '.upload/'+vid_empresa; //+'/'+vnombre_archivo+'.'+archivo_ext;
      if (!fs.existsSync(path_archivo)){
        fs.mkdirSync(path_archivo);
      }
      path_archivo    = '.upload/'+vid_empresa+'/'+vtipo_archivo; //+vnombre_archivo+'.'+archivo_ext;
      if (!fs.existsSync(path_archivo)){
          fs.mkdirSync(path_archivo);
      }
      path_archivo    = '.upload/'+vid_empresa+'/'+vtipo_archivo +'/'+vnombre_archivo+'.'+archivo_ext;

      // Use the mv() method to place the file somewhere on your server
      archivo.mv(path_archivo, function(err) {
        if (err)
          return res.status(500).send(err);
    
        res.send('Archivo subido en:' + path_archivo);
      });
    } else  {
       return res.status(400).send('No hay archivo que subir.');   
  }   
});


module.exports = router; 