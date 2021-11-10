var app = angular.module('wsAppTesting', ['ngAnimate']);


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
      /*  if (filtered.length > 20)
        {
            filtered = filtered.splice(20);
        }
        */
        return filtered;
    };
});



app.factory('socket', function ($rootScope) {
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
    
    var sockt = io.connect(webSocketUrl, {
        transports: ['websocket', 'polling'], query: {
            name: "ui-test",netsessionid: "public", clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af", clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a", email: "ratneshp@talentica.com", phone: "+918600147266"

        }
    });

    return {
        on: function (eName, callback) {
            sockt.on(eName, function (data) {
                var argus = data;
                $rootScope.$apply(function () {
                    callback(sockt, argus);
                });
            });
        },
        emit: function (eName, data, callback) {
            sockt.emit(eName, data, function (args) {
                var argus = args;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback(sockt, argus);
                    }
                });
            })
        }
    };
});



app.controller('MyCtrl', ['$scope', '$rootScope', '$http', '$filter', 'socket','$window', function ($scope, $rootScope, $http, $filter, socket, $window) {
    
  
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
$scope.tickerHistory = [];
$scope.orderBookBuyOrders = {};
$scope.orderBookSellOrders = {};
$scope.serverStats = {};

var getServerStats = function () {

host = window.location.host;


    $http({
        method: 'GET',
        headers: { clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af", clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" },
        url: "http://" + host + "/data/order/count"
    }).then(function successCallback(response) {
        $scope.serverStats.orderCount = response.data.result; 
    }, function errorCallback(response) {

    });

    $http({
    method: 'GET',
    headers: { clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af", clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" },
    url: "http://" + host + "/data/matchedpair/count"
    }).then(function successCallback(response) {
    $scope.serverStats.matchPairCount = response.data.result; 
    }, function errorCallback(response) {

    });

    $http({
    method: 'GET',
    headers: { clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af", clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" },
    url: "http://" + host + "/data/ticker/count?status=updated"
    }).then(function successCallback(response) {
    $scope.serverStats.tickerCount = response.data.result; 
    }, function errorCallback(response) {

    });


    $http({
    method: 'GET',
    headers: { clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af", clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" },
    url: "http://" + host + "/data/oneminutecandle/count"
    }).then(function successCallback(response) {
    $scope.serverStats.candleCount = response.data.result; 
    }, function errorCallback(response) {

    });

}

        
    setTimeout(function(){ 
   
    socket.emit('orderBookSell', {
    action: 'searchAll',
    headers: { clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af",clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" },
    message: { clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" ,sort: "price", order: "asc" , limit : "100", gt : "aggQty", gt_value: "0"}

    });

    socket.emit('orderBookBuy', {
    action: 'searchAll',
    headers: { clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af", clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" },
    message: { clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" ,sort: "price", order: "desc" , limit : "100", gt : "aggQty", gt_value: "0"}

    });

    socket.emit('matchedPair', {
    action: 'searchAll',
    headers: { clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af", clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" },
    message: { clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" ,sort: "createdDate", order: "desc" , limit : "100"}

    });


    socket.emit('ticker', {
    action: 'searchAll',
    headers: { clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af", clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" },
    message: { clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" ,sort: "_id", order: "desc" , limit : "1", status: "updated"}

    });


   
        
    }, 1000);

//setInterval(function(){ 
//console.log("Querying DataBase");
//    getServerStats();
//}, 10000);


    socket.on('matchedPair', function (skt, data) { 
        ///console.log("Matched Pair Recieved");
        if(!data.fill_price)
        {
            $scope.matchedPairs = data;
          
        }
        else{

        $scope.matchedPairs.push(data);
        $scope.matchedPairs = $filter('orderBy')($scope.matchedPairs, 'createdDate', true);

        if ($scope.matchedPairs.length > 10) {
            $scope.matchedPairs.pop();
        }
      
       // console.log("matchedPairs", $scope.matchedPairs);
        }

    });

    socket.on('ticker', function (skt, data) {  
      
       if (!data){
           return;
       }
       if (Array.isArray(data)) {
           if (data[0] && data[0].tickers && data[0].tickers.length) {
               let latestTickerIndex = data[0].tickers.length - 1
               $scope.ticker = data[0].tickers[latestTickerIndex];
               $scope.tickerHistory.push(data[0].tickers[latestTickerIndex]); 
               console.log($scope.tickerHistory);
           }
        }
        else{
           
           if (data && data.tickers && data.tickers.length) {
               let tickerIndex = data.tickers.length - 1;
               let ticker = data.tickers[tickerIndex];

               if (!$scope.ticker || $scope.ticker.sequence_id < ticker.sequence_id) {
                   $scope.ticker = ticker
                   $scope.tickerHistory.push(ticker);
                   $scope.tickerHistory = $filter('orderObjectBy')($scope.tickerHistory, 'price', false);
                   //console.log($scope.tickerHistory);
                   // $scope.$apply();
               }
           }
        }
    });

        /*
     socket.on('tradeServerState', function (skt,data) {
    	console.log('Latest tradeserverstate' + JSON.stringify(data));
          console.log("data",data);
         if(!data.topBuy)
         {
         console.log("data",data);
         $scope.tradeServerState = data[0];
       
         }
         else
         {

    	$scope.tradeServerState = data;
    	$scope.tradeServerState.topBuy = data.topBuy;
    	$scope.tradeServerState.topSell = data.topSell;
    	
         }
    });
        /
    

        /* OrderBook START */


  

   socket.on('orderBookBuy', function (skt, data) { 
       console.log("Matched Pair Recieved");
       if (!data) {
           return;
       }
           // console.log('Latest orderBookBuy message', data);
            if(Array.isArray(data))
            {
                data.forEach((element) => {
                $scope.orderBookBuyOrders[element.price] = element;  
            });
                 $scope.orderBookBuyOrdersArr = $filter('orderObjectBy')($scope.orderBookBuyOrders, 'price', true);
              
            }
            else
            {
            var price = data.price;

            if (data.incremental) {
                
                if ($scope.orderBookBuyOrders[price]) {
                    let extdata = $scope.orderBookBuyOrders[price];
                    data.aggQty = data.aggQty ? data.aggQty + extdata.aggQty : extdata.aggQty;
                    data.orderCount = data.orderCount ? data.orderCount + extdata.orderCount : extdata.orderCount;
                    
                   
                }
            }

            if (data.orderCount == 0 || data.orderCount == undefined || data.orderCount == null) {
                if ($scope.orderBookBuyOrders[price]) {
                     delete $scope.orderBookBuyOrders[price];
                      $scope.orderBookBuyOrdersArr = $filter('orderObjectBy')($scope.orderBookBuyOrders, 'price', true);
               
            } 
                }
                else {
               
                $scope.orderBookBuyOrders[price] = data;
                $scope.orderBookBuyOrdersArr = $filter('orderObjectBy')($scope.orderBookBuyOrders, 'price', true);
                
            }
             }

             });


      socket.on('orderBookSell', function (skt,data) {
            //console.log('Latest orderBookSell message' + JSON.stringify(data));
             if(!data.price)
            {
               
                data.forEach((element) => {
                $scope.orderBookSellOrders[element.price] = element;  
            });
                 $scope.orderBookSellOrdersArr = $filter('orderObjectBy')($scope.orderBookSellOrders, 'price', false);
                

            }
            else
            {

            var price = data.price;

            if (data.incremental) {

                if ($scope.orderBookSellOrders[price]) {
                    let extdata = $scope.orderBookSellOrders[price];
                    data.aggQty = data.aggQty ? data.aggQty + extdata.aggQty : extdata.aggQty ;
                    data.orderCount = data.orderCount ? data.orderCount + extdata.orderCount : extdata.orderCount;
                  
                }
            }

            if (data.orderCount == 0 || data.orderCount == undefined || data.orderCount == null) {
                
                if ($scope.orderBookSellOrders[price]) {
                    delete $scope.orderBookSellOrders[price];
                $scope.orderBookSellOrdersArr = $filter('orderObjectBy')($scope.orderBookSellOrders, 'price', false);
              
                }     
            } else {
               
                $scope.orderBookSellOrders[price] = data;
                 $scope.orderBookSellOrdersArr = $filter('orderObjectBy')($scope.orderBookSellOrders, 'price', false);
               
            }
            } 
        });

        /* OrderBook END */


}]);



