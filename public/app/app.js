angular.module('wishApp', ['ngAnimate', 'app.routes', 'authService', 'wishCtrl', 'wishService', 'userCtrl', 'userService'])

// application configuration to integrate token into requests
    .config(function($httpProvider) {

        // attach our auth interceptor to the http requests
        $httpProvider.interceptors.push('AuthInterceptor');

    });