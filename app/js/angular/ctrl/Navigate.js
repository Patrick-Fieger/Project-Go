var Navigate = ['$scope', '$http', 'MessageService', '$state', 'geolocation','$rootScope','$location','$timeout',
    function($scope, $http, MessageService, $state, geolocation, $rootScope,$location,$timeout) {
        $scope.currentLocation;
        $scope.lesen = false;
        $scope.messages = [];
        $scope.href_;
        $scope.nearest = 10;
        $scope.initDistance = false

        var ready = false,
            compass,
            bearing = [],
            circle = 40;

        Compass.watch(function(heading) {
            compass = heading;
        });

        function setCurrentGeo(withmessage) {
            geolocation.getLocation({
                enableHighAccuracy: true
            }).then(function(data) {
                // if(data.coords.accuracy < 15) circle = 15
                // else circle = data.coords.accuracy
                $scope.currentLocation = new LatLon(data.coords.latitude, data.coords.longitude);
                $scope.currentLocation = new LatLon(49.90213473797767, 8.857207540430920);
                
                if (withmessage) {
                    MessageService.getNearestMessagesByLocation($scope.currentLocation).success(loadMessages);
                }
            });
        }

        function loadMessages(data, status, headers, config) {
            $scope.messages = [];
            console.log(data)
            var count = 0;
            for (var i = 0; i < data.length; i++) {
                MessageService.getMessageById(data[i]).success(function(data, status, headers, config) {
                    var dataholder = data;
                    dataholder.distance = $scope.currentLocation.distanceTo(new LatLon(dataholder.position[0], dataholder.position[1]))
                    $scope.messages.push(dataholder);
                    count++
                    if (count == 3) {
                        ready = true;
                    }
                });
            };
        }
        
        function showMessageIfNear(){
            var count = 0;
            var getsmalest = [];
            var allmessages = [[,],[,],[,]]
            for (var i = 0; i < $scope.messages.length; i++) {
                getsmalest.push($scope.messages[i].distance);
                allmessages[i][0] = $scope.messages[i].distance
                allmessages[i][1] = $scope.messages[i].id
            }

            $timeout(function(){
                $scope.lesen = true;
            },4000)
            $scope.href_ = "b8c14ef9-72f2-4af8-9475-1b6d9d388f5c";
            $rootScope.samePlace = [49.90213473797767,8.857207540430927];
            $rootScope.samePlaceTitle = "Wohntürme sollen abgerissen werden";

            // getsmalest.sort();

            // for (var i = 0; i < allmessages.length; i++) {
            //     if(allmessages[i][0] == getsmalest[0] && (allmessages[i][0] * 1000) < parseInt(circle)){
            //         count++;
            //         $scope.lesen = true;
            //         $scope.href_ = allmessages[i][1];
                    

            //         for (var n = 0; n < $scope.messages.length; n++) {
            //             if(allmessages[i][1] == $scope.messages[n].id){
            //                 $rootScope.samePlace = $scope.messages[n].position;
            //                 $rootScope.samePlaceTitle = $scope.messages[n].title;
            //             }
            //         };
            //     }


            //     if(i == allmessages.length-1){
            //         if(count==0){
            //             $scope.lesen = false;
            //         }
            //     }
            // };
        }
        
        function calculateDistanceAndBearing() {
            if (ready) {
                bearing = [];
                var rotade = 360 - compass;
                var smallest = [];
                var forFullClass = [[,],[,],[,]];

                $(".compass").css({
                    "transform": "rotate(" + rotade + "deg)"
                });
                for (var i = 0; i < $scope.messages.length; i++) {
                    $scope.messages[i].distance = $scope.currentLocation.distanceTo(new LatLon($scope.messages[i].position[0], $scope.messages[i].position[1]));
                    smallest.push($scope.messages[i].distance);
                    forFullClass[i][0] = $scope.messages[i].distance;
                    forFullClass[i][1] = $scope.messages[i].id;

                    bearing[i] = 0 + $scope.currentLocation.bearingTo(new LatLon($scope.messages[i].position[0], $scope.messages[i].position[1]))
                };
                smallest.sort();
                $scope.nearest = smallest[0];

                for (var i = 0; i < forFullClass.length; i++) {
                    if(forFullClass[i][0] == smallest[0]){
                        $('#'+forFullClass[i][1]).addClass('full')
                    }
                };

                $scope.initDistance = true

                $("#" + $scope.messages[0].id).css({
                    "transform": "rotate(" + bearing[0] + "deg)"
                });
                $("#" + $scope.messages[0].id + ' p').css({
                    "transform": "rotate(" + -(rotade + bearing[0]) + "deg)"
                });
                $("#" + $scope.messages[1].id).css({
                    "transform": "rotate(" + bearing[1] + "deg)"
                });
                $("#" + $scope.messages[1].id + ' p').css({
                    "transform": "rotate(" + -(rotade + bearing[1]) + "deg)"
                });
                $("#" + $scope.messages[2].id).css({
                    "transform": "rotate(" + bearing[2] + "deg)"
                });
                $("#" + $scope.messages[2].id + ' p').css({
                    "transform": "rotate(" + -(rotade + bearing[2]) + "deg)"
                });
                showMessageIfNear();
            }
        }
        setCurrentGeo(true);
        setInterval(function() {
            setCurrentGeo(false);
            calculateDistanceAndBearing();
        }, 100);


        $scope.logout = function(){
            $location.path('/login');
            localStorage.removeItem('user');
        }

    }
];