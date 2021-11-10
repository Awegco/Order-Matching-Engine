const WebSocket = require('ws');
var request = require('request');
var io = require('socket.io-client');
// const ws = new WebSocket('wss://stream-internal.wazirx.com/stream');

// ws.on('open', function open() {
//   ws.send('something');
// });

// ws.on('message', function incoming(message) {
//   console.log('received: %s', JSON.stringify(JSON.parse(message)));
// });

const url = "https://api.wazirx.com/api/v2/trades?market=btcinr&side=1&limit=5"

const webSocketUrl="http://rosacrypto.westindia.cloudapp.azure.com/";
socket = io.connect(webSocketUrl, {
  transports: ['websocket', 'polling'], query: {
      name: "ui-test", netsessionid: "abc123", email: "ratneshp@talentica.com", phone: "+918600147266"
  }
});

var count=0;
var lastprice=0;

setInterval(function () {

  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
        console.log(body) // Print the google web page.
        body=JSON.parse(body);
        body=body.filter(x=>x.price!=lastprice)
        const orderpre=body && body[0];
        if(orderpre){
          count+=1;
          console.log("original order");
          console.log(orderpre);
          console.log("emitting order");
          lastprice=orderpre.price;
          const msg={ side: count %2 == 0 ? "buy" : "sell", 
          
          price: orderpre.price, size: orderpre.volume, "name": "order" + orderpre.id, status: "created", asset: "BTC", 
          currency: "INR", userId:"1", product_id: "59e48756e5cf8e0c9471ef56", zebOrderId: "zeb_" + orderpre.id, order_type:"limit" };
          console.log(msg);
          request.post({ method:'POST',url:"http://rosacrypto.westindia.cloudapp.azure.com/data/recievedorder/", json: msg,headers:{ clientId: "YOUR CLIENTID",clientsecret:"YOUR CLIENTSECRET"}},
          function (error, response, body) {
              if (!error && response.statusCode == 200) {
                  console.log(body);
              }
              else
              {
                console.log(error)
              }
          });
        //   socket.emit('recievedorder', {
        //     action: 'post',
        //     headers: { netsessionid: "abc123" },
        //     message: msg
  
        // });
  
        }
     }
  })



  // const https = require('https')
  // const options = {
  //   hostname: 'api.wazirx.com',
  //   port: 443,
  //   path: '/api/v2/trades?market=btcinr&side=1&limit=1',
  //   method: 'GET'
  // }

  // const req = https.request(options, res => {
  //   console.log(`statusCode: ${res.statusCode}`)

  //   res.on('data', d => {
  //     process.stdout.write(d);
  //     const orderpre=d && d[0];
  //     if(orderpre){
  //       count+=1;
  //       console.log("original order");
  //       console.log(orderpre);
  //       console.log("emitting order");
  //       const msg={ side: count %2 == 0 ? "buy" : "sell", 
  //       price: orderpre.price, size: orderpre.volume, "name": "order" + orderpre.id, status: "created", asset: "BTC", 
  //       currency: "INR", userId:"1", product_id: "59e48756e5cf8e0c9471ef56", zebOrderId: "zeb_" + orderpre.id, order_type:"limit" };
  //       console.log(msg);
  //       socket.emit('recievedorder', {
  //         action: 'post',
  //         headers: { netsessionid: "abc123" },
  //         message: msg

  //     });

  //     }
  //   })
  // })

  // req.on('error', error => {
  //   console.error(error)
  // })

  // req.end()

}, 1000)