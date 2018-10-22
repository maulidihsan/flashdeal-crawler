const fs = require('fs');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const bukalapakCrawler = require('./crawler');
const port = process.env.PORT || 5001;

const server = new grpc.Server();
const SERVER_ADDRESS = `0.0.0.0:${port}`;
let proto = grpc.loadPackageDefinition(
  protoLoader.loadSync('proto/crawl.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })
);

const getPromo = (call, callback) => {
  bukalapakCrawler.run()
    .then(hasil => callback(null, { product: hasil }));
};

server.addService(proto.api.Promo.service, {
  getPromo: getPromo,
});
server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());
// if(process.env.NODE_ENV === 'production') {
//   server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createSsl(
//     fs.readFileSync('certs/Auth_Microservices.crt'), // CA
//     [
//       {
//         private_key: fs.readFileSync('certs/auth.services.key'),
//         cert_chain: fs.readFileSync('certs/auth.services.crt'),
//       }
//     ], // KeyPair
//     true, // checkClientCertificates
//   ));
// } else {
//   server.bind(SERVER_ADDRESS, grpc.ServerCredentials.createInsecure());
// }
server.start();