//@ts-check

const asn1js = require("asn1js");
const fs = require("fs");
//const pkijs = require("pkijs");
const xades = require("xadesjs");
const xmldsig = require("xmldsigjs");
const CryptoOSSL = require("node-webcrypto-ossl");
const crypto = new CryptoOSSL();

const commonName = "Test self-signed certificate";
const alg = {
    name: "RSASSA-PKCS1-v1_5",
    hash: { name: "SHA-256" },
    publicExponent: new Uint8Array([1, 0, 1]),
    modulusLength: 2048,
};
/*
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
*/
/*
async function GenerateKeys(alg) {
    return await crypto.subtle.generateKey(alg, false, ["sign", "verify"]);
}
*/

async function main() {
    // set crypto engine
    xades.Application.setEngine("OpenSSL", crypto);

    // **pkijs.setEngine("OpenSSL", crypto, new pkijs.CryptoEngine({ name: "OpenSSL", crypto, subtle: crypto.subtle }));
    

    const keys = '3003'; //** await GenerateKeys(alg);
    const cert =   fs.readFileSync("020460059301_JoseAlonso.p12", { encoding: "utf8" });  //**await CreateCertificate(commonName, keys, alg);

    var xmlString = '<player bats="left" id="10012" throws="right">\n\t<!-- Here\'s a comment -->\n\t<name>Alfonso Soriano</name>\n\t<position>2B</position>\n\t<team>New York Yankees</team>\n</player>';
    var xmlDoc = xades.Parse(xmlString);
    const xml = new xades.SignedXml(xmlDoc);

    // If you need custom data you can add it manually
    xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyId.Identifier.Qualifier = "OIDAsURI";
    xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyId.Identifier.Value = "my.uti.oid";
    xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyHash.DigestMethod.Algorithm = "SHA-1";
    xml.SignedProperties.SignedSignatureProperties.SignaturePolicyIdentifier.SignaturePolicyId.SigPolicyHash.DigestValue = new Uint8Array(20);

    const signedXml = await xml.Sign(               // Signing document 
        alg,                              // algorithm  
        keys.privateKey,                        // key  
        xmlDoc,                                 // document 
        {                                       // options 
            keyValue: keys.publicKey,
            x509: [cert],
            signingCertificate: cert,
            references: [
                { hash: "SHA-256", transforms: ["enveloped"] }
            ],
            productionPlace: {
                country: "Country",
                state: "State",
                city: "City",
                code: "Code",
            },
            signerRole: {
                claimed: ["Some role"]
            }
        }
    );
        
    console.log(signedXml.toString());
}

main()
    .catch((err) => {
        console.log(err);
    })