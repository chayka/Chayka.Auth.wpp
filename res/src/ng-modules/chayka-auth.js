'use strict';

angular.module('chayka-auth', ['chayka-forms', 'chayka-modals', 'chayka-spinners', 'chayka-ajax'])
    .controller('form', ['$scope', function($scope){
        //$scope.modal = null;
        $scope.screen = '';

        var screens = {};

        $scope.registerScreen = function(screen, screenScope){
            screens[screen] = screenScope;
        }

        $scope.showScreen = function(screen){
            if($scope.screen){
                screens[$scope.screen].isOpen = false;
            }
            $scope.screen = screen;
            //angular.forEach(screens, function(screenScope){
            //    screenScope.isOpen = false;
            //});
            screens[screen].isOpen = true;
            if(!screens[screen].$$phase){
                screens[screen].$apply();
            }
            //$scope.$broadcast('screen', screen);
        };

        $scope.openScreen = function(screen){
            $scope.showScreen(screen);
            $scope.modal.show();
        };

        $scope.showLoginScreen = function(){
            $scope.showScreen('login');
        };

        $scope.openLoginScreen = function(){
            $scope.openScreen('login');
        };

        $scope.showJoinScreen = function(){
            $scope.showScreen('join');
        };

        $scope.openJoinScreen = function(){
            $scope.openScreen('join');
        };

        $scope.showLogoutScreen = function(){
            $scope.showScreen('logout');
        };

        $scope.openLogoutScreen = function(){
            $scope.openScreen('logout');
        };

        $scope.showForgotPasswordScreen = function(){
            $scope.showScreen('password-forgot');
        };

        $scope.openForgotPasswordScreen = function(){
            $scope.openScreen('password-forgot');
        };

        $scope.showChangePasswordScreen = function(){
            $scope.showScreen('password-change');
        };

        $scope.openChangePasswordScreen = function(){
            $scope.openScreen('password-change');
        };

        var $ = angular.element;

        $( document ).on( "click", 'a[href*="/wp-login.php"], a[href*="#login"]', function(event){
            event.preventDefault();
            $scope.openLoginScreen();
        });
        $( document ).on( "click", 'a[href*="/wp-login.php?action=register"], a[href*="#join"]', function(event){
            event.preventDefault();
            $scope.openJoinScreen();
        });
        $( document ).on( "click", 'a[href*="/wp-login.php?action=lostpassword"], a[href*="#forgot-password"]', function(event){
            event.preventDefault();
            $scope.openForgotPasswordScreen();
        });
        $( document ).on( "click", 'a[href*="/wp-login.php?action=changepassword"], a[href*="#change-password"]', function(event){
            event.preventDefault();
            $scope.openChangePasswordScreen();
        });
        $( document ).on( "click", 'a[href*="/wp-login.php?action=logout"], a[href*="#logout"]', function(event){
            event.preventDefault();
            $scope.openLogoutScreen();
        });
        $(document).bind('Chayka.Auth.login', $scope.openLoginScreen);
        $(document).bind('Chayka.Auth.join', $scope.openJoinScreen);
        $(document).bind('Chayka.Auth.forgotPassword', $scope.openForgotPasswordScreen);
        $(document).bind('Chayka.Auth.changePassword', $scope.openChangePasswordScreen);
        //$scope.modal.show();
    }])
    .controller('join', ['$scope', '$http', function($scope, $http){
        $scope.$parent.registerScreen('join', $scope);
        $scope.isOpen = false;

    }])
    .controller('login', ['$scope', 'ajax', function($scope, ajax){
        $scope.$parent.registerScreen('login', $scope);
        $scope.isOpen = false;
        $scope.email = '1';
        $scope.password = '2';

        $scope.buttonLoginClicked = function(event){
            //event.preventDefault();
            $scope.$digest();
            if(true || $scope.validator.validateFields()){
                ajax.post('/api/auth/login',
                    {
                        log: $scope.email,
                        pwd: $scope.password
                    },{
                        spinner: $scope.spinner,
                        showMessage: false,
                        errorMessage: 'message_error_auth_failed',
                        success: function(data){
                            console.dir({'data': data});
                            //this.setMessage(this.nls('message_welcome'));//'Вход выполнен, добро пожаловать!');
                            //this.onUserChanged(data.payload);
    //                        $.brx.utils.loadPage();
                        }
                    });
            }
        }
    }])
    .controller('logout', ['$scope', '$http', function($scope, $http){
        $scope.$parent.registerScreen('logout', $scope);
        $scope.isOpen = false;

    }])
    .controller('password-forgot', ['$scope', '$http', function($scope, $http){
        $scope.$parent.registerScreen('password-forgot', $scope);
        $scope.isOpen = false;

    }])
    .controller('password-reset', ['$scope', '$http', function($scope, $http){

    }])
    .controller('password-change', ['$scope', '$http', function($scope, $http){
        $scope.$parent.registerScreen('password-change', $scope);
        $scope.isOpen = false;

    }])
;
