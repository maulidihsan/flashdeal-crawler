const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');
const fs = require('fs');

const port = process.env.PORT || 5001;
const REMOTE_SERVER = `0.0.0.0:${port}`;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const proto = grpc.loadPackageDefinition(
  protoLoader.loadSync('proto/crawl.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  })
);
const client = new proto.api.Promo(
  REMOTE_SERVER,
  grpc.credentials.createInsecure(),
);
// if(process.env.NODE_ENV === 'production') {
//   client = new proto.api.Promo(
//     REMOTE_SERVER,
//     grpc.credentials.createSsl(
//       fs.readFileSync('certs/Auth_Microservices.crt'), // CA
//       fs.readFileSync('certs/client-1.key'), // Private Key
//       fs.readFileSync('certs/client-1.crt'), // Cert Chain
//     ),
//     {
//       'grpc.ssl_target_name_override' : 'auth.services',
//       'grpc.default_authority': 'auth.services',
//     },
//   );
// } else {
  
// }
client.getPromo({}, (err, result) => {
    if(err) {
        console.log(err);
    } else {
        console.log(result);
    }
});

