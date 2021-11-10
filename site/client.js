var app = angular.module('wsAppTesting', ['ui.grid', 'ui.grid.resizeColumns', 'ui.grid.edit', 'ui.grid.autoScroll']);


app.controller('MyCtrl', function ($scope, $http, $filter) {


    function getParam(name) {
        if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(window.location.search))
            return decodeURIComponent(name[1]);
        else
            return undefined;
    }

    $scope.displayClientPage = getParam("displaypage") == "true";

    $scope.orders = [];
    $scope.matchedOrders = [];
    $scope.gridOptions = {};
    $scope.gridOptions.columnDefs = [
        { name: 'createdDate' }
    ];



    var host = "http://rosacrypto.westindia.cloudapp.azure.com/";
  
    if (host == undefined) {
        host = window.location.host;
        console.log('Using default host', host);
    }
    console.log(' Host is ', host);

    var webSocketUrl = getParam('WEB_SOCKET_URL');

    if (webSocketUrl) {
        console.log('Using WEB_SOCKET_URL - ', webSocketUrl);
    } else {
        webSocketUrl = 'ws://' + host + '/';
        console.log('Using default websocketurl', webSocketUrl);
    }

    let clientid=window.localStorage.getItem("clientId");
    let clientsecrect=window.localStorage.getItem("clientsecrect");

    socket = io.connect(webSocketUrl, {
        transports: ['websocket', 'polling'], query: {
            name: "ui-test",
            clientSecert: clientsecrect,
            clientId: clientid
        }
    });

    
    socket_for_matchOrder=io.connect(webSocketUrl, {
        transports: ['websocket', 'polling'], query: {
            name: "ui-test", 
            clientSecert: clientsecrect,
            clientId: clientid
        }
    });


    $http({
        method: 'GET',
        headers: {  clientSecert: clientsecrect,
            clientId: clientid },
        url: 'http://' + host +'/data/session'
    }).then(function successCallback(response) {
        console.log("session received");
        $scope.sessions = response.data;

    }, function errorCallback(response) {
        console.log("session error");
    });

    


   
    socket.on('requestorderexchange', function (data) {
        console.log("Order Matcher stop requested now");
    });

    socket.on('order', function (data) {
        if(data.status === "created"){
            let cd = new Date(data.createdDate);
            let md = new Date(data.lastModifiedDate);
            data.createdDate = cd.toLocaleString();
            data.lastModifiedDate = md.toLocaleString();
            var selectedData = new Object();
            selectedData._id = data._id;
            selectedData.createdDate = data.createdDate;
            selectedData.lastModifiedDate = data.lastModifiedDate;
            selectedData.side = data.side;
            selectedData.price = data.price;
            selectedData.size = data.size;
            selectedData.status = data.status;
            selectedData.open_qty = data.open_qty;
            selectedData.asset = data.asset;

            $scope.orders.push(selectedData);
            $scope.$apply();
            //console.log("order placed",data);
            console.log("orders", $scope.orders);
            //socket.emit('my other event', { my: 'data' });
        }
        else {
            $scope.orders.forEach(function(element) {
                if(element._id === data._id){
                    element.status = data.status;
                    element.open_qty = data.open_qty; 
                }
            }, this);
            $scope.$apply();
        }
    });

    socket_for_matchOrder.on('matchedPair', function (data) {
        console.log(data);
        let cd = new Date(data.createdDate);
        let md = new Date(data.lastModifiedDate);
        data.createdDate = cd.toLocaleString();
        data.lastModifiedDate = md.toLocaleString();
        var usefulData = new Object();
        usefulData._id = data.trans_id;
        usefulData.createdDate = data.createdDate;
        usefulData.size = data.fill_qty;
        usefulData.price = data.fill_price;
        usefulData.inbound_id = data.inbound_order.order_id_;
        usefulData.inbound_open_qty = data.inbound_order.open_qty_;
        usefulData.inbound_side = data.inbound_order.is_buy_ ? "Buy" : "Sell";
        usefulData.matched_order_id = data.matched_order.order_id_;
        usefulData.matched_order_open_qty = data.matched_order.open_qty_;
        usefulData.matched_order_side = data.matched_order.is_buy_ ? "Buy" : "Sell";

        $scope.matchedOrders.push(usefulData);
        $scope.$apply();


        //console.log("matched order" ,data);
        console.log("matched orders", $scope.matchedOrders);
        //socket.emit('my other event', { my: 'data' });
    });

    socket.on('order_ready_for_settlement', function (data) {
        console.log("order_ready_for_settlement > ", data);
    });
    let count = 0;
    let orderId = 0;
    function randomIntFromInterval(min, max) {
        return (Math.random() * (max - min) + min).toFixed(4);
    }
    function randomUserId() {
        return "000" + Math.ceil(Math.random() * 4);
    }

    $scope.sendOrder = function () {
        console.log("sending socket request")
        socket.emit('recievedorder', {
            action: 'post',
            headers: {  clientSecert: clientsecrect,
            clientId: clientid },
            message: { side: $scope.isbuy === "true" ? "buy" : "sell", price: $scope.price, size: $scope.qty, "name": "order" + orderId, status: "created", asset: "BTC", currency: "INR", userId:"1", product_id: "59e48756e5cf8e0c9471ef56", zebOrderId: "zeb_" + orderId, order_type:"limit" }

        });
        orderId++;
    };
    $scope.cleanUp = function () {
        $scope.cleanUpLog = "In Progress";
        $http({
            method: 'POST',
            headers: {  clientSecert: clientsecrect,
            clientId: clientid },
            url: 'http://' + host + '/data/tradeServerState/action/doInitAndCleanDB',
            data: { "testsessionid": "123a", "NumOfOrders": 0 }
        }).then(function successCallback(response) {
            console.log("CleanUp Done");
            $scope.cleanUpLog = "Done";

        }, function errorCallback(response) {
            console.log("session error");
        });

    }

    $scope.sendBulkOrder = function () {

       // for (var i = 0; i <= 10; i++) {
            count++;
            let isbuy = (count % 2 == 0) ? "buy" : "sell";
           
            socket.emit('recievedorder', {
                action: 'post',
                headers: {  clientSecert: clientsecrect,
            clientId: clientid },
                message: { side: isbuy, price: randomIntFromInterval(4400.0000, 4800.0000), size: randomIntFromInterval(0.01000, 5.0000), "name": "order" + count, status: "created", asset: "BTC", currency: "INR", userId: randomUserId(), product_id: "59e48756e5cf8e0c9471ef56", zebOrderId: "zeb_" + count, order_type: "limit" }
            });
       //}
    }

    $scope.requestStop = function () {
        socket.emit('requestorderexchange', { action: 'bulkPost', message: [{ stop: "true" }] });
    };
});