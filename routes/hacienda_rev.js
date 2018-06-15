var qs = require("querystring");
var http = require("https");

var options = {
  "method": "POST",
  "hostname": [
    "idp",
    "comprobanteselectronicos",
    "go",
    "cr"
  ],
  "path": [
    "auth",
    "realms",
    "rut-stag",
    "protocol",
    "openid-connect",
    "token"
  ],
  "headers": {
    "grant_type": "password&client_id=api-stag&username=cpj-3-101-261506%40stag.comprobanteselectronicos.go.cr&password=W%24%2FJX%2FAS%40K%29%3B1%5DI%3Bu%7C%2B6",
    "Content-Type": "application/x-www-form-urlencoded"
  }
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.write(qs.stringify({ 
  grant_type: 'password',
  username: 'cpf-02-0460-0593@stag.comprobanteselectronicos.go.cr',
  password: ']g@Z$6&M;+e7$bP2;_#p',
  client_id: 'api-stag' }));
req.end();

var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://idp.comprobanteselectronicos.go.cr/auth/realms/rut-stag/protocol/openid-connect/token",
  "method": "POST",
  "headers": {
    "grant_type": "password&client_id=api-stag&username=cpj-3-101-261506%40stag.comprobanteselectronicos.go.cr&password=W%24%2FJX%2FAS%40K%29%3B1%5DI%3Bu%7C%2B6",
    "Content-Type": "application/x-www-form-urlencoded"
  },
  "data": {
    "grant_type": "password",
    "username": "cpf-02-0460-0593@stag.comprobanteselectronicos.go.cr",
    "password": "]g@Z$6&M;+e7$bP2;_#p",
    "client_id": "api-stag"
  }
}

$.ajax(settings).done(function (response) {
  console.log(response);
});