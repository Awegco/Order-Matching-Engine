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

socket.on('order', function (data) {
    console.log('Latest order -- > ');
    console.log(data);
});

socket.on('matchedPair', function (data) {
    console.log('Latest matchedPair -- > ');
    console.log(data);
});


socket.on('orderBookSell', function (data) {
    console.log('Latest orderBookSell -- > ');
    console.log(data);
});

socket.on('orderBookBuy', function (data) {
    console.log('Latest orderBookSell -- > ');
    console.log(data);
});

socket.on('ticker', function (data) {
    console.log('Latest ticker -- > ');
    console.log(data);
});


socket.on('oneMinuteCandle', function (data) {
    console.log('Latest candle -- > ');
    console.log(data);
});
