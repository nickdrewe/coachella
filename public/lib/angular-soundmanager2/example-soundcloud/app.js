angular.module('myApp', ['angularSoundManager']).controller('MainCtrl', ['$scope',
    function($scope) {
        $scope.songs = [];
        
        SC.initialize({
            client_id: "e1c2a174e148e7f9ef62cb7116c1c5fe"
        });
        
        // https://soundcloud.com/emzlogz/sets/coachella-2015
        // curl -v 'http://api.soundcloud.com/resolve.json?url=https://soundcloud.com/emzlogz/sets/coachella-2015&client_id=e1c2a174e148e7f9ef62cb7116c1c5fe'
        SC.get("/playlists/72999862/tracks", {
            limit: 5
        }, function(tracks) {
            for (var i = 0; i < tracks.length; i ++) {
                SC.stream( '/tracks/' + tracks[i].id, function( sm_object ){
                    var track = {
                        id: tracks[i].id,
                        title: tracks[i].title,
                        artist: tracks[i].genre,
                        url: sm_object.url
                    };
                    
                    $scope.$apply(function () {
                        $scope.songs.push(track);
                    });
                });
            }         
        });
    }
]);
