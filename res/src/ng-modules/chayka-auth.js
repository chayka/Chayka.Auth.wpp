'use strict';

angular.module('chayka-auth', ['chayka-forms', 'chayka-buttons', 'chayka-modals', 'chayka-spinners', 'chayka-ajax',
    'chayka-nls', 'chayka-utils', 'chayka-avatars'])
    .controller('chayka-auth-form', ['$scope', '$window', '$timeout', 'nls', 'ajax', 'buttons', 'modals', 'utils', 'auth', function($scope, $window, $timeout, nls, ajax, buttons, modals, utils){
        //console.log('auth.controller');
        //$scope.modal = null;
        $scope.screen = '';
        $scope.authMode = 'reload';
        $scope.urlLoggedIn = '';
        $scope.urlLoggedOut = '';
        $scope.screenUrls = {};

        var screens = {};
        var $ = angular.element;

        $scope.getButtonClass = function(){
            return buttons.getButtonClass();
        };

        $scope.user = utils.ensure('Chayka.Users.currentUser');

        $scope.onUserChanged = function(user){
            if(!user){
                return;
            }
            angular.extend($scope.user, user);
            $timeout(function(){
                $scope.hideModal();
            }, 2000);
            if('reload' === $scope.authMode){
                if(user.id && $window.localStorage && $window.localStorage.getItem('Chayka.Auth.urlLoggedIn')){
                    var url = $window.localStorage.getItem('Chayka.Auth.urlLoggedIn');
                    $window.localStorage.setItem('Chayka.Auth.urlLoggedIn', '');
                    document.location = url;
                }else if($scope.urlLoggedIn && user.id){
                    document.location = $scope.urlLoggedIn;
                }else if($scope.urlLoggedOut && !user.id){
                    document.location = $scope.urlLoggedOut;
                }else{
                    document.location.reload();
                }
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
            //screenScope.modal = $scope.modal;
        };

        $scope.showScreen = function(screen, embedded){
            //console.dir({screensConfig: $scope.screenUrls});
            if(screens[screen]) {
                if ($scope.screen ) {
                    screens[$scope.screen].isOpen = false;
                }
                $scope.screen = screen;
                screens[screen].isOpen = true;
                if (!screens[screen].$$phase) {
                    screens[screen].$apply();
                }
                return true;
            }else if(embedded && $scope.screenUrls[screen]){
                if('login' === screen && $window.localStorage){
                    $window.localStorage.setItem('Chayka.Auth.urlLoggedIn', $window.location.toString());
                }
                $window.location = $scope.screenUrls[screen];
            }

            return false;
            //$scope.$broadcast('screen', screen);
        };

        $scope.openScreen = function(screen, embedded){
            if($scope.showScreen(screen, embedded)){
                $scope.showModal();
                if(!$scope.$$phase){
                    $scope.$apply();
                }
            }
        };

        $scope.showLoginScreen = function(embedded){
            $scope.showScreen('login', embedded);
        };

        $scope.openLoginScreen = function(embedded){
            $scope.openScreen('login', embedded);
        };

        $scope.showJoinScreen = function(embedded){
            $scope.showScreen('join', embedded);
        };

        $scope.openJoinScreen = function(embedded){
            $scope.openScreen('join', embedded);
        };

        $scope.showLogoutScreen = function(){
            $scope.showScreen('logout');
        };

        $scope.openLogoutScreen = function(){
            $scope.openScreen('logout');
        };

        $scope.showForgotPasswordScreen = function(embedded){
            $scope.showScreen('password-forgot', embedded);
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

        $scope.showAskPasswordScreen = function(){
            $scope.showScreen('password-ask');
        };

        $scope.openAskPasswordScreen = function(message, url, data, callback){
            var askScope = screens['password-ask'];
            if(askScope){
                if(message){
                    askScope.message = message;
                }
                askScope.url = url;
                askScope.data = data;
                askScope.callback = callback;
            }
            $scope.openScreen('password-ask');
        };

        $scope.showModal = function(){
            if($scope.modal){
                $scope.modal.show();
            }
        };

        $scope.hideModal = function(){
            if($scope.modal){
                $scope.modal.hide();
            }
        };

        ajax.addErrorHandler('Chayka.Auth', function(code, message, payload){
            switch(code){
                case 'auth_required':
                    message = message || nls._('message_auth_required');//'Для выполнения данной операции необходимо авторизоваться на сайте';
                    if('reload' !== $scope.authMode) {
                        $scope.onUserChanged(payload);
                    }
                    modals.show({
                        content: message,
                        title: nls._('dialog_title_auth_required'),
                        buttons: [
                            {text: nls._('button_stay_anonymous')},
                            {text: nls._('button_sign_up')/*'Зарегистрироваться'*/, click: function(){
                                $scope.openJoinScreen(true);
                            }},
                            {text: nls._('button_sign_in')/*'Войти'*/, click: function(){
                                $scope.openLoginScreen(true);
                            }}
                        ]
                    });
                    return true;
                case 'permission_required':
                    this.onUserChanged(payload);
                    message = message ||
                    nls._('message_permission_required');//'У вас недостаточно прав для выполнения данной операции';
                    modals.alert(message);
                    return true;
                default :
                    break;
            }
            return false;
        }, null);


        $( document )
            .on( 'click', 'a[href*="/wp-login.php?action=register"], a[href*="#join"]', function(event){
                event.preventDefault();
                $scope.openJoinScreen();
            })
            .on( 'click', 'a[href*="/wp-login.php?action=lostpassword"], a[href*="#forgot-password"]', function(event){
                event.preventDefault();
                $scope.openForgotPasswordScreen();
            })
            .on( 'click', 'a[href*="/wp-login.php?action=changepassword"], a[href*="#change-password"]', function(event){
                event.preventDefault();
                $scope.openChangePasswordScreen();
            })
            .on( 'click', 'a[href*="/wp-login.php?action=logout"], a[href*="#logout"]', function(event){
                event.preventDefault();
                $scope.openLogoutScreen();
            })
            .on( 'click', 'a[href$="/wp-login.php"], a[href*="#login"]', function(event){
                event.preventDefault();
                $scope.openLoginScreen();
            })
            .bind('Chayka.Auth.login', $scope.openLoginScreen)
            .bind('Chayka.Auth.join', $scope.openJoinScreen)
            .bind('Chayka.Auth.logout', $scope.openLogoutScreen)
            .bind('Chayka.Auth.forgotPassword', $scope.openForgotPasswordScreen)
            .bind('Chayka.Auth.changePassword', $scope.openChangePasswordScreen)
            .bind('Chayka.Auth.askPassword', function(e, message, url, data, callback){
                $scope.openAskPasswordScreen(message, url, data, callback);
            });
        //$scope.modal.show();
    }])
    .controller('chayka-auth-login', ['$scope', 'nls','ajax', function($scope, nls, ajax){
        $scope.$parent.registerScreen('login', $scope);
        $scope.spinner = null;
        $scope.isOpen = false;
        $scope.fields = {
            email: '',
            password: ''
        };

        $scope.buttonLoginClicked = function(){
            //console.dir({scope: $scope});
            if($scope.validator.validateFields()){
                ajax.post('/api/auth/login',
                    {
                        log: $scope.fields.email,
                        pwd: $scope.fields.password
                    },{
                        spinner: $scope.spinner,
                        spinnerMessage: nls._('message_spinner_sign_in'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        errorMessage: nls._('message_error_auth_failed'),
                        successMessage: nls._('message_welcome'),
                        scope: $scope,
                        success: function(data){
                            //console.dir({'data': data});
                            //$scope.validator.showMessage(nls._('message_welcome'));
                            $scope.$emit('Chayka.Users.currentUserChanged', data.payload);
                        }
                    });
            }
        };
    }])
    .controller('chayka-auth-logout', ['$scope', 'nls', 'ajax', function($scope, nls, ajax){
        $scope.$parent.registerScreen('logout', $scope);
        $scope.isOpen = false;
        $scope.spinner = null;

        $scope.buttonLogoutClicked = function(){
            //console.dir({scope: $scope});
            if($scope.validator.validateFields()){
                ajax.get('/api/auth/logout',
                    {
                        spinner: $scope.spinner,
                        spinnerMessage: nls._('message_spinner_signout'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        errorMessage: nls._('message_error_signing_out'),
                        successMessage: nls._('message_signed_out'),
                        scope: $scope,
                        success: function(data){
                            //console.dir({'data': data});
                            //this.showLoginScreen();
                            //$scope.validator.showMessage(nls._('message_signed_out'));
                            $scope.$emit('Chayka.Users.currentUserChanged', data.payload);
                            $scope.$broadcast('Chayka.Users.currentUserChanged', data.payload);
                        }
                    });
            }
        };
    }])
    .controller('chayka-auth-join', ['$scope', 'nls', '$timeout', 'ajax', function($scope, nls, $timeout, ajax){
        $scope.$parent.registerScreen('join', $scope);
        $scope.isOpen = false;
        $scope.spinner = null;

        $scope.fields = {
            email: '',
            name: ''
        };

        $scope.buttonJoinClicked = function(){
            //console.dir({scope: $scope});
            if($scope.validator.validateFields()){
                ajax.post('/api/auth/join',
                    {
                        email: $scope.fields.email,
                        login: $scope.fields.name
                    },{
                        spinner: $scope.spinner,
                        spinnerMessage: nls._('message_spinner_sign_up'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        errorMessage: nls._('message_error_sign_up_failed'),
                        successMessage: nls._('message_signed_up'),
                        scope: $scope,
                        success: function(){
                            //console.dir({'data': data});
                            $timeout(function(){
                                $scope.$parent.showLoginScreen();
                            }, 4000);

                        }
                    });
            }
        };
    }])
    .controller('chayka-auth-password-forgot', ['$scope', 'nls', 'ajax', function($scope, nls, ajax){
        $scope.$parent.registerScreen('password-forgot', $scope);
        $scope.isOpen = false;
        $scope.spinner = null;

        $scope.fields = {
            email: ''
        };

        $scope.buttonSendCodeClicked = function(){
            //console.dir({scope: $scope});
            if($scope.validator.validateFields()){
                ajax.post('/api/auth/forgot-password',
                    {
                        email: $scope.fields.email
                    },{
                        spinner: $scope.spinner,
                        spinnerMessage: nls._('message_spinner_validating_email'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        errorMessage: nls._('message_error_password_recovery'),
                        successMessage: nls._('message_change_pass_code_sent'),
                        scope: $scope,
                        success: function(data){
                            //console.dir({'data': data});
                            //$scope.validator.showMessage(nls._('message_change_pass_code_sent'));
                        }
                    });
            }
        };
    }])
    .controller('chayka-auth-password-reset', ['$scope', 'nls', '$timeout' ,'ajax', function($scope, nls, $timeout, ajax){
        $scope.$parent.registerScreen('password-reset', $scope);
        $scope.isOpen = false;
        $scope.spinner = null;

        $scope.key = '';
        $scope.fields = {
            password1: '',
            password2: ''
        };

        $scope.buttonResetPasswordClicked = function(){
            //console.dir({scope: $scope});
            if($scope.validator.validateFields()){
                ajax.post('/api/auth/reset-password',
                    {
                        key: $scope.key,
                        password1: $scope.fields.password1,
                        password2: $scope.fields.password2
                    },
                    {
                        spinner: $scope.spinner,
                        spinnerMessage: nls._('message_spinner_reset_password'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        errorMessage: nls._('message_error_wrong_code'),
                        successMessage: nls._('message_password_set_signing_in'),
                        scope: $scope,
                        success: function(data){
                            //console.dir({'data': data});
                            //this.showLoginScreen();
                            //$scope.validator.showMessage(nls._('message_password_set_signing_in'));
                            $timeout(function(){
                                $scope.$parent.hideModal();
                            }, 2000);
                            $scope.$emit('Chayka.Users.currentUserChanged', data.payload);
                        }
                    });
            }
        };

    }])
    .controller('chayka-auth-password-change', ['$scope', '$timeout', 'nls', 'ajax', function($scope, $timeout, nls, ajax){
        $scope.$parent.registerScreen('password-change', $scope);
        $scope.isOpen = false;
        $scope.spinner = null;

        $scope.fields = {
            password: '',
            password1: '',
            password2: ''
        };

        $scope.buttonChangePasswordClicked = function(){
            //console.dir({scope: $scope});
            if($scope.validator.validateFields()){
                ajax.post('/api/auth/change-password',
                    $scope.fields,
                    {
                        spinner: $scope.spinner,
                        spinnerMessage: nls._('message_spinner_change_password'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        errorMessage: nls._('message_error_change_password'),
                        successMessage: nls._('message_password_changed'),
                        scope: $scope,
                        success: function(){
                            //console.dir({'data': data});
                            $scope.fields.password = '';
                            $scope.fields.password1 = '';
                            $scope.fields.password2 = '';
                            $timeout(function(){
                                $scope.$parent.hideModal();
                            }, 2000);
                        }
                    });
            }
        };
    }])
    .controller('chayka-auth-password-ask', ['$scope', '$timeout', 'nls', 'ajax', function($scope, $timeout, nls, ajax){
        $scope.$parent.registerScreen('password-ask', $scope);
        $scope.isOpen = false;
        $scope.spinner = null;

        $scope.message = nls._('message_confirm_password');
        $scope.data = {};
        $scope.url = '/api/no-op/';
        $scope.callback = function(){};

        $scope.fields = {
            password: ''
        };

        $scope.buttonConfirmPasswordClicked = function(){
            //console.dir({scope: $scope});
            var data = angular.extend({}, $scope.data, $scope.fields);
            var callback = $scope.callback;
            if($scope.validator.validateFields()){
                ajax.post($scope.url,
                    data,
                    {
                        spinner: $scope.spinner,
                        spinnerMessage: nls._('message_spinner_confirm_password'),
                        showMessage: false,
                        formValidator: $scope.validator,
                        //errorMessage: nls._('message_error_confirm_password'),
                        //successMessage: nls._('message_password_confirmed'),
                        scope: $scope,
                        success: function(data, status, headers, config){
                            //console.dir({'data': data});
                            $scope.fields.password = '';
                            if(callback){
                                callback(data, status, headers, config);
                            }
                            $timeout(function(){
                                $scope.$parent.hideModal();
                            }, 2000);
                        }
                    });
            }
        };
    }])
    .controller('auth-user-menu',['$scope', '$rootScope', 'auth', 'utils', 'avatars', function($scope, $rootScope, auth, utils, avatars){

        $scope.open = false;

        $scope.user = utils.ensure('Chayka.Users.currentUser');
        //var $ = angular.element;
        //$(document).on('Chayka.Users.currentUserChanged', function(e, user){
        $rootScope.$on('Chayka.Users.currentUserChanged', function(e, user){
            angular.extend($scope.user, user);
        });

        $scope.isAdmin = function(){
            return $scope.user.role === 'administrator';
        };

        $scope.isEditor = function(){
            return $scope.user.role === 'editor';
        };

        $scope.isAuthor = function(){
            return $scope.user.role === 'author';
        };

        $scope.isUserPrivileged = function(){
            return $scope.isAdmin() || $scope.isEditor() || $scope.isAuthor();
        };

        $scope.isUserLoggedIn = function(){
            return !!parseInt($scope.user.id);
        };

        $scope.isUserNative = function(){
            return !$scope.user.meta.source;
        };

        $scope.gravatar = function(size) {
            //var MD5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};
            size = size || 80;
            //return '//www.gravatar.com/avatar/' + md5.createHash($scope.user.user_email) + '?s=' + size + '&d=identicon&r=G';
            return avatars.gravatar($scope.user.user_email, size);
        };

        $scope.fbavatar = function(size){
            size = parseInt(size) || 80;
            //return '//graph.facebook.com/'+$scope.user.meta.fb_user_id+'/picture/?type=square&height='+size+'&width='+size;
            return avatars.fbavatar($scope.user.meta.fb_user_id, size);
        };

        $scope.inavatar = function(){
            return '';
        };

        $scope.avatar = function(size){
            if($scope.user.meta.fb_user_id){
                return $scope.fbavatar(size);
            }
            if($scope.user.meta.in_user_id){
                return $scope.inavatar(size);
            }
            return $scope.gravatar(size);
        };

    }])
    .directive('authScreen', function(){
        return {
            restrict: 'A',
            link: function($scope, element, attrs){
                //console.dir({'auth.directive': $scope});
                $scope.showScreen(attrs['authScreen']);
            }
        };
    })
    .directive('authMode', function(){
        return {
            restrict: 'A',
            link: function($scope, element, attrs){
                $scope.authMode = attrs['authMode'];
                //console.dir({'auth.directive': $scope});
            }
        };
    })
    .directive('authKey', function(){
        return {
            restrict: 'A',
            link: function($scope, element, attrs){
                $scope.key = attrs['authKey'];
            }
        };
    })
    .directive('authUrlLoggedIn', function(){
        return {
            restrict: 'A',
            link: function($scope, element, attrs){
                $scope.urlLoggedIn = attrs['authUrlLoggedIn'];
            }
        };
    })
    .directive('authUrlLoggedOut', function(){
        return {
            restrict: 'A',
            link: function($scope, element, attrs){
                $scope.urlLoggedOut = attrs['authUrlLoggedOut'];
            }
        };
    })
    .factory('auth', ['utils', function(utils){
        var $ = angular.element;

        return utils.ensure('Chayka.Auth', {

            openLoginScreen: function (embedded) {
                $(document).trigger('Chayka.Auth.login', [embedded]);
            },

            openJoinScreen: function (embedded) {
                $(document).trigger('Chayka.Auth.join', [embedded]);
            },

            openForgotPasswordScreen: function(embedded){
                $(document).trigger('Chayka.Auth.forgotPassword', [embedded]);
            },

            openChangePasswordScreen: function(){
                $(document).trigger('Chayka.Auth.changePassword');
            },

            openAskPasswordScreen: function(message, url, data, callback){
                $(document).trigger('Chayka.Auth.askPassword', [message, url, data, callback]);
            }
        });
    }])
    .config(['nlsProvider', function(nlsProvider) {

        // Adding a translation table for the English language
        nlsProvider.setTranslations('en-US', {
            'header_default': 'Authentication',
            'message_spinner_sign_in': 'Signing in...',
            'message_welcome': 'Signed in!',
            'message_error_auth_failed': 'Error: authentication failed',
            'message_spinner_sign_up': 'Signing up...',
            'message_signed_up': 'Registration successfully completed. We\'ve sent you an e-mail with credentials for your account. Don\'t forget to check your SPAM folder.',
            'message_error_sign_up_failed': 'Error: registration failed',
            'message_spinner_validating_email': 'Validating e-mail address...',
            'message_change_pass_code_sent': 'We\'ve sent you an e-mail with password reset link. Please follow that link to set new password. Don\'t forget to check your SPAM folder.',
            'message_error_password_recovery': 'Error: password was not recovered',
            'message_spinner_reset_password': 'Changing password...',
            'message_password_set_signing_in': 'Your password has been changed, signing in.',
            'message_error_wrong_code': 'Invalid activation code, please repeat password reset procedure once again.',
            'message_spinner_change_password': 'Changing password...',
            'message_password_changed': 'Your password has been changed',
            'message_error_change_password': 'Error: your password was not changed',
            'message_spinner_signout': 'Signing out...',
            'message_signed_out': 'Signed out, see you!',
            'message_error_signing_out': 'Error: sign out failure',
            'message_error_email_exists': 'This e-mail address is already registered.',
            'message_error_username_exists': 'This username is already registered.',
            'message_spinner_validating_name': 'Validating username...',
            'message_auth_required': 'This operation is permitted for registered users only',
            'message_confirm_password': 'You need to confirm your password in order to proceed',
            'message_spinner_confirm_password': 'Validating password...',
            'dialog_title_auth_required': 'Authorization required',
            'button_stay_anonymous': 'Stay anonymous',
            'button_sign_up': 'Sign up',
            'button_sign_in': 'Sign in',
            'message_permission_required': 'You don\'t have enough permissions for this operation',

            'user_menu_admin_area': 'Admin area',
            'user_menu_profile': 'Profile',
            'user_menu_change_password': 'Change password',
            'user_menu_logout': 'Log out',
            'user_menu_login': 'Log in',
            'user_menu_join': 'Join',
            'user_menu_forgot_password': 'Forgot password',
            'user_menu_via_facebook': 'via Facebook',
            'user_menu_via_linkedin': 'via LinkedIn'
        });

        nlsProvider.setTranslations('ru-RU', {
            'header_default': 'Аутентификация',
            'message_spinner_sign_in': 'Выполняется вход...',
            'message_welcome': 'Вход выполнен, добро пожаловать!',
            'message_error_auth_failed': 'Ошибка: вход не выполнен',
            'message_spinner_sign_up': 'Выполняется регистрация...',
            'message_signed_up': 'Регистрация прошла успешно, вам отправлено письмо, содержащие пароль, для входа на сайт. Не забудьте проверить папку &quot;Спам&quot;.',
            'message_error_sign_up_failed': 'Ошибка: регистрация не выполнена',
            'message_spinner_validating_email': 'Проверка адреса e-mail...',
            'message_change_pass_code_sent': 'Вам отправлено письмо со ссылкой для смены пароля. Чтобы сменить пароль, перейдите по ссылке в письме. Не забудьте проверить папку &quot;Спам&quot;.',
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
            'message_confirm_password': 'Для выполнения данной операции Вам необходимо ввести ваш пароль',
            'message_spinner_confirm_password': 'Проверка пароля...',
            'message_auth_required': 'Для выполнения данной операции необходимо авторизоваться на сайте',
            'dialog_title_auth_required': 'Требуется авторизация',
            'button_stay_anonymous': 'Продолжить анонимно',
            'button_sign_up': 'Зарегистрироваться',
            'button_sign_in': 'Войти',
            'message_permission_required': 'У вас недостаточно прав для выполнения данной операции',

            'user_menu_admin_area': 'Консоль',
            'user_menu_profile': 'Профиль',
            'user_menu_change_password': 'Сменить пароль',
            'user_menu_logout': 'Выход',
            'user_menu_login': 'Войти',
            'user_menu_join': 'Регистрация',
            'user_menu_forgot_password': 'Восстановить пароль',
            'user_menu_via_facebook': 'через Facebook',
            'user_menu_via_linkedin': 'через LinkedIn'
        });
    }])
;
