const fs = require("fs");
const WebCrypto = require("node-webcrypto-ossl");
const xadesjs = require("xadesjs");
const forge = require('node-forge'); 
const { XMLSerializer } = require("xmldom-alpha");
const asn1js = require("asn1js");
const pkijs = require("pkijs");
const crypto = new WebCrypto();
xadesjs.Application.setEngine("OpenSSL", crypto);

function preparePem(pem) {
    return pem
        // remove BEGIN/END
        .replace(/-----(BEGIN|END)[\w\d\s]+-----/g, "")
        // remove \r, \n
        .replace(/[\r\n]/g, "");
}

function pem2der(pem) {
    pem = preparePem(pem);
    // convert base64 to ArrayBuffer
    return new Uint8Array(Buffer.from(pem, "base64")).buffer;
}

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
    console.log(pem);
    // import key to crypto
    return pem;
}

async function GenerateKeys(alg) {
    return await crypto.subtle.generateKey(alg, false, ["sign", "verify"]);
}



async function main() {
    const hash = "SHA-256"
    const alg2 = {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
    }

    /*
    const alg = {
        name: "RSASSA-PKCS1-v1_5",
        url: "https://tribunet.hacienda.go.cr/docs/esquemas/2016/v4/Resolucion%20Comprobantes%20Electronicos%20%20DGT-R-48-2016.pdf",
        digest: "V8lVVNGDCPen6VELRD1Ja8HARFk=" ,//digest en sha1 y base64
        hash: "SHA-256"
    }
    */

   const commonName = "Test self-signed certificate";
   const alg = {
       name: "RSASSA-PKCS1-v1_5",
       hash: { name: "SHA-256" },
       publicExponent: new Uint8Array([1, 0, 1]),
       modulusLength: 2048,
   };

    // Read cert
//    const certPem = fs.readFileSync("./upload/15/llaveCripto/020460059301_JoseAlonso.p12",   { encoding: "utf8" }); //'binary');
//    const certDer = pem2der(certPem);
/*
    var p12 = fs.readFileSync("./upload/15/llaveCripto/020460059301_JoseAlonso.p12", 'binary');
    var p12Asn1 = forge.asn1.fromDer(p12, false);
    var p12Parsed = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, 'password');
*/
let pfxFile = fs.readFileSync('./upload/15/llaveCripto/020460059301_JoseAlonso.p12');
// convert to base64 is mock what I got from other website.
let p12b64 = Buffer(pfxFile).toString('base64');
let p12Der = forge.util.decode64(p12b64);
let p12Asn1 = forge.asn1.fromDer(p12Der);

// decrypt p12 using the password 'password'
let p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, '3003'); 
let x509  =p12Asn1;
let p12_safe = p12.safeContents;

/// get key bags
var bags = p12.getBags({bagType: forge.pki.oids.keyBag});
// get key
var bag = bags[forge.pki.oids.keyBag];//[0];
var key = bag.key;
// if the key is in a format unrecognized by forge then
// bag.key will be `null`, use bag.asn1 to get the ASN.1
// representation of the key
if(bag.key === null) {
  var keyAsn1 = bag.asn1;
  // can now convert back to DER/PEM/etc for export
}
//var bags = p12.getBags({bagType: forge.pki.oids.certBag});

// base64-encode p12
var p12Der_A = forge.asn1.toDer(p12Asn1).getBytes();
var p12b64_A = forge.util.encode64(p12Der_A);
 

// get bags by friendlyName and filter on bag type
var bags3 = p12.getBags({
    friendlyName: 'test',
    bagType: forge.pki.oids.certBag
  });
 
let keyBags  = p12.getBags({bagType: '1.2.840.113549.1.12.10.1.2'});
let certBags2 = p12.getBags({bagType: '1.2.840.113549.1.12.10.1.3'});
console.log('cert bag type: ', forge.pki.oids.certBag);
console.log('key bag type: ', forge.pki.oids.keyBag);

console.log(certBags2);
console.log(keyBags);

// get bags by localKeyId (input in hex)
var bags4 = p12.getBags({localKeyIdHex: '7b59377ff142d0be4565e9ac3d396c01401cd879'});
// bags are key'd by attribute type (here "localKeyId", *not* "localKeyIdHex")
// and the key values are an array of matching objects
var cert4 = bags4.localKeyId[1];

let certBags = p12.getBags({bagType: forge.pki.oids.certBag});

var md = forge.md.sha256.create();
md.update('The quick brown fox jumps over the lazy dog');
console.log(md.digest().toHex());
// output: d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592


//console.log('cert: ', bags[forge.pki.oids.certBag][0].cert);

    // Read key
  /* 
    const keyPem = fs.readFileSync("./upload/15/llaveCripto/020460059301_JoseAlonso.p12", { encoding: "utf8" });
    const keyDer = pem2der(keyPem);
    const key2 = await crypto.subtle.importKey("pkcs8", keyDer, alg, false, ["sign"]);
  */

    // XAdES-EPES
    //var xmlString = `<Test><Document attr="Hello"/></Test>`;
    //var xml = xadesjs.Parse(xmlString);

    //var xadesXml = new xadesjs.SignedXml();
    //const x509 =  preparePem(certPem);
    
    //key = p12.getBags; //keyBags;
    xades.Application.setEngine("OpenSSL", crypto);
    pkijs.setEngine("OpenSSL", crypto, new pkijs.CryptoEngine({ name: "OpenSSL", crypto, subtle: crypto.subtle }));
    
    const keys = await GenerateKeys(alg);
    const cert = await CreateCertificate(commonName, keys, alg);

    var xmlString = '<player bats="left" id="10012" throws="right">\n\t<!-- Here\'s a comment -->\n\t<name>Alfonso Soriano</name>\n\t<position>2B</position>\n\t<team>New York Yankees</team>\n</player>';
    var xmlDoc = xades.Parse(xmlString);
    const xml = new xades.SignedXml(xmlDoc);

    // If you need custom data you can add it manually
    xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyId.Identifier.Qualifier = "OIDAsURI";
    xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyId.Identifier.Value = "my.uti.oid";
    xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyHash.DigestMethod.Algorithm = "SHA-1";
    xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyHash.DigestValue = new Uint8Array(20);


    const signature = await xadesXml.Sign(   // Signing document
        alg,                                    // algorithm
        key,                                    // key
        xml,                                    // document
        {                                       // options
            references: [
                { hash, transforms: ["c14n", "enveloped"] }
            ],
            policy: {
                hash,
                identifier: {
                    qualifier: "OIDAsURI",
                    value: "quilifier.uri",
                },
                qualifiers: [
                    {
                        noticeRef: {
                            organization: "MINISTERIO DE HACIENDA",
                            noticeNumbers: [1, 2, 3, 4, 5]
                        }
                    }
                ]
            },
            productionPlace: {
                country: "CR",
                state: "Marij El",
                city: "Yoshkar-Ola",
                code: "424000",
            },
            signingCertificate: x509
        });

    // append signature
    xml.documentElement.appendChild(signature.GetXml());

    // serialize XML
    const oSerializer = new XMLSerializer();
    const sXML = oSerializer.serializeToString(xml);
    console.log(sXML.toString())
}

main()
    .catch((err) => {
        console.error(err);
    });