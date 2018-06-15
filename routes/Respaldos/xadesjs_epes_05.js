//@ts-check
const fs = require("fs");
const asn1js = require("asn1js");
const pkijs = require("pkijs");
const xades = require("xadesjs");
const forge = require('node-forge'); 
//const xmldsig = require("xmldsigjs");
const CryptoOSSL = require("node-webcrypto-ossl");
const crypto = new CryptoOSSL();
//Base de datos
var dbconfig = require('./dbconfig.js'); 
var config =  dbconfig.config; 
const Pool = require('pg-pool');

//const commonName222 = "Test self-signed certificate";
const alg = {
    name: "RSASSA-PKCS1-v1_5",
    Id: "SignatureValue-2c0caabd-7615-4c79-950c-3fad5232172f",
    url: "https://tribunet.hacienda.go.cr/docs/esquemas/2016/v4/Resolucion%20Comprobantes%20Electronicos%20%20DGT-R-48-2016.pdf",
    hash: { name: "SHA-256" },
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
};
 

async function GenerateKeys(alg) {
    return await crypto.subtle.generateKey(alg, false, ["sign", "verify"]);
}

function hexToBase64(str) {
    var hex = ('00' + str).slice(0 - str.length - str.length % 2);
    
    return btoa(String.fromCharCode.apply(null,
        hex.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
}

function bigint2base64(bigint){
    var base64 = '';
    base64 = btoa(bigint.toString(16).match(/\w{2}/g).map(function(a){return String.fromCharCode(parseInt(a, 16));} ).join(""));
    base64 = base64.match(/.{1,76}/g).join("\n");    
    return base64;
} 

function sha256_base64(txt) {
    var md = forge.md.sha256.create();
    md.update(txt); 
    return new Buffer(md.digest().toHex(), 'hex').toString('base64');
}

function fecha_frmt() {
    var current_d = new Date() ; 
        var tz = current_d.getTimezoneOffset();
        var sign = tz > 0 ? "-" : "+";
        var hours = (Math.floor(Math.abs(tz)/60)).toString().padStart(2,'0'); 
        var minutes = (Math.abs(tz)%60).toString().padStart(2,'0');   
        var mes = (current_d.getUTCMonth()+1).toString().padStart(2,'0'); 
        var dia = (current_d.getUTCDate()).toString().padStart(2,'0'); 
        var hora = (current_d.getUTCHours()).toString().padStart(2,'0'); 
        var minutos = (current_d.getUTCMinutes()).toString().padStart(2,'0'); 
        var segundos = (current_d.getUTCSeconds()).toString().padStart(2,'0'); 
        
       return (current_d.getUTCFullYear()+'-'+ mes +'-'+dia+'T'+
                        hora+':'+minutos+':'+segundos+sign+hours+':'+minutes);
    
}

async function main(parchivoP12,  pclaveP12, pxmlString, pid_documento, potros_datos ) {
    // set crypto engine
    xades.Application.setEngine("OpenSSL", crypto);
    pkijs.setEngine("OpenSSL", crypto, new pkijs.CryptoEngine({ name: "OpenSSL", crypto, subtle: crypto.subtle }));
    let pfxFile = fs.readFileSync(parchivoP12);
    // convert to base64 is mock what I got from other website.
    let p12b64 = Buffer(pfxFile).toString('base64');
    let p12Der = forge.util.decode64(p12b64);
    let p12Asn1 = forge.asn1.fromDer(p12Der); 
    // decrypt p12 using the password 'password'
    let p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false,pclaveP12);  

    var certBags = p12.getBags({bagType:forge.pki.oids.certBag})
    var cert = certBags[forge.oids.certBag][0].cert;
    
    var cert_Pem=forge.pki.certificateToPem(cert)
    var pkcs8bags = p12.getBags({bagType:forge.pki.oids.pkcs8ShroudedKeyBag});

    var pkcs8Organiza = p12.getBags({bagType:forge.pki.oids.organizationName});
    var pkcs8 = pkcs8bags[forge.oids.pkcs8ShroudedKeyBag][0]; 
    var key = pkcs8.key;

    if( key == null ) {
        key = pkcs8.asn1;
    }

    let certificateX509 = cert_Pem;
    certificateX509 = certificateX509.substr( certificateX509.indexOf('\n') );
    certificateX509 = certificateX509.substr( 0, certificateX509.indexOf('\n-----END CERTIFICATE-----') );
    certificateX509 = certificateX509.replace(/\r?\n|\r/g, '').replace(/([^\0]{76})/g, '$1\n');

    //Pasar certificado a formato DER y sacar su hash:
    let certificateX509_asn1 = forge.pki.certificateToAsn1(cert);
    let certificateX509_der = forge.asn1.toDer(certificateX509_asn1).getBytes();
    let certificateX509_der_hash =  sha256_base64(certificateX509_der);
    var exponent = hexToBase64(key.e.data[0].toString(16));  
    
    var modulus = bigint2base64(key.n);
    var X509SerialNumber = parseInt(cert.serialNumber, 16);
    const keys = await GenerateKeys(alg); 
 
     
    if (pid_documento ) { 
        const pool = new Pool(config); 
        var vparam = [pid_documento,'01' ]; 
        var vresultado = await pool.query("SELECT trbf_gen_doc_xml( $1,$2 ) xml_str ",vparam); 
        //var vresultado_now = await pool.query("SELECT now() fecha "); 
        //console.log(vresultado.rows[0].xml_str );
        pxmlString = vresultado.rows[0].xml_str; 
       // var vfecha_sign = vresultado_now.rows[0].fecha;
    }
    var xmlDoc = xades.Parse(pxmlString); 
      
    const xml = new xades.SignedXml(xmlDoc);
     
    const signedXml = await xml.Sign(               // Signing document 
        alg,                              // algorithm  
        keys.privateKey,                        // key  
        xmlDoc,                                 // document 
        {                                       // options 
          //keys.publicKey,
            //SignedProperties: { Id:"SignatureID-2c0caabd-7615-4c79-950c-3fad5232172f"},
            x509:   [certificateX509],
            signingCertificate: certificateX509, 
            references: [
                { hash: "SHA-256", transforms: ["enveloped"] } ,
                { hash: "SHA-256", transforms: ["enveloped"] } 
            ],
            //productionPlace: pproductionPlace, 
            signerRole: {
                claimed: [potros_datos.SignerRole_ClaimedRole]
            } /* , 
            policyid: {
                hash:"SHA-256",
                identifiers: {
                    qualifier: "OIDAsURI",
                    value: "quilifier.uri",
                },
                qualifiers: [
                    {
                        noticeRef: {
                            organization: "PeculiarVentures",
                            noticeNumbers: [1, 2, 3, 4, 5]
                        }
                    }
                ]
            }*/
            
             
        });
        
       // console.log(signedXml.toString());

        signedXml.Id="Signature-"+ potros_datos.signatureID;
        signedXml._SignedInfo._References.items[0].Id = "Reference-"+ potros_datos.Reference0Id ;
        signedXml._SignedInfo._References.items[1].Id = "ReferenceKeyInfo" ;
        signedXml._SignedInfo._References.items[1].Uri = "KeyInfoId-Signature-"+potros_datos.signatureID ;
        signedXml._SignedInfo._References.items[2]._Type="http://uri.etsi.org/01903#SignedProperties" ;
        signedXml._SignedInfo._References.items[2].Uri = "#SignedProperties-Signature-"+potros_datos.signatureID ; 

        signedXml._ObjectList.items[0].Id= "XadesObjectId-" + potros_datos.signatureID ;
        signedXml._ObjectList.items[0]._QualifyingProperties.Id= "QualifyingProperties-" + potros_datos.signatureID ;
        signedXml._ObjectList.items[0]._QualifyingProperties.Target= "#Signature-" + potros_datos.signatureID ;
        //
        signedXml._ObjectList.items[0]._QualifyingProperties.SignedProperties.Id= "SignedProperties-Signature-" + potros_datos.signatureID ;
        
        var vfechaAct =fecha_frmt();            
        var vfecha_xml = signedXml._ObjectList.items[0]._QualifyingProperties.SignedProperties._SignedSignatureProperties._SigningTime.Value.toISOString(); //=vfechaAct ;
       
       
    
    var vpolicy = '<xades:SignaturePolicyIdentifier><xades:SignaturePolicyId><xades:SigPolicyId><xades:Identifier>'+potros_datos.SigPolicyId_Identifier+'</xades:Identifier>';
        vpolicy+='<xades:Description /></xades:SigPolicyId> <xades:SigPolicyHash>';
        vpolicy+='<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><ds:DigestValue>'+potros_datos.digestPolicyHash+'</ds:DigestValue></xades:SigPolicyHash>'
        vpolicy+='</xades:SignaturePolicyId>'; 
    var signedXml_Str;
    signedXml_Str=signedXml._ObjectList.toString().replace(vfecha_xml,vfechaAct);
    signedXml_Str=signedXml_Str.replace('<xades:SignaturePolicyIdentifier>',vpolicy) ;

    var vDataObject ='</xades:SignedSignatureProperties><xades:SignedDataObjectProperties>';
    vDataObject+='<xades:DataObjectFormat ObjectReference="'+ "#Reference-"+ potros_datos.Reference0Id+'">';
    vDataObject+='<xades:MimeType>text/xml</xades:MimeType>';
    vDataObject+='<xades:Encoding>UTF-8</xades:Encoding>';
    vDataObject+='</xades:DataObjectFormat>';
    vDataObject+='</xades:SignedDataObjectProperties>';
    //
    signedXml_Str=signedXml_Str.replace('</xades:SignedSignatureProperties>',vDataObject) ;
    //console.log(signedXml_Str)   ;   
   
   signedXml_Str = signedXml.toString();
   signedXml_Str = signedXml_Str.replace(vfecha_xml,vfechaAct)
   signedXml_Str = signedXml_Str.replace('<xades:SignaturePolicyIdentifier>',vpolicy) ;
   signedXml_Str=signedXml_Str.replace('</xades:SignedSignatureProperties>',vDataObject) ;
   
   //console.log(btoa(signedXml_Str)); 
   console.log(signedXml.toString());

    }

 

main( './upload/15/llaveCripto/020460059301_JoseAlonso.p12',
      '3003',
      null, //'<player bats="left" id="10012" throws="right">\n\t<!-- Here\'s a comment -->\n\t<name>Alfonso Soriano</name>\n\t<position>2B</position>\n\t<team>New York Yankees</team>\n</player>',
      150,
      {signatureID:             "ddb543c7-ea0c-4b00-95b9-d4bfa2b4e411", 
       //signatureValue 	= "SignatureValue-"+signatureID
	   XadesObjectId:           "43208d10-650c-4f42-af80-fc889962c9ac", 	
	   Reference0Id:            "0e79b719-635c-476f-a59e-8ac3ba14365d",
	   Reference1Id:	        "ReferenceKeyInfo",	
       SigPolicyId_Identifier:  "https://tribunet.hacienda.go.cr/docs/esquemas/2017/v4.2/facturaElectronica",
       SignerRole_ClaimedRole: "ObligadoTributario",
       digestPolicyHash:"V8lVVNGDCPen6VELRD1Ja8HARFk="
       
       //SignedProperties:        "SignedProperties-"
      } 
     )
    .catch((err) => {
        console.log(err);
    });