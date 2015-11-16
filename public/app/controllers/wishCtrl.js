angular.module('wishCtrl', ['wishService', 'userService'])

    .controller('wishController', function(Wish, User, $routeParams, $rootScope, $location, Auth) {

        var vm = this;

        // user authentication part
        // get info if a person is logged in //
        vm.loggedIn = Auth.isLoggedIn();

        // check to see if a user is logged in on every request
        $rootScope.$on('$routeChangeStart', function() {
            vm.loggedIn = Auth.isLoggedIn();

            // get user information on page load
            Auth.getUser()
                .then(function(data) {
                    //console.log(data);
                    vm.user = data.data;
                    User.getByUsername(vm.user.username).success(function(data){
                        vm.userData = data[0];
                    })
                });
        });

        // function to handle login form
        vm.doLogin = function() {
            vm.processing = true;

            // clear the error
            vm.error = '';

            Auth.login(vm.loginData.username, vm.loginData.password)
                .success(function(data) {
                    vm.processing = false;

                    // if a user successfully logs in, redirect to users page
                    if (data.success)
                        $location.path('/');
                    else
                        vm.error = data.message;

                });
        };

        // function to handle register form
        vm.doRegister = function() {
            vm.processing = true;

            // clear the error
            vm.error = '';

            Auth.register(vm.registerData.username, vm.registerData.password, vm.registerData.password2)
                .success(function(data) {
                    vm.processing = false;

                    // if a user successfully register and logged in, redirect to users page
                    if (data.success) {
                        vm.registerData = {};
                        $location.path('/');
                    } else {
                        vm.error = data.message;
                    }
                });
        };

        // function to handle logging out
        vm.doLogout = function() {
            Auth.logout();
            vm.user = '';

            $location.path('/login');
        };
        // user authentication part end //

        // grab all the wishes at page load
        Wish.all()
            .success(function(data) {

                // when all the wishes come back, remove the processing variable
                vm.processing = false;

                // bind the wishes that come back to vm.wishes
                vm.wishes = data;
            });

        Wish.get($routeParams.wish_id)
            .success(function(data) {
                vm.singleWish = data.content;
            });

        //function to add a wish

        // variable to hide/show elements of the view
        // differentiates between create or edit pages
        vm.type = 'create';

        // function to create a wish
        vm.saveWish = function() {
            //vm.processing = true;
            //vm.message = '';

            if (!vm.loggedIn) {
                alert('Please login to add a wish!');
            }
            var userId = document.getElementById('user_id').value;
            vm.wishData.userId = userId;
            console.log(vm.wishData, userId);
            //return;
            // use the create function in the wishService
            Wish.create(vm.wishData)
                .success(function(data) {
                    vm.processing = false;
                    vm.wishes.unshift({
                        _id: data.data._id,
                        content: data.data.content,
                        createdDate: data.data.createdDate
                    });
                    console.log(data);
                    vm.wishData = {};
                    //vm.message = data._id;
                });
        };

        //openWishModal
        vm.openWishModal = function(data) {
            $('#wishModalDate').text('Added at: '+data.createdDate);
            $('#wishModalContent').text(data.content);
            $('#wishModalId').text(data._id);
            $('#wishModal').modal({show:true});
            console.log(data);
        };

        // function to find a wish like content
        vm.findWish = function() {
            //vm.processing = true;
            //vm.message = '';

            // use the create function in the wishService
            Wish.find(vm.findData)
                .success(function(data) {
                    vm.processing = false;
                    vm.wishes = data;
                    console.log(data);
                    vm.wishData = {};
                    //vm.message = data._id;
                });
        };

        // function to load 16 more wishes
        vm.loadMoreWish = function($timeout) {
            //vm.processing = true;
            vm.loadMore = false;
            var limit = document.getElementById('loadLimit').value;
            limit = parseInt(limit) + 4;
            var lm = {};
            lm.limit = limit;
            console.log(lm);
            //vm.message = '';

            // use the create function in the wishService
            Wish.loadMore(lm)
                .success(function(data) {
                    vm.processing = false;
                    for (var i=0; i < data.wishes.length; i++) {
                        vm.wishes.push({
                            _id: data.wishes[i]._id,
                            content: data.wishes[i].content,
                            createdDate: data.wishes[i].createdDate
                        });
                    }
                    console.log(data.loadMore);
                    if (data.loadMore == false) {
                        vm.loadMore = true;
                    } else {
                        document.getElementById('loadLimit').value = limit;
                    }
                    vm.wishData = {};
                    //vm.message = data._id;
                });
        };
    });