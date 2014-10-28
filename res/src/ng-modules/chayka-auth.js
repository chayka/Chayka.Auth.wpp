'use strict';

angular.module('chayka-auth', ['chayka-forms', 'chayka-modals'])
    .controller('form', ['$scope', function($scope){
        $scope.screen = '';

        $scope.showScreen = function(screen){
            $scope.screen = screen;
        }
    }])
    .controller('join', ['$scope', '$http', function($scope, $http){

    }])
    .controller('login', ['$scope', '$http', function($scope, $http){

    }])
    .controller('logout', ['$scope', '$http', function($scope, $http){

    }])
    .controller('password-forgot', ['$scope', '$http', function($scope, $http){

    }])
    .controller('password-reset', ['$scope', '$http', function($scope, $http){

    }])
    .controller('password-change', ['$scope', '$http', function($scope, $http){

    }])
;
