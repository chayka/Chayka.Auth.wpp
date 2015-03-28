"use strict";angular.module("chayka-auth",["chayka-forms","chayka-modals","chayka-spinners","chayka-ajax","chayka-translate","chayka-utils","angular-md5"]).controller("chayka-auth-form",["$scope","$window","$timeout","$translate","ajax","modals","utils","auth",function($scope,$window,$timeout,$translate,ajax,modals,utils){$scope.screen="",$scope.authMode="reload",$scope.urlLoggedIn="",$scope.urlLoggedOut="",$scope.screenUrls={};var screens={},$=angular.element;$scope.user=utils.ensure("Chayka.Users.currentUser"),$scope.onUserChanged=function(user){if(user&&(angular.extend($scope.user,user),$timeout(function(){$scope.hideModal()},2e3),"reload"===$scope.authMode))if(user.id&&$window.localStorage&&$window.localStorage.getItem("Chayka.Auth.urlLoggedIn")){var url=$window.localStorage.getItem("Chayka.Auth.urlLoggedIn");$window.localStorage.setItem("Chayka.Auth.urlLoggedIn",""),document.location=url}else $scope.urlLoggedIn&&user.id?document.location=$scope.urlLoggedIn:$scope.urlLoggedIn&&!user.id?document.location=$scope.urlLoggedOut:document.location.reload()},$scope.$on("Chayka.Users.currentUserChanged",function(e,user){$scope.onUserChanged(user)}),$(document).on("Chayka.Users.currentUserChanged",function(e,user){$scope.onUserChanged(user)}),$scope.registerScreen=function(screen,screenScope){screens[screen]=screenScope},$scope.showScreen=function(screen,embedded){return screens[screen]?($scope.screen&&(screens[$scope.screen].isOpen=!1),$scope.screen=screen,screens[screen].isOpen=!0,screens[screen].$$phase||screens[screen].$apply(),!0):(embedded&&$scope.screenUrls[screen]&&("login"===screen&&$window.localStorage&&$window.localStorage.setItem("Chayka.Auth.urlLoggedIn",$window.location.toString()),$window.location=$scope.screenUrls[screen]),!1)},$scope.openScreen=function(screen,embedded){$scope.showScreen(screen,embedded)&&($scope.showModal(),$scope.$apply())},$scope.showLoginScreen=function(embedded){$scope.showScreen("login",embedded)},$scope.openLoginScreen=function(embedded){$scope.openScreen("login",embedded)},$scope.showJoinScreen=function(embedded){$scope.showScreen("join",embedded)},$scope.openJoinScreen=function(embedded){$scope.openScreen("join",embedded)},$scope.showLogoutScreen=function(){$scope.showScreen("logout")},$scope.openLogoutScreen=function(){$scope.openScreen("logout")},$scope.showForgotPasswordScreen=function(embedded){$scope.showScreen("password-forgot",embedded)},$scope.openForgotPasswordScreen=function(){$scope.openScreen("password-forgot")},$scope.showChangePasswordScreen=function(){$scope.showScreen("password-change")},$scope.openChangePasswordScreen=function(){$scope.openScreen("password-change")},$scope.showAskPasswordScreen=function(){$scope.showScreen("password-ask")},$scope.openAskPasswordScreen=function(message,url,data,callback){var askScope=screens["password-ask"];askScope&&(message&&(askScope.message=message),askScope.url=url,askScope.data=data,askScope.callback=callback),$scope.openScreen("password-ask")},$scope.showModal=function(){$scope.modal&&$scope.modal.show()},$scope.hideModal=function(){$scope.modal&&$scope.modal.hide()},ajax.addErrorHandler("Chayka.Auth",function(code,message,payload){switch(code){case"auth_required":return message=message||$translate.instant("message_auth_required"),"reload"!==$scope.authMode&&$scope.onUserChanged(payload),modals.show({content:message,title:$translate.instant("dialog_title_auth_required"),buttons:[{text:$translate.instant("button_stay_anonymous")},{text:$translate.instant("button_sign_up"),click:function(){$scope.openJoinScreen(!0)}},{text:$translate.instant("button_sign_in"),click:function(){$scope.openLoginScreen(!0)}}]}),!0;case"permission_required":return this.onUserChanged(payload),message=message||$translate.instant("message_permission_required"),modals.alert(message),!0}return!1},null),$(document).on("click",'a[href*="/wp-login.php?action=register"], a[href*="#join"]',function(event){event.preventDefault(),$scope.openJoinScreen()}).on("click",'a[href*="/wp-login.php?action=lostpassword"], a[href*="#forgot-password"]',function(event){event.preventDefault(),$scope.openForgotPasswordScreen()}).on("click",'a[href*="/wp-login.php?action=changepassword"], a[href*="#change-password"]',function(event){event.preventDefault(),$scope.openChangePasswordScreen()}).on("click",'a[href*="/wp-login.php?action=logout"], a[href*="#logout"]',function(event){event.preventDefault(),$scope.openLogoutScreen()}).on("click",'a[href$="/wp-login.php"], a[href*="#login"]',function(event){event.preventDefault(),$scope.openLoginScreen()}).bind("Chayka.Auth.login",$scope.openLoginScreen).bind("Chayka.Auth.join",$scope.openJoinScreen).bind("Chayka.Auth.logout",$scope.openLogoutScreen).bind("Chayka.Auth.forgotPassword",$scope.openForgotPasswordScreen).bind("Chayka.Auth.changePassword",$scope.openChangePasswordScreen).bind("Chayka.Auth.askPassword",function(e,message,url,data,callback){$scope.openAskPasswordScreen(message,url,data,callback)})}]).controller("chayka-auth-login",["$scope","$translate","ajax",function($scope,$translate,ajax){$scope.$parent.registerScreen("login",$scope),$scope.spinner=null,$scope.isOpen=!1,$scope.fields={email:"",password:""},$scope.buttonLoginClicked=function(){$scope.validator.validateFields()&&ajax.post("/api/auth/login",{log:$scope.fields.email,pwd:$scope.fields.password},{spinner:$scope.spinner,spinnerMessage:$translate.instant("message_spinner_sign_in"),showMessage:!1,formValidator:$scope.validator,errorMessage:$translate.instant("message_error_auth_failed"),successMessage:$translate.instant("message_welcome"),scope:$scope,success:function(data){$scope.$emit("Chayka.Users.currentUserChanged",data.payload)}})}}]).controller("chayka-auth-logout",["$scope","$translate","ajax",function($scope,$translate,ajax){$scope.$parent.registerScreen("logout",$scope),$scope.isOpen=!1,$scope.spinner=null,$scope.buttonLogoutClicked=function(){$scope.validator.validateFields()&&ajax.get("/api/auth/logout",{spinner:$scope.spinner,spinnerMessage:$translate.instant("message_spinner_signout"),showMessage:!1,formValidator:$scope.validator,errorMessage:$translate.instant("message_error_signing_out"),successMessage:$translate.instant("message_signed_out"),scope:$scope,success:function(data){$scope.$emit("Chayka.Users.currentUserChanged",data.payload),$scope.$broadcast("Chayka.Users.currentUserChanged",data.payload)}})}}]).controller("chayka-auth-join",["$scope","$translate","$timeout","ajax",function($scope,$translate,$timeout,ajax){$scope.$parent.registerScreen("join",$scope),$scope.isOpen=!1,$scope.spinner=null,$scope.fields={email:"",name:""},$scope.buttonJoinClicked=function(){$scope.validator.validateFields()&&ajax.post("/api/auth/join",{email:$scope.fields.email,login:$scope.fields.name},{spinner:$scope.spinner,spinnerMessage:$translate.instant("message_spinner_sign_up"),showMessage:!1,formValidator:$scope.validator,errorMessage:$translate.instant("message_error_sign_up_failed"),successMessage:$translate.instant("message_signed_up"),scope:$scope,success:function(){$timeout(function(){$scope.$parent.showLoginScreen()},4e3)}})}}]).controller("chayka-auth-password-forgot",["$scope","$translate","ajax",function($scope,$translate,ajax){$scope.$parent.registerScreen("password-forgot",$scope),$scope.isOpen=!1,$scope.spinner=null,$scope.fields={email:""},$scope.buttonSendCodeClicked=function(){$scope.validator.validateFields()&&ajax.post("/api/auth/forgot-password",{email:$scope.fields.email},{spinner:$scope.spinner,spinnerMessage:$translate.instant("message_spinner_validating_email"),showMessage:!1,formValidator:$scope.validator,errorMessage:$translate.instant("message_error_password_recovery"),successMessage:$translate.instant("message_change_pass_code_sent"),scope:$scope,success:function(){}})}}]).controller("chayka-auth-password-reset",["$scope","$translate","$timeout","ajax",function($scope,$translate,$timeout,ajax){$scope.$parent.registerScreen("password-reset",$scope),$scope.isOpen=!1,$scope.spinner=null,$scope.key="",$scope.fields={password1:"",password2:""},$scope.buttonResetPasswordClicked=function(){$scope.validator.validateFields()&&ajax.post("/api/auth/reset-password",{key:$scope.key,password1:$scope.fields.password1,password2:$scope.fields.password2},{spinner:$scope.spinner,spinnerMessage:$translate.instant("message_spinner_reset_password"),showMessage:!1,formValidator:$scope.validator,errorMessage:$translate.instant("message_error_wrong_code"),successMessage:$translate.instant("message_password_set_signing_in"),scope:$scope,success:function(data){$timeout(function(){$scope.$parent.hideModal()},2e3),$scope.$emit("Chayka.Users.currentUserChanged",data.payload)}})}}]).controller("chayka-auth-password-change",["$scope","$timeout","$translate","ajax",function($scope,$timeout,$translate,ajax){$scope.$parent.registerScreen("password-change",$scope),$scope.isOpen=!1,$scope.spinner=null,$scope.fields={password:"",password1:"",password2:""},$scope.buttonChangePasswordClicked=function(){$scope.validator.validateFields()&&ajax.post("/api/auth/change-password",$scope.fields,{spinner:$scope.spinner,spinnerMessage:$translate.instant("message_spinner_change_password"),showMessage:!1,formValidator:$scope.validator,errorMessage:$translate.instant("message_error_change_password"),successMessage:$translate.instant("message_password_changed"),scope:$scope,success:function(){$scope.fields.password="",$scope.fields.password1="",$scope.fields.password2="",$timeout(function(){$scope.$parent.hideModal()},2e3)}})}}]).controller("chayka-auth-password-ask",["$scope","$timeout","$translate","ajax",function($scope,$timeout,$translate,ajax){$scope.$parent.registerScreen("password-ask",$scope),$scope.isOpen=!1,$scope.spinner=null,$scope.message=$translate.instant("message_confirm_password"),$scope.data={},$scope.url="/api/no-op/",$scope.callback=function(){},$scope.fields={password:""},$scope.buttonConfirmPasswordClicked=function(){var data=angular.extend({},$scope.data,$scope.fields),callback=$scope.callback;$scope.validator.validateFields()&&ajax.post($scope.url,data,{spinner:$scope.spinner,spinnerMessage:$translate.instant("message_spinner_confirm_password"),showMessage:!1,formValidator:$scope.validator,scope:$scope,success:function(data,status,headers,config){$scope.fields.password="",callback&&callback(data,status,headers,config),$timeout(function(){$scope.$parent.hideModal()},2e3)}})}}]).controller("auth-user-menu",["$scope","$rootScope","auth","utils","md5",function($scope,$rootScope,auth,utils,md5){$scope.open=!1,$scope.user=utils.ensure("Chayka.Users.currentUser"),$rootScope.$on("Chayka.Users.currentUserChanged",function(e,user){angular.extend($scope.user,user)}),$scope.isAdmin=function(){return"administrator"===$scope.user.role},$scope.isEditor=function(){return"editor"===$scope.user.role},$scope.isAuthor=function(){return"author"===$scope.user.role},$scope.isUserPrivileged=function(){return $scope.isAdmin()||$scope.isEditor()||$scope.isAuthor()},$scope.isUserLoggedIn=function(){return!!parseInt($scope.user.id)},$scope.isUserNative=function(){return!$scope.user.meta.source},$scope.gravatar=function(size){return size=size||80,"//www.gravatar.com/avatar/"+md5.createHash($scope.user.user_email)+"?s="+size+"&d=identicon&r=G"},$scope.fbavatar=function(size){return size=parseInt(size)||80,"//graph.facebook.com/"+$scope.user.meta.fb_user_id+"/picture/?type=square&height="+size+"&width="+size},$scope.inavatar=function(){return""},$scope.avatar=function(size){return $scope.user.meta.fb_user_id?$scope.fbavatar(size):$scope.user.meta.in_user_id?$scope.inavatar(size):$scope.gravatar(size)}}]).directive("authScreen",function(){return{restrict:"A",link:function($scope,element,attrs){$scope.showScreen(attrs.authScreen)}}}).directive("authMode",function(){return{restrict:"A",link:function($scope,element,attrs){$scope.authMode=attrs.authMode}}}).directive("authKey",function(){return{restrict:"A",link:function($scope,element,attrs){$scope.key=attrs.authKey}}}).directive("authUrlLoggedIn",function(){return{restrict:"A",link:function($scope,element,attrs){$scope.urlLoggedIn=attrs.authUrlLoggedIn}}}).directive("authUrlLoggedOut",function(){return{restrict:"A",link:function($scope,element,attrs){$scope.urlLoggedOut=attrs.authUrlLoggedOut}}}).factory("auth",["utils",function(utils){var $=angular.element;return utils.ensure("Chayka.Auth",{openLoginScreen:function(embedded){$(document).trigger("Chayka.Auth.login",[embedded])},openJoinScreen:function(embedded){$(document).trigger("Chayka.Auth.join",[embedded])},openForgotPasswordScreen:function(embedded){$(document).trigger("Chayka.Auth.forgotPassword",[embedded])},openChangePasswordScreen:function(){$(document).trigger("Chayka.Auth.changePassword")},openAskPasswordScreen:function(message,url,data,callback){$(document).trigger("Chayka.Auth.askPassword",[message,url,data,callback])}})}]).config(["$translateProvider",function($translateProvider){$translateProvider.translations("en-US",{header_default:"Authentication",message_spinner_sign_in:"Signing in...",message_welcome:"Signed in!",message_error_auth_failed:"Error: authentication failed",message_spinner_sign_up:"Signing up...",message_signed_up:"Registration successfully completed. We've sent you an e-mail with credentials for your account. Don't forget to check your SPAM folder.",message_error_sign_up_failed:"Error: registration failed",message_spinner_validating_email:"Validating e-mail address...",message_change_pass_code_sent:"We've sent you an e-mail with password reset link. Please follow that link to set new password. Don't forget to check your SPAM folder.",message_error_password_recovery:"Error: password was not recovered",message_spinner_reset_password:"Changing password...",message_password_set_signing_in:"Your password has been changed, signing in.",message_error_wrong_code:"Invalid activation code, please repeat password reset procedure once again.",message_spinner_change_password:"Changing password...",message_password_changed:"Your password has been changed",message_error_change_password:"Error: your password was not changed",message_spinner_signout:"Signing out...",message_signed_out:"Signed out, see you!",message_error_signing_out:"Error: sign out failure",message_error_email_exists:"This e-mail address is already registered.",message_error_username_exists:"This username is already registered.",message_spinner_validating_name:"Validating username...",message_auth_required:"This operation is permitted for registered users only",message_confirm_password:"You need to confirm your password in order to proceed",message_spinner_confirm_password:"Validating password...",dialog_title_auth_required:"Authorization required",button_stay_anonymous:"Stay anonymous",button_sign_up:"Sign up",button_sign_in:"Sign in",message_permission_required:"You don't have enough permissions for this operation",user_menu_admin_area:"Admin area",user_menu_profile:"Profile",user_menu_change_password:"Change password",user_menu_logout:"Log out",user_menu_login:"Log in",user_menu_join:"Join",user_menu_forgot_password:"Forgot password",user_menu_via_facebook:"via Facebook",user_menu_via_linkedin:"via LinkedIn"}),$translateProvider.translations("ru-RU",{header_default:"Аутентификация",message_spinner_sign_in:"Выполняется вход...",message_welcome:"Вход выполнен, добро пожаловать!",message_error_auth_failed:"Ошибка: вход не выполнен",message_spinner_sign_up:"Выполняется регистрация...",message_signed_up:"Регистрация прошла успешно, вам отправлено письмо, содержащие пароль, для входа на сайт. Не забудьте проверить папку &quot;Спам&quot;.",message_error_sign_up_failed:"Ошибка: регистрация не выполнена",message_spinner_validating_email:"Проверка адреса e-mail...",message_change_pass_code_sent:"Вам отправлено письмо со ссылкой для смены пароля. Чтобы сменить пароль, перейдите по ссылке в письме. Не забудьте проверить папку &quot;Спам&quot;.",message_error_password_recovery:"Ошибка восстановления пароля",message_spinner_reset_password:"Смена пароля...",message_password_set_signing_in:"Пароль изменен, выполняется вход",message_error_wrong_code:"Неверный код активации, пройдите процедуру восстановления пароля еще раз",message_spinner_change_password:"Смена пароля...",message_password_changed:"Пароль изменен",message_error_change_password:"Ошибка смены пароля",message_spinner_signout:"Выполняется выход...",message_signed_out:"Выход выполнен, до новых встреч!",message_error_signing_out:"Ошибка: выход не выполнен",message_error_email_exists:"Этот e-mail уже зарегистрирован.",message_error_username_exists:"Это имя пользователя уже зарегистрировано.",message_spinner_validating_name:"Проверка имени...",message_confirm_password:"Для выполнения данной операции Вам необходимо ввести ваш пароль",message_spinner_confirm_password:"Проверка пароля...",message_auth_required:"Для выполнения данной операции необходимо авторизоваться на сайте",dialog_title_auth_required:"Требуется авторизация",button_stay_anonymous:"Продолжить анонимно",button_sign_up:"Зарегистрироваться",button_sign_in:"Войти",message_permission_required:"У вас недостаточно прав для выполнения данной операции",user_menu_admin_area:"Консоль",user_menu_profile:"Профиль",user_menu_change_password:"Сменить пароль",user_menu_logout:"Выход",user_menu_login:"Войти",user_menu_join:"Регистрация",user_menu_forgot_password:"Восстановить пароль",user_menu_via_facebook:"через Facebook",user_menu_via_linkedin:"через LinkedIn"})}]);