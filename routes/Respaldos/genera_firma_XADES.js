var express = require('express'); 
var router = express.Router(); 
var XAdES = require("xadesjs");
var WebCrypto = require("node-webcrypto-ossl").default;

XAdES.Application.setEngine("OpenSSL", new WebCrypto());

var fs = require("fs");


router.post('/', (req, res, next) => {
        var xmlString = fs.readFileSync("./upload/15/xml/some.xml","utf8");
           // /u01/NodeJS_WServises/trb_fe/upload/15/xml

        var signedDocument = XAdES.Parse(xmlString, "application/xml");
        var xmlSignature = signedDocument.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");
        
        var signedXml = new xadesjs.SignedXml(signedDocument);
        signedXml.LoadXml(xmlSignature[0]);
        signedXml.Verify()
            .then(res => {
                console.log((res ? "Valid" : "Invalid") + " signature");
            })
            .catch(function (e) {
                console.error(e);
            }); 

});    

module.exports = router;
