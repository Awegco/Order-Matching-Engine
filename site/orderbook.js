var app = angular.module('wsAppTesting', []);


app.filter('orderObjectBy', function () {
    return function (items, field, reverse) {
        var filtered = [];
        angular.forEach(items, function (item) {
            filtered.push(item);
        });
        filtered.sort(function (a, b) {
            if (a[field] > b[field]) return 1;
            if (a[field] < b[field]) return -1;
            return 0;
        });
        if (reverse) filtered.reverse();
        return filtered;
    };
});

app.controller('MyCtrl', function ($scope, $http, $filter) {

    //var host = getParam('HOST');
    //console.log(' Host is ', host);
    var host = undefined;
    if (host == undefined) {
        host = window.location.host;
    }
    var webSocketUrl = undefined;
    // var webSocketUrl = getParam('WEB_SOCKET_URL');


    if (webSocketUrl) {
        console.log('Using WEB_SOCKET_URL - ', webSocketUrl);
    } else {
        webSocketUrl = 'ws://' + host + '/';
    }
    let clientid=window.localStorage.getItem("clientId");
    let clientsecrect=window.localStorage.getItem("clientsecrect");

    socket = io.connect(webSocketUrl, {
        transports: ['websocket', 'polling'], query: {
            name: "ui-test",  clientSecert: clientsecrect,
            clientId: clientid

        }
    });


    var findAndRemove = function (arr, id) {
        var modified_arr = [];
        arr.forEach((element) => {
            if (!(element._id === id)) {
                modified_arr.push(element);
            }
        });
        return modified_arr;
    }

    var findAndUpdate = function (arr, id, open_qty) {

        var modified_arr = [];
        arr.forEach((element) => {
            if (element._id === id) {
                element.open_qty = open_qty;
                modified_arr.push(element);
            } else {
                modified_arr.push(element);
            }
        });
        return modified_arr;
    }


    $scope.buyOrders = [];
    $scope.sellOrders = [];
    $scope.matchedOrders = [];
    $scope.matchedPairs = [];
    $scope.orderBookBuyOrders = {};
    $scope.orderBookSellOrders = {};


    $http({
        method: 'GET',
        headers: {  clientSecert: clientsecrect,
            clientId: clientid },
        url: "http://" + host + "/data/order/searchAll?status=created&status=partialmatched&side=buy&sort=price&order=desc&limit=10"
    }).then(function successCallback(response) {
        $scope.buyOrders = response.data;
        $scope.buyOrders = $filter('orderBy')($scope.buyOrders, 'price', true);
        $scope.buyOrders = $scope.buyOrders.slice(0, 10);
    }, function errorCallback(response) {

    });

    $http({
        method: 'GET',
        headers: {  clientSecert: clientsecrect,
            clientId: clientid },
        url: "http://" + host + "/data/order/searchAll?status=created&status=partialmatched&side=sell&sort=price&order=asc&limit=10"
    }).then(function successCallback(response) {
        $scope.sellOrders = response.data;
        $scope.sellOrders = $scope.sellOrders.slice(0, 10);
    }, function errorCallback(response) {

    });


    $http({
        method: 'GET',
        headers: {  clientSecert: clientsecrect,
            clientId: clientid },
        url: "http://" + host + "/data/matchedorder"
    }).then(function successCallback(response) {
        $scope.matchedOrders = response.data;
        $scope.matchedOrders = $filter('orderBy')($scope.matchedOrders, 'createdDate', true);
        $scope.matchedOrders = $scope.matchedOrders.slice(0, 10);
    }, function errorCallback(response) {

    });

    $http({
        method: 'GET',
        headers: {  clientSecert: clientsecrect,
            clientId: clientid },
        url: "http://" + host + "/data/matchedPair/searchAll?sort=createdDate&order=desc&limit=10"
    }).then(function successCallback(response) {
        $scope.matchedPairs = response.data;
    }, function errorCallback(response) {

    });

    $http({
        method: 'GET',
        headers: {  clientSecert: clientsecrect,
            clientId: clientid},
        url: "/data/tradeserverstate/searchAll?sort=_id&order=desc&limit=1"
    }).then(function successCallback(response) {
        $scope.tradeServerState = response.data[0];
    }, function errorCallback(response) {

    });


    console.log(socket);



    /*
    socket.on('matchedorder', function (data) {
        
        $scope.matchedOrders.push(data);
        
        if ($scope.matchedOrders.length > 10)
            $scope.matchedOrders.pop();
        
        if (data.is_buy_) {
            $scope.buyOrders = findAndRemove($scope.buyOrders, data.order_id_, data.match);
        }
        if (!data.is_buy_) {
            $scope.sellOrders = findAndRemove($scope.sellOrders,data.order_id_);  
        }

        $scope.$apply();

        //console.log("matched orders", $scope.matchedOrders);
    });
    */

    socket.on('matchedPair', function (data) {

        $scope.matchedPairs.push(data);
        $scope.matchedPairs = $filter('orderBy')($scope.matchedPairs, 'createdDate', true);

        if ($scope.matchedPairs.length > 10) {
            $scope.matchedPairs.pop();
        }
        $scope.$apply();
        console.log("matchedPairs", $scope.matchedPairs);
    });

    socket.on('order', function (data) {

        if (data.status == "created") {

            if (data.side == "buy") {
                $scope.buyOrders.push(data);
                $scope.buyOrders = $filter('orderBy')($scope.buyOrders, 'price', true);
                if ($scope.buyOrders.length > 10)
                    $scope.buyOrders.pop();
                $scope.$apply();

                console.log("orders", $scope.buyOrders);
            }
            if (data.side == "sell") {
                $scope.sellOrders.push(data);
                $scope.sellOrders = $filter('orderBy')($scope.sellOrders, 'price', false);
                if ($scope.sellOrders.length > 10)
                    $scope.sellOrders.pop();
                $scope.$apply();
                console.log("orders", $scope.sellOrders);
            }

        } else if (data.status == "partialmatched") {
            if (data.side == "buy") {
                $scope.buyOrders = findAndUpdate($scope.buyOrders, data._id, data.open_qty);
            }
            if (data.side == "sell") {
                $scope.sellOrders = findAndUpdate($scope.sellOrders, data._id, data.open_qty);
            }
            $scope.$apply();
        } else if (data.status == "matched" || data.status == "cancelled") {
            if (data.side == "buy") {
                $scope.buyOrders = findAndRemove($scope.buyOrders, data._id);
            }
            if (data.side == "sell") {
                $scope.sellOrders = findAndRemove($scope.sellOrders, data._id);
            }
            $scope.$apply();
        }


    });

    socket.on('tradeServerState', function (data) {
        console.log('Latest tradeserverstate' + JSON.stringify(data));
        $scope.tradeServerState = data;
        //$scope.tradeServerState.topBuy = data.topBuy;
        //$scope.tradeServerState.topSell = data.topSell;
        $scope.$apply();
    });


    /* OrderBook START */
    let refreshOrderBookSell = function () {
        $http({
            method: 'GET',
            headers: {  clientSecert: clientsecrect,
            clientId: clientid },
            url: "http://" + host + "/data/orderBookSell/searchAll?sort=price&order=asc&limit=10&gt=aggQty&gt_value=0"
        }).then(function successCallback(response) {
            response.data.forEach((element) => {
                $scope.orderBookSellOrders[element.price] = element;
            });

            $scope.orderBookSellOrdersArr = $filter('orderObjectBy')($scope.orderBookSellOrders, 'price', false);
        }, function errorCallback(response) {

        });
    }

    let refreshOrderBookBuy = function () {
        $http({
            method: 'GET',
            headers: {  clientSecert: clientsecrect,
            clientId: clientid },
            url: "http://" + host + "/data/orderBookBuy/searchAll?sort=price&order=desc&limit=10&gt=aggQty&gt_value=0"
        }).then(function successCallback(response) {
            response.data.forEach((element) => {
                $scope.orderBookBuyOrders[element.price] = element;
            });

            $scope.orderBookBuyOrdersArr = $filter('orderObjectBy')($scope.orderBookBuyOrders, 'price', true);

        }, function errorCallback(response) {

        });
    }

    refreshOrderBookBuy();
    refreshOrderBookSell();

  


    socket.on('orderBookBuy', function (data) {
        //console.log('Latest orderBookBuy message' + JSON.stringify(data));
        var price = data.price;

        if (data.incremental) {

            if ($scope.orderBookBuyOrders[price]) {
                let extdata = $scope.orderBookBuyOrders[price];
                data.aggQty = data.aggQty ? data.aggQty + extdata.aggQty : extdata.aggQty;
                data.orderCount = data.orderCount ? data.orderCount + extdata.orderCount : extdata.orderCount;


            }
        }

        if (data.orderCount == undefined || data.orderCount == null || data.orderCount <= 0) {
            if ($scope.orderBookBuyOrders[price]) {
                delete $scope.orderBookBuyOrders[price];
                
                $scope.orderBookBuyOrdersArr = $filter('orderObjectBy')($scope.orderBookBuyOrders, 'price', true);
                $scope.$apply();
            }
        }
        else {

            $scope.orderBookBuyOrders[price] = data;
           
            $scope.orderBookBuyOrdersArr = $filter('orderObjectBy')($scope.orderBookBuyOrders, 'price', true);
            $scope.orderBookBuyOrdersArr.forEach((element) => {
                if (element.aggQty <= 0 || element.orderCount <= 0)
                    refreshOrderBookBuy();
            });
            $scope.$apply();
        }

    });


    socket.on('orderBookSell', function (data) {
        //console.log('Latest orderBookSell message' + JSON.stringify(data));

        var price = data.price;
        
        if (data.incremental) {

            if ($scope.orderBookSellOrders[price]) {
                let extdata = $scope.orderBookSellOrders[price];
                data.aggQty = data.aggQty ? data.aggQty + extdata.aggQty : extdata.aggQty;
                data.orderCount = data.orderCount ? data.orderCount + extdata.orderCount : extdata.orderCount;

            }
        }

        if (data.orderCount == undefined || data.orderCount == null || data.orderCount <= 0) {

            if ($scope.orderBookSellOrders[price]) {
                delete $scope.orderBookSellOrders[price];
               
                $scope.orderBookSellOrdersArr = $filter('orderObjectBy')($scope.orderBookSellOrders, 'price', false);
                $scope.$apply();
            }
        } else {

            $scope.orderBookSellOrders[price] = data;
           
            $scope.orderBookSellOrdersArr = $filter('orderObjectBy')($scope.orderBookSellOrders, 'price', false);
            $scope.orderBookSellOrdersArr.forEach((element) => {
                if (element.aggQty <= 0 || element.orderCount <= 0)
                    refreshOrderBookSell();
            });
            $scope.$apply();
        }

    });


    /* OrderBook END */


});



