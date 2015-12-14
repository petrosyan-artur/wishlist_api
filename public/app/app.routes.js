angular.module('app.routes', ['ngRoute'])

    .config(function ($routeProvider, $locationProvider) {

        $routeProvider

            // route for the home page
            .when('/', {
                templateUrl: 'app/views/pages/all.html',
                controller: 'wishController',
                controllerAs: 'wish'
            })

            // login page
            .when('/login', {
                templateUrl: 'app/views/pages/login.html',
                controller: 'wishController',
                controllerAs: 'login'
            })

            // registration page
            .when('/register', {
                templateUrl: 'app/views/pages/register.html',
                controller: 'wishController',
                controllerAs: 'register'
            })

            //.when('/wish/:wish_id', {
            //    templateUrl: 'app/views/pages/user.html',
            //    controller: 'wishController',
            //    controllerAs: 'wish'
            //})

            //admin page
            .when('/private/adminpage', {
                templateUrl: 'app/views/private/pages/admin.html',
                controller: 'privateController',
                controllerAs: 'private'
            })

            // page to edit a wish
            .when('/user', {
                templateUrl: 'app/views/pages/user.html',
                controller: 'userController',
                controllerAs: 'user'
        });

        // single wish page
        //.when('/wish/:wish_id', {
        //    templateUrl: 'app/views/pages/users/user.html',
        //    controller: 'userEditController',
        //    controllerAs: 'user'
        //});

        $locationProvider.html5Mode(true);

    });
