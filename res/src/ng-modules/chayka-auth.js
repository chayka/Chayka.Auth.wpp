'use strict';

angular.module('chayka-auth', ['chayka-forms', 'chayka-modals', 'chayka-spinners', 'chayka-ajax',
    'chayka-translate', 'chayka-utils'])
    .controller('form', ['$scope', '$timeout', 'utils', function($scope, $timeout, _){
        console.log('auth.controller');
        //$scope.modal = null;
        $scope.screen = '';
        $scope.authMode = 'reload'

        var screens = {};
        var $ = angular.element;


        $scope.user = _.ensure('Chayka.Users.currentUser');

        $scope.onUserChanged = function(user){
            if(!user){
                return;
            }
            angular.extend($scope.user, user);
            $timeout(function(){
                $scope.modal.hide();
            }, 2000);
            if('reload' === $scope.authMode){
                document.location.reload();
            }
        };

        $scope.$on('Chayka.Users.currentUserChanged', function(e, user){
            $scope.onUserChanged(user);
        });

        $(document).on('Chayka.Users.currentUserChanged', function(e, user){
            $scope.onUserChanged(user);
        });

        $scope.registerScreen = function(screen, screenScope){
            screens[screen] = screenScope;
            screenScope.modal = $scope.modal;
        };

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
            $scope.$apply();
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
        $(document).bind('Chayka.Auth.logout', $scope.openLogoutScreen);
        $(document).bind('Chayka.Auth.forgotPassword', $scope.openForgotPasswordScreen);
        $(document).bind('Chayka.Auth.changePassword', $scope.openChangePasswordScreen);
        //$scope.modal.show();
    }])
    .controller('login', ['$scope', '$translate','ajax', function($scope, $translate, ajax){
        $scope.$parent.registerScreen('login', $scope);
        $scope.spinner = null;
        $scope.isOpen = false;
        $scope.fields = {
            email: '',
            password: ''
        };

        $scope.buttonLoginClicked = function(event){
            //event.preventDefault();
            console.dir({scope: $scope});
            if($scope.validator.validateFields()){
                ajax.post('/api/auth/login',
                    {
                        log: $scope.fields.email,
                        pwd: $scope.fields.password
                    },{
                        spinner: $scope.spinner,
                        spinnerMessage: $translate.instant('message_spinner_sign_in'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        errorMessage: $translate.instant('message_error_auth_failed'),
                        success: function(data){
                            console.dir({'data': data});
                            $scope.validator.showMessage($translate.instant('message_welcome'));
                            $scope.$emit('Chayka.Users.currentUserChanged', data.payload);
                        }
                    });
            }
        };
    }])
    .controller('logout', ['$scope', '$translate', 'ajax', function($scope, $translate, ajax){
        $scope.$parent.registerScreen('logout', $scope);
        $scope.isOpen = false;

        $scope.buttonLogoutClicked = function(event){
            //event.preventDefault();
            console.dir({scope: $scope});
            if($scope.validator.validateFields()){
                ajax.get('/api/auth/logout',
                    {
                        spinner: $scope.spinner,
                        spinnerMessage: $translate.instant('message_spinner_signout'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        errorMessage: $translate.instant('message_error_signing_out'),
                        success: function(data){
                            console.dir({'data': data});
                            //this.showLoginScreen();
                            $scope.validator.showMessage($translate.instant('message_signed_out'));
                            $scope.$emit('Chayka.Users.currentUserChanged', data.payload);
                        }
                    });
            }
        };
    }])
    .controller('join', ['$scope', '$translate', '$timeout', 'ajax', function($scope, $translate, $timeout, ajax){
        $scope.$parent.registerScreen('join', $scope);
        $scope.isOpen = false;

        $scope.fields = {
            email: '',
            name: ''
        };

        $scope.buttonJoinClicked = function(event){
            //event.preventDefault();
            console.dir({scope: $scope});
            if($scope.validator.validateFields()){
                ajax.post('/api/auth/join',
                    {
                        email: $scope.fields.email,
                        login: $scope.fields.name
                    },{
                        spinner: $scope.spinner,
                        spinnerMessage: $translate.instant('message_spinner_sign_up'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        errorMessage: $translate.instant('message_error_sign_up_failed'),
                        success: function(data){
                            console.dir({'data': data});
                            //this.showLoginScreen();
                            $scope.validator.showMessage($translate.instant('message_signed_up'));
                            $timeout(function(){
                                $scope.$parent.showLoginScreen();
                            }, 4000);

                        }
                    });
            }
        };
    }])
    .controller('password-forgot', ['$scope', '$translate', 'ajax', function($scope, $translate, ajax){
        $scope.$parent.registerScreen('password-forgot', $scope);
        $scope.isOpen = false;
        $scope.fields = {
            email: ''
        };

        $scope.buttonSendCodeClicked = function(event){
            //event.preventDefault();
            console.dir({scope: $scope});
            if($scope.validator.validateFields()){
                ajax.post('/api/auth/forgot-password',
                    {
                        email: $scope.fields.email
                    },{
                        spinner: $scope.spinner,
                        spinnerMessage: $translate.instant('message_spinner_validating_email'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        errorMessage: $translate.instant('message_error_password_recovery'),
                        success: function(data){
                            console.dir({'data': data});
                            $scope.validator.showMessage($translate.instant('message_change_pass_code_sent'));
                        }
                    });
            }
        };
    }])
    .controller('password-reset', ['$scope', '$http', function($scope, $http){
        $scope.$parent.registerScreen('password-reset', $scope);
        $scope.isOpen = false;

    }])
    .controller('password-change', ['$scope', '$timeout', '$translate', 'ajax', function($scope, $timeout, $translate, ajax){
        $scope.$parent.registerScreen('password-change', $scope);
        $scope.isOpen = false;
        $scope.fields = {
            oldPassword: '',
            password1: '',
            password2: ''
        };

        $scope.buttonChangePasswordClicked = function(event){
            //event.preventDefault();
            console.dir({scope: $scope});
            if($scope.validator.validateFields()){
                ajax.post('/api/auth/change-password',
                    $scope.fields,
                    {
                        spinner: $scope.spinner,
                        spinnerMessage: $translate.instant('message_spinner_change_password'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        errorMessage: $translate.instant('message_error_change_password'),
                        success: function(data){
                            console.dir({'data': data});
                            //this.showLoginScreen();
                            $scope.validator.showMessage($translate.instant('message_password_changed'));
                            $timeout(function(){
                                $scope.modal.hide();
                            }, 2000);
                            //$scope.$emit('Chayka.Users.currentUserChanged', data.payload);
                            //this.onUserChanged(data.payload);
                        }
                    });
            }
        };
    }])
    .directive('authScreen', function(){
        return {
            restrict: 'A',
            link: function($scope, element, attrs){
                console.dir({'auth.directive': $scope});
                $scope.showScreen(attrs.authScreen);
            }
        };
    })
    .directive('authMode', function(){
        return {
            restrict: 'A',
            link: function($scope, element, attrs){
                $scope.authMode = attrs.authMode;
                console.dir({'auth.directive': $scope});
            }
        };
    })
    .config(['$translateProvider', function($translateProvider) {

        // Adding a translation table for the English language
        $translateProvider.translations('en-US', {
            'header_default': 'Authentification',
            'message_spinner_sign_in': 'Signing in...',
            'message_welcome': 'Signed in!',
            'message_error_auth_failed': 'Error: authentification failed',
            'message_spinner_sign_up': 'Signing up...',
            'message_signed_up': 'Registration successfully completed. We\'ve sent you an e-mail with credentials for your account.</br>Don\'t forget to check your SPAM folder.',
            'message_error_sign_up_failed': 'Error: registration failed',
            'message_spinner_validating_email': 'Validating e-mail address...',
            'message_change_pass_code_sent': 'We\'ve sent you an e-mail with password reset link.</br>Please follow that link to set new password.</br>Don\'t forget to check your SPAM folder.',
            'message_error_password_recovery': 'Error: pasword was not recoverd',
            'message_spinner_reset_password': 'Changing password...',
            'message_password_set_signing_in': 'Your password has been changed, signing in.',
            'message_error_wrong_code': 'Invalid activation code, please repeat password reset procedure once again.',
            'message_spinner_change_password': 'Changing password...',
            'message_password_changed': 'Your password has been changed',
            'message_error_change_password': 'Error: your pasword was not changed',
            'message_spinner_signout': 'Signing out...',
            'message_signed_out': 'Signed out, see you!',
            'message_error_signing_out': 'Error: sign out failure',
            'message_error_email_exists': 'This e-mail address is allready registered.',
            'message_error_username_exists': 'This username is allready registered.',
            'message_spinner_validating_name': 'Validationg username...',
            'message_auth_required': 'This operation is permited for registered users only',
            'dialog_title_auth_required': 'Authorization required',
            'button_stay_anonymous': 'Stay anonymous',
            'button_sign_up': 'Sign up',
            'button_sign_in': 'Sign in',
            'message_permission_required': 'You don\'t have enough permissions for this operation'
        });

        $translateProvider.translations('ru-RU', {
            'header_default': 'Аутентификация',
            'message_spinner_sign_in': 'Выполняется вход...',
            'message_welcome': 'Вход выполнен, добро пожаловать!',
            'message_error_auth_failed': 'Ошибка: вход не выполнен',
            'message_spinner_sign_up': 'Выполняется регистрация...',
            'message_signed_up': 'Регистрация прошла успешно, вам отправлено письмо, содержащие пароль, для входа на сайт.</br>Не забудьте проверить папку &quot;Спам&quot;.',
            'message_error_sign_up_failed': 'Ошибка: регистрация не выполнена',
            'message_spinner_validating_email': 'Проверка адреса e-mail...',
            'message_change_pass_code_sent': 'Вам отправлено письмо со ссылкой для смены пароля.</br>Чтобы сменить пароль, перейдите по ссылке в письме.</br>Не забудьте проверить папку &quot;Спам&quot;.',
            'message_error_password_recovery': 'Ошибка восстановления пароля',
            'message_spinner_reset_password': 'Смена пароля...',
            'message_password_set_signing_in': 'Пароль изменен, выполняется вход',
            'message_error_wrong_code': 'Неверный код активации, пройдите процедуру восстановления пароля еще раз',
            'message_spinner_change_password': 'Смена пароля...',
            'message_password_changed': 'Пароль изменен',
            'message_error_change_password': 'Ошибка смены пароля',
            'message_spinner_signout': 'Выполняется выход...',
            'message_signed_out': 'Выход выполнен, до новых встреч!',
            'message_error_signing_out': 'Ошибка: выход не выполнен',
            'message_error_email_exists': 'Этот e-mail уже зарегистрирован.',
            'message_error_username_exists': 'Это имя пользователя уже зарегистрировано.',
            'message_spinner_validating_name': 'Проверка имени...',
            'message_auth_required': 'Для выполнения данной операции необходимо авторизоваться на сайте',
            'dialog_title_auth_required': 'Требуется авторизация',
            'button_stay_anonymous': 'Продолжить анонимно',
            'button_sign_up': 'Зарегистрироваться',
            'button_sign_in': 'Войти',
            'message_permission_required': 'У вас недостаточно прав для выполнения данной операции'
        });
    }])
;
