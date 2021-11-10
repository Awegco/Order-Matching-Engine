'use strict';

var app = angular.module('wsAppTesting', ['ngWebsocket']);
app.controller('MyCtrl', function ($websocket) {
   
    socket = io.connect('http://localhost:9999/', {transports:['websocket']});
    console.log(socket);
    socket.on('order', function (data) {
        console.log("order placed",data);
        //socket.emit('my other event', { my: 'data' });
    });
    
    socket.on('matchedorder', function (data) {
        console.log("matched order" ,data);
        //socket.emit('my other event', { my: 'data' });
    });
    let count = 0;
    document.querySelector('#send').addEventListener('click', function (event) {
        for (i = 0; i <= 1000; i++) {
            count++;
            let isbuy=false
            if (count % 2 == 0) {
                isbuy = true;
            }
            socket.emit('order', { action: 'bulkPost', message: [{ is_buy: isbuy, price: 12, qty: 2, "name": "order" + count, status: "created" }] });
            
        }
    });
    

});