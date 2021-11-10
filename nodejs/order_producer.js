var io = require('socket.io-client');


var socket;

const clientsecrect="YOUR_CLIENT_SECRET";
const clientId="YOUR_CLIENTID";

socket = io("http://rosacrypto.westindia.cloudapp.azure.com/",
    {
        transports: ['websocket', 'polling'],
        'pingInterval': 2000,
        'pingTimeout': 5000,
        query: {
            name: "marketwatcher", clientSecert: clientsecrect, clientId: clientId, 
        }
    });

//change side
//change zebOrderId as per your
socket.emit('recievedorder', {
    action: 'post',
    headers: {  clientSecert: clientsecrect,
    clientId: clientid },
    message: { side:  "buy" 
    , price: $scope.price, size: $scope.qty, "name": "order" + orderId, status: "created", asset: "BTC", currency: "INR", userId:"1", 
      product_id: "59e48756e5cf8e0c9471ef56", zebOrderId: "zeb_" + orderId, order_type:"limit" }

});

socket.on('orderBookSell', function (data) {
    console.log('Latest orderBookSell -- > ');
    console.log(data);
});

socket.on('ticker', function (data) {
    console.log('Latest orderBookSell -- > ');
    console.log(data);
});
