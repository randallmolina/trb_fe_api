const fs = require("fs");
const WebCrypto = require("node-webcrypto-ossl");
const xadesjs = require("xadesjs");
const { XMLSerializer } = require("xmldom-alpha");

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

async function main() {
    const hash = "SHA-256"
    const alg = {
        name: "RSASSA-PKCS1-v1_5",
        hash,
    }

    // Read cert
    const certPem = fs.readFileSync("cert.pem", { encoding: "utf8" });
    const certDer = pem2der(certPem);

    // Read key
    const keyPem = fs.readFileSync("key.pem", { encoding: "utf8" });
    const keyDer = pem2der(keyPem);
    const key = await crypto.subtle.importKey("pkcs8", keyDer, alg, false, ["sign"]);

    // XAdES-EPES
    var xmlString = `<Test><Document attr="Hello"/></Test>`;
    var xml = xadesjs.Parse(xmlString);

    var xadesXml = new xadesjs.SignedXml();
    const x509 = preparePem(certPem);
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
                            organization: "PeculiarVentures",
                            noticeNumbers: [1, 2, 3, 4, 5]
                        }
                    }
                ]
            },
            productionPlace: {
                country: "Russia",
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