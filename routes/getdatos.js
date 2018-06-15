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
  //var client      = new pg.Client(connectionString); 
  var resultado = [];
  //var resultado   = []; 
  // Grab data from http request
  //const data = {text: req.body.text, complete: false};
  // Get a Postgres client from the connection pool
  var body        = req.body; 
  var vtabla      = body.tabla;
  var vempresa_id = body.empresa_id;
  var vsql = "";
  var vparam = []; 
    
    if (vtabla) { 
      
     vparam = { vempresa_id: vempresa_id }; //, vfecha_act: vfecha_act};
     switch(vtabla) {     

        //Consulta de parametros
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"parametros",
        // "parametro":"tipocambio",
        // "empresa_id":15}
        case "parametros": 
            vsql = "select id_parametro  , cod_parametro  , desc_parametro  , valor_1  , valor_2  , valor_3  , id_empresa    from trb_parametros e where  cod_parametro = $1 and coalesce(e.id_empresa,0) = coalesce($2,0) ";
            vparam = [body.parametro , vempresa_id  ];
            break;
         
        //Consulta de clientes por empresa
        /* http://192.190.42.116:3000/getdatos 
         {"tabla":"clientesEmp",
          "num_identificacion":"204600593",
          "empresa_id":15}  */
        case "clientesEmp":
          vsql = "SELECT * FROM trb_clientes where id_empresa = $1 "; 
          vparam = [vempresa_id ];
          var vparam2 = body.id_cliente;
      
          if (vparam2) { 
            
            vsql = "SELECT * FROM trb_clientes where id_empresa = $1 and id_cliente = coalesce($2,id_cliente)  "; 
            vparam = [vempresa_id ,vparam2];
          } else {   
            vparam2 = body.num_identificacion;        
            if (vparam2) { 
              vsql = "SELECT * FROM trb_clientes where id_empresa = $1 and num_identificacion = coalesce($2,num_identificacion)  "; 
              vparam = [vempresa_id ,vparam2];
            }
          }  
          break;

        //Consulta Exoneraciones por  clientes
        /* http://192.190.42.116:3000/getdatos 
         {"tabla":"clientesExonEmp", 
          "id_cliente":15}  */
        case "clientesExonEmp":
        
        var vid_cliente = body.id_cliente;          
        vsql = "SELECT id_cliente_exon, id_cliente, tipodocumento, numerodocumento, nombreinstitucion, to_char(fecha_inicio,'dd/mm/yyyy') fecha_inicio, to_char(fecha_fin,'dd/mm/yyyy') fecha_fin, porc_exonera 	FROM  trb_clientes_exon where id_cliente = $1   "; 
        vparam = [vid_cliente ];         
        break;

        //Consulta Exoneraciones por  clientes
        /* http://192.190.42.116:3000/getdatos 
         {"tabla":"clientesExonProdEmp", 
          "id_clienteExon":15}  */
          case "clientesExonProdEmp":           
          var vid_clienteExon = body.id_clienteExon;          
          vsql = "SELECT id_cliente_exon_producto, id_cliente_exon, id_producto FROM trb_clientes_exon_producto where id_cliente_exon = $1   "; 
          vparam = [vid_clienteExon ];         
          break;
        
        /* Consulta de mpresa
           http://192.190.42.116:3000/getdatos 
         {"tabla":"empresas",
          "empresa_id":15,
         "usuario":"RANDALL"} */
        case "empresas":
           
           //vsql = "SELECT id_empresa  , razon_social  , tipo_identificacion  , num_identificacion  ,  id_provincia  , id_canton  , id_distrito  , id_barrio  , otras_senas   , cod_pais_telefono  , num_telefono  , cod_pais_fax  , num_fax  , correo_electronico  , empresa  , nombre_comercial, (select encode(imagen, 'base64') as imagen_code FROM  trb_imagenes i where i.id_empresa = e.id_empresa and upper(clase_imagen)='LOGO' ) as imagen  FROM  trb_empresas e where id_empresa = coalesce($1, id_empresa) and id_empresa in  (select u.id_empresa from trb_usuarios_emp u where upper(id_usuario)=upper($2) )";
           vsql = "SELECT  *  FROM  trb_empresas_v e where id_empresa = coalesce($1, id_empresa) and id_empresa in  (select u.id_empresa from trb_usuarios_emp u where upper(id_usuario)=upper($2) )";
            var vid_usuario = body.usuario;
           vparam = [vempresa_id,vid_usuario ];
           break;
        /*Consulta de para tributacion empresa
         http://192.190.42.116:3000/getdatos 
        {"tabla":"empresasPar",
         "empresa_id":15,
         "usuario":"RANDALL"}  */
        case "empresasPar": 
           vsql = "SELECT id_empresa, razon_social,  num_identificacion, id_webservice, descripcion_ws ,  ruta_certificado, pin_certificado, url_callback, url_receptores,      correo_adm_fe, iden_ingreso, clave_ingreso, tiene_homogen FROM  trb_empresas_ws  where id_empresa = coalesce($1, id_empresa)  and id_empresa in  (select u.id_empresa from trb_usuarios_emp u where upper(id_usuario)=upper($2) )";
           var vid_usuario = body.usuario;
           vparam = [vempresa_id,vid_usuario ];
           break;

        /*Consulta de para tributacion empresa
         http://192.190.42.116:3000/getdatos 
        {"tabla":"empresasImg",
         "empresa_id":15,
        "claseImagen":"logo",
         "usuario":"RANDALL"}  */
         case "empresasImg":
          vsql = "SELECT i_imagen, id_empresa, clase_imagen, nombre, encode(imagen, 'base64') as imagen FROM  trb_imagenes e  where id_empresa = $1  and clase_imagen=coalesce($2,'logo') and id_empresa in  (select u.id_empresa from trb_usuarios_emp u where upper(id_usuario)=upper($3) )";
          var vclaseImagen = body.claseImagen;
          var vid_usuario = body.usuario;
          vparam = [vempresa_id,vclaseImagen,vid_usuario ];
          break;

        /*Consulta de para tributacion empresa
         http://192.190.42.116:3000/getdatos 
        {"tabla":"webService" }  */
         case "webService":
           vsql = "SELECT id_webservice, descripcion, token_url, client_id, client_secret, scope, url_api_recepcion   FROM trb_wservices";
           vparam = [];
           break;
        /* Consulta de Usuarios
         http://192.190.42.116:3000/getdatos 
        { "tabla":"usuarios",
          "usuario":"RANDALL"
          "empresa_id":15} */
      //Consulta de perfiles 
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"perfiles"}
        case "perfiles":
              vsql   = "SELECT codigoperfil, descripcion   FROM  trb_perfiles ";
              vparam = [];
              break;

          case "usuarios": 
           vsql = "SELECT * FROM trb_usuarios_emp_v  where upper(idusuario) = coalesce(upper($1),upper(idusuario))   and id_empresa =   $2  " ;
           var vid_usuario = body.usuario;
           vparam =[vid_usuario,vempresa_id];
           break;

        /*Consulta de Usuarios por empresa
         http://192.190.42.116:3000/getdatos 
        {"tabla":"usuariosEmp",
         "usuario":"RANDALL",
         "empresa_id":15}  */

         case "usuariosEmp":
           vsql =  "SELECT e.id_empresa IdEmpresa , e.razon_social Nombre, u.id_usuario_emp ,u.perfil,  u.activo   FROM trb_usuarios_emp u , trb_empresas e where upper(u.id_usuario) =coalesce(upper($1),upper(u.id_usuario)) and u.id_empresa = e.id_empresa and e.id_empresa = coalesce( $2,e.id_empresa) " ;
           var vid_usuario = body.usuario;
           vparam =[vid_usuario,vempresa_id];
           break;
        
        //Consulta de Impuestos 
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"impuestos"}
        case "impuestos":
              vsql   = "SELECT codigoimpuesto, descripcion, porcentaje_imp    FROM  trb_impuestos ";
              vparam = [];
              break;

        //Consulta de Impuestos por empresa
        // http://192.190.42.116:3000/getdatos 
        //{ "tabla":"impuestosEmp", 
        //  "empresa_id":15 }
        case "impuestosEmp":
          vsql = "SELECT * FROM  trb_impuestos_emp_v e where  e.id_empresa = $1 ";
          vparam = [vempresa_id ];
          break;
          
       
        //Consulta de monedas
        /* http://192.190.42.116:3000/getdatos 
         { "tabla":"monedas", 
           "empresa_id":15 } */
         case "monedas":
            vsql = "SELECT * FROM trb_monedas where ind_mas_usadas='S' ";      
            vparam = [];
            break;

        //Consulta de todas las monedas
        // http://192.190.42.116:3000/getdatos 
        //{ "tabla":"impuestosTodas", 
        //  "empresa_id":15 }
        case "monedasTodas":
            vsql = "SELECT * FROM trb_monedas  ";      
            vparam = [];
            break;
        //Consulta de  monedas empresas
        // http://192.190.42.116:3000/getdatos 
        //{ "tabla":"impuestosEmp", 
        //  "empresa_id":15 }
        case  "monedasEmp":
            vsql = "SELECT * FROM trb_monedas_emp_v where id_empresa = $1  ";      
            vparam = [vempresa_id ];
            break;

        //Consulta de unidades de medidas 
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"unidadesMedida"}
        case "unidadesMedida":
              vsql   = "SELECT codigomedida, descripcion, ind_mas_usadas FROM trb_codigosmedida where ind_mas_usadas='S'";
              vparam = [];
              break;
        //Consulta de todas las unidades de medidas 
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"unidadesMedidaTodas"}
        case "unidadesMedidaTodas":
              vsql   = "SELECT codigomedida, descripcion, ind_mas_usadas FROM trb_codigosmedida ";
              vparam = [ ];
              break;

        /*Consulta de unidades medidas por empresa
          http://192.190.42.116:3000/getdatos 
          { "tabla":"unidadesMedidaEmp", 
           "empresa_id":15 } */
        case "unidadesMedidaEmp":
          vsql = "SELECT * FROM  trb_codigosmedida_emp_v e where  e.id_empresa = $1 ";
          vparam = [vempresa_id ];
          break;

        //Consulta de Impuestos 
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"condicionVenta"}
        case "condicionVenta":
              vsql   = "SELECT codigocondicion, descripcion FROM trb_condicionesventas";
              vparam = [];
              break;

        //Consulta de Impuestos por empresa
        // http://192.190.42.116:3000/getdatos 
        //{ "tabla":"condicionVentaEmp", 
        //  "empresa_id":15 }
        case "condicionVentaEmp":
          vsql = "SELECT * FROM  trb_condicionesventa_emp_v e where  e.id_empresa = $1 ";
          vparam = [vempresa_id ];
          break;

        //Consulta de distribucion geografica
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"distGeografica",
        // "nivle":0}
        case "distGeografica":
              vsql   = "SELECT id_dist_geo, nivel, nombre, codigo, id_padre FROM trb_dist_geografica where nivel = coalesce($1,nivel)";
              var vparam1 = body.nivel;
              vparam =[vparam1];
              break;

        //Consulta de distribucion geografica  por empresa
        // http://192.190.42.116:3000/getdatos 
        //{ "tabla":"distGeograficaEmp", 
        //  "empresa_id":15 ,}
        case "distGeograficaEmp":
          vsql = "SELECT * FROM  trb_dist_geografica_emp_v e where  e.id_empresa = $1 and nivel = coalesce($2,nivel)";
          var vparam2 = body.nivel;
          vparam = [vempresa_id,vparam2 ];
          break;

        //Consulta de distribucion geografica Barrio
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"barrio",
        // "id_barrio":1}
        case "barrio":
              vsql   = "SELECT * FROM trb_geo_barrio_v   where  id_barrio = coalesce($1,id_barrio) and id_distrito = coalesce($2,id_distrito) and id_canton = coalesce($3,id_canton)  and id_provincia = coalesce($4,id_provincia)";
              var vparam1 = body.id_barrio;
              var vparam2 = body.id_distrito;
              var vparam3 = body.id_canton;
              var vparam4 = body.id_provincia;
              vparam =[vparam1,vparam2,vparam3,vparam4];
              break;

        /*Consulta de distribucion geografica Barrio empresas
           http://192.190.42.116:3000/getdatos 
          {"tabla":"barrioEmp",  
           "empresa_id":15 ,
           "id_barrio1":1
           "id_distrito":393} */
           case "barrioEmp":
          vsql   = "SELECT * FROM trb_geo_barrio_emp_v   where coalesce(id_empresa, $1) =  $1 and id_distrito = coalesce($2,id_distrito)  and id_dist_geo =  coalesce($3,id_dist_geo) ";  
          var vparam2 = body.id_distrito;  
          var vparam3 = body.id_barrio;
          vparam =[vempresa_id,vparam2, vparam3 ];
          break;

        //Consulta de distribucion geografica distrito
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"distrito",
        // "id_distrito":1}
        case "distrito":
              vsql   = "SELECT * FROM trb_geo_distrito_v   where  id_distrito = coalesce($1,id_distrito) and id_canton = coalesce($2,id_canton)  and id_provincia = coalesce($3,id_provincia)";
              var vparam1 = body.id_distrito;
              var vparam2 = body.id_canton;
              var vparam3 = body.id_provincia;
              vparam =[vparam1,vparam2,vparam3];
              break;

        /*Consulta de distribucion geografica distrito empresas
           http://192.190.42.116:3000/getdatos 
          {"tabla":"distritoEmp", 
           "empresa_id":15 ,
           "id_canton":77} */
           case "distritoEmp":
            vsql   = "SELECT * FROM trb_geo_distrito_emp_v   where   coalesce(id_empresa,$1)  =$1 and id_canton = coalesce($2, id_canton )  ";  
            var vparam2 = body.id_canton; 
            vparam =[vempresa_id,vparam2 ];
            break;
        //Consulta de distribucion geografica Canton
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"canton",
        // "id_canton":1}
        case "canton":
              vsql   = "SELECT * FROM trb_geo_canton_v   where  id_canton = coalesce($1,id_canton)  and id_provincia = coalesce($2,id_provincia)";
              var vparam1 = body.id_canton;
              var vparam2 = body.id_provincia;
              vparam =[vparam1,vparam2 ]; 
              break;

        /*Consulta de distribucion geografica canton empresas
           http://192.190.42.116:3000/getdatos 
          {"tabla":"cantonEmp", 
           "empresa_id":15 ,
           "id_provincia":11} */
           case "cantonEmp":
            vsql   = "SELECT * FROM trb_geo_canton_emp_v where coalesce(id_empresa,$1)  = $1 and  id_provincia =  coalesce($2,id_provincia) ";  
            var vparam2 = body.id_provincia; 
            vparam =[vempresa_id,vparam2 ];
            break;

        /*Consulta de distribucion geografica provincia
          http://192.190.42.116:3000/getdatos 
          {"tabla":"provincia",
           "id_provincia":1}  */
           case "provincia":
              vsql   = "SELECT * FROM trb_geo_provincia_v   where  id_provincia = coalesce($1,id_provincia)";
              var vparam1 = body.id_provincia;
              vparam =[vparam1];
              break;
        /*Consulta de distribucion geografica provincia empresa
          http://192.190.42.116:3000/getdatos 
          {"tabla":"provinciaEmp",
           "empresa_id":15 }  */
           case "provinciaEmp":
            vsql   = "SELECT * FROM trb_geo_provincia_emp_v   where   coalesce(id_empresa,$1) =$1 ";
             
            vparam =[vempresa_id];
            break;

        //Consulta de medios de pago 
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"mediosPago"}
        case "mediosPago":
              vsql   = "SELECT codigomediopago, descripcion FROM trb_mediospago";
              vparam = [];
              break;

        //Consulta de medios de pago por empresa
        // http://192.190.42.116:3000/getdatos 
        //{ "tabla":"mediosPagoEmp", 
        //  "empresa_id":15 }
        case "mediosPagoEmp":
          vsql = "SELECT * FROM  trb_mediospago_emp_v e where  e.id_empresa = $1 ";
          vparam = [vempresa_id ];
          break;

        //Consulta de Puntos de venta 
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"pdvEmp", 
        //  "empresa_id":15 }
        case "pdvEmp":
              vsql   = "SELECT id_puntos_de_venta, id_empresa, num_punto_venta, cod_punto_venta, desc_punto_venta, id_sucursales FROM  trb_puntos_de_venta where id_empresa=$1";
              vparam = [vempresa_id ];
              break;
        //Consulta de Sucursales 
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"sucursalesEmp", 
        //  "empresa_id":15 }
        case "sucursalesEmp":
              vsql   = "SELECT id_sucursales, id_empresa, num_sucursal, cod_sucursal_emp, desc_sucursal_emp FROM trb_sucursales  where id_empresa=$1";
              vparam = [vempresa_id ];
              break;
        //Consulta de tipo de documento 
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"tiposDoc"}
        case "tiposDoc":
              vsql   = "SELECT codigotipodoc, descripcion, nombrexml, encabezado_xml FROM trb_tipos_documentos";
              vparam = [];
              break;

        //Consulta de tipos de documentos  por empresa
        // http://192.190.42.116:3000/getdatos 
        //{ "tabla":"tiposDocEmp", 
        //  "empresa_id":15 }
        case "tiposDocEmp":
          vsql = "SELECT * FROM  trb_tipos_documentos_emp_v e where  e.id_empresa = $1 ";
          vparam = [vempresa_id ];
          break;
        //Consulta de tipo de documento  referencia
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"tiposDocRef"}
        case "tiposDocRef":
              vsql   = "SELECT codigo, descripcion  FROM trb_tipos_documentos_ref";
              vparam = [];
              break;

        //Consulta de tipos de documentos por empresa
        // http://192.190.42.116:3000/getdatos 
        //{ "tabla":"tiposDocEmp", 
        //  "empresa_id":15 }
        case "tiposDocRefEmp":
          vsql = "SELECT * FROM  trb_tipos_documentos_ref_emp_v e where  e.id_empresa = $1 ";
          vparam = [vempresa_id ];
          break;
        /*Consulta de tipos de identificacion 
          http://192.190.42.116:3000/getdatos 
         {"tabla":"razonRef"} */
        case "razonesRef":
              vsql   = "SELECT cod_razon, descripcion  FROM trb_razones_ref";
              vparam = [];
              break;
        /*Consulta de tipos de identificacion 
          http://192.190.42.116:3000/getdatos 
         {"tabla":"razonesRefEmp","empresa_id":15 } */
        case "razonesRefEmp":
              vsql   = "SELECT *  FROM trb_razones_ref_emp_v e where  e.id_empresa = $1 ";
              vparam = [vempresa_id ];
              break;
        //Consulta de Exoneraciones
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"tiposExon"}
        case "tiposExon":
              vsql   = "SELECT codigotipoexo, descripcion FROM trb_tipos_exon";
              vparam = [];
              break;

        //Consulta de medios de pago por empresa
        // http://192.190.42.116:3000/getdatos 
        //{ "tabla":"tiposExonEmp", 
        //  "empresa_id":15 }
        case "tiposExonEmp":
          vsql = "SELECT * FROM  trb_tipos_exon_emp_v e where  e.id_empresa = $1 ";
          vparam = [vempresa_id ];
          break;

        //Consulta de tipos de identificacion 
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"tiposIden"}
        case "tiposIden":
              vsql   = "SELECT tipo_ident, descripcion  FROM trb_tipos_iden";
              vparam = [];
              break;
        

        //Consulta de medios de pago por empresa
        // http://192.190.42.116:3000/getdatos 
        //{ "tabla":"mediosPagoEmp", 
        //  "empresa_id":15 }
        case "tiposIdenEmp":
          vsql = "SELECT * FROM  trb_tipos_iden_emp_v e where  e.id_empresa = $1 ";
          vparam = [vempresa_id ];
          break;
        //Consulta de tipo de codigos de articulo 
        // http://192.190.42.116:3000/getdatos 
        //{"tabla":"tipoCodArticulo"}
        case "tipoCodArticulo":
              vsql   = "SELECT tipocodigo, descripcion FROM trb_tiposcodigoart";
              vparam = [];
              break;

        /*Consulta de tipo de codigos de articulo por empresa
           http://192.190.42.116:3000/getdatos 
          { "tabla":"tipoCodArticuloEmp", 
           "empresa_id":15 }*/
        case "tipoCodArticuloEmp":
          vsql = "SELECT * FROM  trb_tiposcodigoart_emp_v e where e.id_empresa = $1 ";
          vparam = [vempresa_id ];
          break;
        
          /*Consulta de articulo por empresa
           http://192.190.42.116:3000/getdatos 
          { "tabla":"productosEmp", 
           "empresa_id":15 }*/
        case "productosEmp":
          vsql = "SELECT * FROM  trb_productos_emp_v e where e.id_empresa = $1 ";
          vparam = [vempresa_id ];
          break;
        /*Consulta de articulo por empresa
           http://192.190.42.116:3000/getdatos 
          { "tabla":"productosMonEmp", 
           "empresa_id":15 ,
           "id_moneda":1,
           "id_cliente":null,
           "fechaFact":null}*/
          case "productosMonEmp":
          vsql = "SELECT e.*,trbf_porc_impuesto(e.id_articulo_emp,null,null) total_impuestos, trbf_porc_impuesto(e.id_articulo_emp,$3,$4) total_impuestos_neto,trbf_exonera_cli_prod(e.id_articulo_emp,$3,$4) det_exonera FROM  trb_productos_mon_emp_v e where e.id_articulo_emp =coalesce($5,e.id_articulo_emp) and e.id_empresa = $1 and e.id_moneda_emp=$2 ";
          var vid_moneda =  body.id_moneda;
          var vid_cliente =  body.id_cliente;
          var vfechaFact =  body.fechaFact;
          var vid_producto =  body.id_producto;
          vparam = [vempresa_id,vid_moneda,vid_cliente,vfechaFact,vid_producto ];
          break;  
          
          /*Consulta de impuestos articulos por empresa
           http://192.190.42.116:3000/getdatos 
          { "tabla":"productosImpEmp", 
           "empresa_id":15 ,
           "id_producto":1}*/
           case "productosImpEmp":
           vsql = "SELECT id_articulo_imp_emp, id_articulo_emp, id_empresa, id_impuesto_emp FROM  trb_productos_imp_emp e where e.id_empresa = $1 and e.id_articulo_emp=$2";
           var vid_producto =  body.id_producto;
           vparam = [vempresa_id, vid_producto ];
           break;
          
           /*Consulta de precios articulos por empresa
           http://192.190.42.116:3000/getdatos 
          { "tabla":"productosPrecEmp", 
           "empresa_id":15, 
           "id_producto":1}*/
           case "productosPrecEmp":
           vsql = "SELECT id_articulo_prec_emp, id_articulo_emp, id_empresa, id_moneda_emp, precio, porcentaje_desc from trb_productos_precio_emp e where e.id_empresa = $1 and e.id_articulo_emp=$2";
           var vid_producto =  body.id_producto;
           vparam = [vempresa_id, vid_producto ];
           break;

        /*  Consulta de encabezado document
          http://192.190.42.116:3000/getdatos 
          { "tabla":"encDocumentos", 
            "empresa_id":15 ,
            "estado":"AP"} */
          case "encDocumentos":
            vsql = "SELECT * FROM trb_documentos_enc_v_emp  where id_empresa=$1 and estado= $2 ORDER BY id_documento ASC  ";
            var vestado =  body.estado;
            vparam = [vempresa_id,vestado ];
            break;

        /*Consulta de detalle documentos
          http://192.190.42.116:3000/getdatos 
          { "tabla":"detDocumentos", 
           "empresa_id":15 ,
           "id_documento"=1} */
          case "detDocumentos":
            vsql = "SELECT * FROM trb_documentos_det  ORDER BY id_documento ASC  ";
            var vid_documento =  body.id_documento;
            vparam = [vempresa_id ];
            break;
       /*Consulta de impuestos documentos
          http://192.190.42.116:3000/getdatos 
          { "tabla":"impDetDocumentos", 
           "empresa_id":15 } */
           case "impDetDocumentos":
              vsql = "SELECT * FROM trb_documentos_det_imp ";
              var vid_documento =  body.id_documento;
              vparam =[vempresa_id ];
            break;
        } // switch(vevento) {    
     }
 
   resultado = database.ejecutarsql(vsql,vparam, res)  ;  
console.log('fin');  
  /*
   client.connect()
  //.then(() => [console.log('connected')])
  .catch(e => console.error('connection error', e.stack));

   client.query(vsql,vparam)
  .then(res2 => {  
    //console.log(res2.rows);  
    res.contentType('application/json').status(200);
    res.send(JSON.stringify(res2.rows));  
  })   //resultado.push(result)) //console.log(result.rows))
  .catch(e => {
      console.error(e.stack) 
       res.set('Content-Type', 'application/json');
       res.status(500).send(JSON.stringify({
                    status: 500,
                    message: "Error al obtener los datos de " + vsql ,
                    detailed_message: e.message  }));
       //client.end();
     //  return resultado ;
   })  
  .then(() => { 
      client.end(); 
   })    ; 
*/

 /*
    client.connect()
    //.then(() => [console.log('connected')])
    .catch(e => console.error('connection error', e.stack));
     client.query(vsql,vparam, (err, res2) => { 
       if (err) {
          //console.log(err.stack);
          //res.send(err.stack); 
          //client.end();  
          res.set('Content-Type', 'application/json');
          res.status(500).send(JSON.stringify({
                    status: 500,
                    message: "Error al obtener los datos de " + vsql ,
                    detailed_message: err.message
          }));
        } else {
          //console.log(res2.rows[0])
          results.push(res2.rows);
          //console.log(results);
          //client.end();  
         // done();
          //res.send(resultado.rows); 
         res.contentType('application/json').status(200);
         res.send(JSON.stringify(resultado.rows));

        }  ;
     }); 

     client.on('end', () => {
       client.end();  
       //   console.log('vsql '+ vsql);
          //return res.json(results);
         });  */
     
 
});


module.exports = router;