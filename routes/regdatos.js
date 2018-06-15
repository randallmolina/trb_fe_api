/*jslint node:true*/

var express = require('express');
//var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var dbconfig = require('./dbconfig.js');
var database = require('./database.js');
 

var pg = require('pg');
var connectionString =  dbconfig.connectionString;  //process.env.DATABASE_URL ||  dbConfig.connectionString ; 

router.post('/', (req, res, next) => {
  var resultado   = [];
  var body        = req.body; 
  var vevento     = body.Tipoevento.evento; 
  var vdetalle      = body.Detalle; 
  var vsql        = "";  
  var vparam      = [];  
  var vstack      = "";
  
 console.log('inicio'); 
 console.log(vevento);  
//console.log(vdetalle.datos);  

  if (vevento) { 
    switch(vevento) {
/*  
{  "Tipoevento": 
    { "evento": "cambiarClave" },
"Detalle": 
    {
      "usuario":"randall",
      "claveactual":"ex",
      "clavenueva":"ex"
    }
}  */ 
    

      case "cambiarClave":
          vsql = "SELECT trbf_cambio_clave($1,$2,$3) resultado"; 
          var vusaurio     = vdetalle.usuario;
          var vclave_act   = vdetalle.claveactual;
          var vclave_nueva = vdetalle.clavenueva;
          vparam      = [vusaurio,vclave_act,vclave_nueva] ;
          break;  
      case "generaParametros":
          /*
{  "Tipoevento": 
    { "evento": "generaParametros" },
"Detalle": 
    { "empresa_id":58,
      "usuario":"dvillafuerte@exdesa.com"
    }
} */          
          vsql = "SELECT trbf_homologa_catalogos($1,$2) resultado"; 
          var vusaurio     = vdetalle.usuario;
          var vid_empresa   = vdetalle.empresa_id;
          vparam      = [vid_empresa , vusaurio] ;
          break;  
         
      case "insertarSinId":
          var vtabla      = vdetalle.tabla.nombre;
          var vcampos     = "";
          var vregistro   = vdetalle.registro;
          var varray_nombre = Object.keys(vregistro);
          var varray_valor  = Object.values(vregistro);
          var vvalues =""; 

        for (i = 0; i < varray_nombre.length; i++) { 

            vparam[i]= varray_valor[i];
            if (i==0) {
              if (varray_nombre[i].toUpperCase==='CLAVE' )  {
                vvalues  = 'trbf_clave_encripta($'+(i+1)+')';
              } else {
                vvalues  = ' $'+(i+1);
              }
              //vval_act = varray_nombre[i]+"=$"+i;
              vcampos  = varray_nombre[i];
            } else {
              if (varray_nombre[i].toUpperCase==='CLAVE' )  {
                vvalues  +=  ', trbf_clave_encripta($'+(i+1)+')';
              } else {
                vvalues  +=  ', $'+(i+1);
              } 
              vcampos  += "," + varray_nombre[i];
            }  
          }   

          vsql = "insert into " + vtabla + "(" + vcampos +") values (" + vvalues + "  ) "  ; 
           
        break; 
        case "actualizaSinId":
        var vtabla      = vdetalle.tabla.nombre;
        var vcampos     = "";
        var vregistro   = vdetalle.registro;
        var varray_nombre = Object.keys(vregistro);
        var varray_valor  = Object.values(vregistro); 
        var vval_act="";   

      for (i = 0; i < varray_nombre.length; i++) { 

          vparam[i-1]= varray_valor[i];
          if (i==1) { 
             
            if (varray_nombre[i].toUpperCase==='CLAVE' )  {
              vval_act = varray_nombre[i]+"trbf_clave_encripta(=$"+i+')';
            } else {
              vval_act = varray_nombre[i]+"=$"+i;
            }   

            vcampos  = varray_nombre[i];
          } else { 
             
            
            if (varray_nombre[i].toUpperCase==='CLAVE' )  {
              vval_act += "," + varray_nombre[i]+"trbf_clave_encripta(=$"+i+')';
            } else {
              vval_act += "," + varray_nombre[i]+" =$"+i;
            }   

            vcampos  += "," + varray_nombre[i];
          }  
        }   
 
        vsql = "update  " + vtabla + " set " +  vval_act + " where "+ varray_nombre[0] +"='" + varray_valor[0]  + "'"  ; 
        
        break;   
      case "insertar":
          

/*
{"Tipoevento": 
     { "evento": "insertar" },
  "Detalle": 
     {
      "tabla": 
        {"nombre":"trb_empresas"} ,
      "registro": 
        { "id_empresa": 15,
          "razon_social": "EDGAR JOSE ALONSO MOLINA HERNANDEZ",
          "tipo_identificacion": "01",
          "num_identificacion": "204600593",
          "id_provincia": 12,
          "id_canton": 79,
          "id_distrito": 395,
          "id_barrio": null,
          "otras_senas": "URB. LISBOA CASA CH1",
          "cod_pais_telefono": "506",
          "num_telefono": "83307197",
          "cod_pais_fax": "506",
          "num_fax": null,
          "correo_electronico": "randall.molina@gmail.com",
          "empresa": "02",
          "nombre_comercial": null
      } 
     } 
  }
*/      
          
           var vtabla      = vdetalle.tabla.nombre;
           var vcampos     = "";
           var vregistro   = vdetalle.registro;
           var varray_nombre = Object.keys(vregistro);
           var varray_valor  = Object.values(vregistro);
           var vvalues ="";
           var vval_act="";   

          for (i = 1; i < varray_nombre.length; i++) { 

              vparam[i-1]= varray_valor[i];
             

              if (i==1) {
                
                switch(varray_nombre[i].toUpperCase) { 
                  case "IMAGEN":  
                     vvalues = "decode($"+i+",'base64')";    
                     vval_act = varray_nombre[i]+"=decode($"+i+"'base64')";
                     break; 
                  default:
                     vvalues  = '$'+i;
                     vval_act = varray_nombre[i]+"=$"+i;
                }
                 //vvalues  = '$'+i;
                //vval_act = varray_nombre[i]+"=$"+i;
                vcampos  = varray_nombre[i];
              } else {                
                switch(varray_nombre[i].toUpperCase) { 
                  case "IMAGEN":  
                     vvalues = "decode($"+i+",'base64')";    
                     vval_act = varray_nombre[i]+"=decode($"+i+"'base64')";
                     break; 
                  default:
                     vvalues  += "," +'$'+i;
                     vval_act += "," + varray_nombre[i]+"=$"+i;
                }
                //vvalues  += "," +'$'+i;
                //vval_act += "," + varray_nombre[i]+"=$"+i;
                vcampos  += "," + varray_nombre[i];
              }   
           }   

           if (varray_valor[0]===null) {
              vsql = "insert into " + vtabla + "(" + vcampos +") values (" + vvalues + "  )  RETURNING  " + varray_nombre[0]  ; 
           } else {
              vsql = "update  " + vtabla + " set " +  vval_act + " where "+ varray_nombre[0] +"='" + varray_valor[0]  + "'"  ; 
           }
          break;  
       case "eliminar":         

/*
{"Tipoevento": 
     { "evento": "eliminar" },
  "Detalle": 
     {
      "tabla": 
        {"nombre":"trb_empresas"} ,
      "registro": 
        { "id_empresa": 30 } 
     } 
  }
*/               
           var vtabla        = vdetalle.tabla.nombre; 
           var vregistro     = vdetalle.registro;
           var varray_nombre = Object.keys(vregistro);
           var varray_valor  = Object.values(vregistro);  

 
           if (varray_valor[0]  !== null ) {            
              vsql = "delete from  " + vtabla + " where "+ varray_nombre[0] +"='" + varray_valor[0] + "'"  ; 
               
           }  
           break;

      default:
          res.set('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({
                    status: 500,
                    message: "El evento " + vevento + " , no esta definido" ,
                    detailed_message:"Contacte al departemento de T.I."  }));
           break;  
    }  
      

    if (vsql) {
        resultado = database.ejecutarsql(vsql,vparam, res)  ; 
    } else {
        res.set('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({
                    status: 500,
                    message: "El evento " + vevento + " , no logro armar la sentencia a ajecutar" ,
                    detailed_message:"Contacte al departemento de T.I."  }));
    }
       
  }

  
     
});


module.exports = router;