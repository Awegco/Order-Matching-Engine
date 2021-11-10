var app = angular.module('wsAppTesting', ['ui.grid', 'ui.grid.resizeColumns', 'ui.grid.edit']);


app.controller('MyCtrl', function ($scope, $http) {

    
    function getParam(name) {
        if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(window.location.search))
            return decodeURIComponent(name[1]);
        else
            return undefined;
    }

    var host = getParam('HOST');
    
    if (host == undefined) {
        host = window.location.host;
        console.log('Using default host', host);
    }

    console.log(' Host is ', host);
    var query = window.location.search.substring(1);
    var env = query.split("=");
    

    var webSocketUrl = getParam('WEB_SOCKET_URL');

    if (webSocketUrl) {
        console.log('Using WEB_SOCKET_URL - ', webSocketUrl);
    } else {
        webSocketUrl = 'ws://' + host + '/';
        console.log('Using default websocketurl', webSocketUrl);
    }
   
    let socket = io.connect(webSocketUrl, {
        transports: ['websocket', 'polling'], query: {
            name: "ui-test",
            clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af",
            clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a",
             email: "ratneshp@talentica.com", phone: "+918600147266"
        }
    });


    socket.on('requestorderexchange', function (data) {
        console.log(data);
        if (data.stop)
            $scope.isOMRunning = false;
        $scope.$apply();
    });


    $scope.saveclient = function () {
       let clientid=$scope.clientid;
       let clientsecrect=$scope.clientsecrect;
       window.localStorage.setItem("clientId", clientid);
       window.localStorage.setItem("clientsecrect", clientsecrect);
    };

  

    $scope.requestStop = function () {
        let clientid=window.localStorage.getItem("clientId");
        let clientsecrect=window.localStorage.getItem("clientsecrect");
        socket.emit('requestorderexchange', { action: 'bulkPost', headers: { clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af", clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" },  message: [{ stop: "true" }] });
       
    };

    $scope.requestStart = function () {
        let clientid=window.localStorage.getItem("clientId");
        let clientsecrect=window.localStorage.getItem("clientsecrect");
        //socket.emit('requestorderexchange', { action: 'bulkPost', headers: { clientSecert: "0a160529cc681f086572e846939c9471d96def8a0c5e8015f0e01d6d7f07e6af", clientId: "7bac7d45-5138-47d9-8a60-f99f7aa1964a" },  message: [{ stop: "true" }] });

        $http({
            method: 'POST',
            headers: { clientSecert: clientsecrect, clientId: clientid },
            url: 'http://' + host +'/data/tradeServerState/action/doChangeTradeServerState',
            data: {
                "params":{
             "clientId":clientid,
                    "status" : "start"
                }
             }
        }).then(function successCallback(response) {
            console.log("session received");
            $scope.sessions = response.data;
    
        }, function errorCallback(response) {
            console.log("session error");
        });
       
    };


   


});