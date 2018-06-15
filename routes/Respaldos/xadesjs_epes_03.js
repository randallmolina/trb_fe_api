//@ts-check
const fs = require("fs");
const asn1js = require("asn1js");
const pkijs = require("pkijs");
const xades = require("xadesjs");
const forge = require('node-forge'); 
const xmldsig = require("xmldsigjs");
const CryptoOSSL = require("node-webcrypto-ossl");
const crypto = new CryptoOSSL();

const commonName = "Test self-signed certificate";
const alg = {
    name: "RSASSA-PKCS1-v1_5",
    hash: { name: "SHA-256" },
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 1024,
};

async function CreateCertificate(commonName, keys, alg) {
    // Generate new certificate
    const certificate = new pkijs.Certificate();

    certificate.version = 2;
    certificate.serialNumber = new asn1js.Integer({ value: 1 });
    certificate.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.6", // Country name
        value: new asn1js.PrintableString({ value: "EN" })
    }));
    certificate.issuer.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3", // Common name
        value: new asn1js.BmpString({ value: commonName })
    }));
    certificate.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.6", // Country name
        value: new asn1js.PrintableString({ value: "EN" })
    }));
    certificate.subject.typesAndValues.push(new pkijs.AttributeTypeAndValue({
        type: "2.5.4.3", // Common name
        value: new asn1js.BmpString({ value: commonName })
    }));

    certificate.notBefore.value = new Date();
    certificate.notAfter.value = new Date();
    certificate.notAfter.value.setFullYear(certificate.notAfter.value.getFullYear() + 1);

    certificate.extensions = []; // Extensions are not a part of certificate by default, it's an optional array
    await certificate.subjectPublicKeyInfo.importKey(keys.publicKey);
    await certificate.sign(keys.privateKey, alg.hash.name);

    // Convert certificate to DER
    const derCert = certificate.toSchema(true).toBER(false);
    // const pem = DerToPem(derCert, "CERTIFICATE");
    const pem = Buffer.from(derCert).toString("base64");
    //console.log(pem);
    // import key to crypto
    return pem;
}

async function GenerateKeys(alg) {
    return await crypto.subtle.generateKey(alg, false, ["sign", "verify"]);
}


async function main() {
    // set crypto engine
    xades.Application.setEngine("OpenSSL", crypto);
    pkijs.setEngine("OpenSSL", crypto, new pkijs.CryptoEngine({ name: "OpenSSL", crypto, subtle: crypto.subtle }));
  /*  
    let POLITICA_FIRMA = {        
          "name":"",
          "url":"https://tribunet.hacienda.go.cr/docs/esquemas/2016/v4/Resolucion%20Comprobantes%20Electronicos%20%20DGT-R-48-2016.pdf",
          "digest":"V8lVVNGDCPen6VELRD1Ja8HARFk=" }; //digest en sha1 y base64 
          */

    //let vsign_id = "Signature-ddb543c7-ea0c-4b00-95b9-d4bfa2b4e411";
    let pfxFile = fs.readFileSync('./upload/15/llaveCripto/020460059301_JoseAlonso.p12');
    // convert to base64 is mock what I got from other website.
    let p12b64 = Buffer(pfxFile).toString('base64');
    let p12Der = forge.util.decode64(p12b64);
    let p12Asn1 = forge.asn1.fromDer(p12Der); 
    // decrypt p12 using the password 'password'
    let p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, '3003'); 
    //console.log(p12);
   /*
    let keyBags  = p12.getBags({bagType: '1.2.840.113549.1.12.10.1.2'});
    let keyBagsFrl  = p12.getBags({getBagsByFriendlyName:'name'}); 

  pkeyBags = p12.getBags({bagType: forge.pki.oids.pkcs8ShroudedKeyBag});
  var certBags = p12.getBags({bagType: forge.pki.oids.certBag});
  // fetching certBag
  var certBag = certBags[forge.pki.oids.certBag][0];
  // fetching keyBag
  keybag = pkeyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
  // generate pem from private key
  var privateKeyPem = forge.pki.privateKeyToPem(keybag.key);
  // generate pem from cert
  var certificate = forge.pki.certificateToPem(certBag.cert); 

    let certBags2 = p12.getBags({bagType: '1.2.840.113549.1.12.10.1.3'});
    */
    /*console.log('cert bag type: ', forge.pki.oids.certBag);
    console.log('key bag type: ', forge.pki.oids.keyBag);

    console.log(certBags2);
    console.log(keyBags);
  */
    const keys = await GenerateKeys(alg);
    const cert = await CreateCertificate(commonName, keys, alg);

    var xmlString = '<player bats="left" id="10012" throws="right">\n\t<!-- Here\'s a comment -->\n\t<name>Alfonso Soriano</name>\n\t<position>2B</position>\n\t<team>New York Yankees</team>\n</player>';
    var xmlDoc = xades.Parse(xmlString);
    const xml = new xades.SignedXml(xmlDoc);
    
   

    //xml.SignedProperties.SignedSignatureProperties
    
    /* 
    let psignPolicy = POLITICA_FIRMA;
	let psignatureID 		= "Signature-ddb543c7-ea0c-4b00-95b9-d4bfa2b4e411";
	let psignatureValue 	= "SignatureValue-ddb543c7-ea0c-4b00-95b9-d4bfa2b4e411";
	let pXadesObjectId 	= "XadesObjectId-43208d10-650c-4f42-af80-fc889962c9ac";
	let pKeyInfoId 		= "KeyInfoId-"+psignatureID;
	
	let pReference0Id		= "Reference-0e79b719-635c-476f-a59e-8ac3ba14365d";
	let pReference1Id		= "ReferenceKeyInfo";
	
	let pSignedProperties	= "SignedProperties-"+psignatureID;  */
    
    
    
    
 
    // If you need custom data you can add it manually
  // xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyId.Identifier.Qualifier = "OIDAsURI";
  //xml.SignatureID.localName = vsign_id;//"Signature-ddb543c7-ea0c-4b00-95b9-d4bfa2b4e411";

//  xml.SignedProperties.SignedSignatureProperties.Id =vsign_id;
  //  xml.SignaturePolicyId  = POLITICA_FIRMA;
   // xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId =POLITICA_FIRMA;
   /* xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyId.Identifier.Value = "my.uti.oid";
    xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyHash.DigestMethod.Algorithm = "http://www.w3.org/2001/04/xmlenc#sha256";
    xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyHash.DigestValue = new Uint8Array(20);
    */
    //console.log(xml);

    //console.log(keys);
    
    
    const signedXml = await xml.Sign(               // Signing document 
        alg,                              // algorithm  
        keys.privateKey,                        // key  
        xmlDoc,                                 // document 
        {                                       // options 
          //keys.publicKey,
            SignedProperties: { Id:"SignatureID-2c0caabd-7615-4c79-950c-3fad5232172f"},
            x509:  [cert],
            signingCertificate: cert, //signingCertificate: certificate,
            //signingCertificate: p12,
            references: [
                { hash: "SHA-256", transforms: ["enveloped"] }
            ],
            productionPlace: {
                country: "CR",
                state: "Alajuela",
                city: "Alajula",
                code: "4020"
            },
            signerRole: {
                claimed: ["ObligadoTributario"]
            } , 
            PolicyId: {
                 name:"randall",
                  url:["https://tribunet.hacienda.go.cr/docs/esquemas/2016/v4/Resolucion%20Comprobantes%20Electronicos%20%20DGT-R-48-2016.pdf"],
                digest:"V8lVVNGDCPen6VELRD1Ja8HARFk=" }   
             
        });
         
        signedXml.Id="Signature-2c0caabd-7615-4c79-950c-3fad5232172f";
    
       /* xml.SignedProperties.Id='SignatureID-2c0caabd-7615-4c79-950c-3fad5232172f';
        xml.SignedProperties._id='Signature_ID-2c0caabd-7615-4c79-950c-3fad5232172f';
        xml.SignedProperties.localName='Signature-localName';
        xml.SignedProperties.LocalName='Signature-LocalName';
        xml.SignedProperties.namespaceURI='namespaceURI';
        xml.SignedProperties.NamespaceURI='NamespaceURI'; 

        console.log(xml.SignedProperties); */
        
    console.log(signedXml.Id);
    console.log(signedXml.toString());
}

main()
    .catch((err) => {
        console.log(err);
    })