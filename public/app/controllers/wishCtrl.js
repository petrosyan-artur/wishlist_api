angular.module('wishCtrl', ['wishService', 'userService', 'rateService'])

    .controller('wishController', function(Wish, User, Rate, $routeParams, $rootScope, $location, Auth) {

        var vm = this;

        // user authentication part
        // get info if a person is logged in //
        vm.loggedIn = Auth.isLoggedIn();

        // check to see if a user is logged in on every request
        $rootScope.$on('$routeChangeStart', function () {
            vm.loggedIn = Auth.isLoggedIn();
            console.log(vm.loggedIn);

            // get user information on page load
            Auth.getUser()
                .then(function (data) {
                    //console.log(data);
                    vm.user = data.data;
                    User.getByUsername(vm.user.username).success(function (data) {
                        if (data.success == true) {
                            vm.userData = data.user[0];
                            Wish.findByUserId(vm.userData._id)
                                .success(function(data){
                                    if (data.success == true) {
                                        vm.myWishes = data.wishes;
                                    }
                                });
                        }

                    })
                });
        });

        // function to handle login form
        vm.doLogin = function () {
            if (vm.loginData === undefined || vm.loginData.username === undefined || vm.loginData.password === undefined) {
                vm.error = 'Empty inputs!';
                return false;
            }
            vm.processing = true;

            // clear the error
            vm.error = '';

            Auth.login(vm.loginData.username, vm.loginData.password)
                .success(function (data) {
                    vm.processing = false;

                    // if a user successfully logs in, redirect to users page
                    if (data.success) {
                        if (vm.loginData.username == 'wishlistAdmin') {
                            window.location = '/private/adminpage';
                            //$location.path('/private/adminpage');
                        } else {
                            $location.path('/');
                        }
                    } else {
                        vm.error = data.message;
                    }
                });
        };

        // function to handle register form
        vm.doRegister = function () {
            if (vm.registerData === undefined || vm.registerData.username === undefined || vm.registerData.password === undefined || vm.registerData.password2 === undefined) {
                vm.error = 'Empty inputs!';
                return false;
            }
            vm.processing = true;

            // clear the error
            vm.error = '';

            Auth.register(vm.registerData.username, vm.registerData.password, vm.registerData.password2)
                .success(function (data) {
                    vm.processing = false;

                    // if a user successfully register and logged in, redirect to users page
                    if (data.success == true) {
                        vm.registerData = {};
                        $location.path('/');
                    } else {
                        vm.error = data.message;
                    }
                });
        };

        // function to handle logging out
        vm.doLogout = function () {
            Auth.logout();
            vm.user = '';

            $location.path('/login');
        };
        // user authentication part end //

        // grab all the wishes at page load
        Wish.all()
            .success(function (data) {

                // when all the wishes come back, remove the processing variable
                vm.processing = false;

                // bind the wishes that come back to vm.wishes
                //console.log(data.wishes);
                vm.wishes = data.wishes;
            });

        //get all wishes count
        vm.getWishesCount = function () {
            Wish.count()
                .success(function (data) {
                    vm.wishesCount = data;
                });
        };

        //Wish.get($routeParams.wish_id)
        //    .success(function(data) {
        //        if (data.success == true) {
        //            vm.singleWish = data.content;
        //        }
        //    });

        // function to add a wish
        vm.saveWish = function() {
            if (!vm.loggedIn) {
                alert('Please login to add a wish!');
                return false;
            }
            if (vm.wishData === undefined || vm.wishData.content === undefined || vm.wishData.content == '') {
                alert('Empty wish cannot be submitted');
                return false;
            }
            var userId = document.getElementById('user_id').value;
            var username = document.getElementById('user_name').value;
            console.log(userId, username);
            vm.wishData.userId = userId;
            vm.wishData.username = username;
            //console.log(vm.wishData);
            //return false;
            //console.log(vm.wishData);
            // use the create function in the wishService
            Wish.create(vm.wishData)
                .success(function(data) {
                    vm.processing = false;
                    vm.wishes.unshift({
                        _id: data.wish._id,
                        content: data.wish.content,
                        createdDate: data.wish.createdDate
                    });
                    console.log(data);
                    vm.wishData = {};
                });
        };

        //openWishModal
        vm.openWishModal = function(data) {
            $('#wishModalDate').text('Added at: '+data.createdDate);
            $('#wishModalContent').text(data.content);
            $('#wishModalId').text(data._id);
            vm.getRate(data._id);
            vm.isRated = 2;
            $('#wishModal').modal({show:true});
            vm.checkRated();
            console.log(data);
        };

        // function to find a wish like content
        vm.findWish = function() {
            //vm.processing = true;
            if (vm.findData === undefined) {
                alert('Please write something to search');
                return false;
            }
            // use the create function in the wishService
            Wish.find(vm.findData.content)
                .success(function(data) {
                    vm.processing = false;
                    vm.wishes = data.wishes;
                    //console.log(data.wishes);
                    vm.wishData = {};
                    $('#loadMore').css('display', 'none');
                    //vm.message = data._id;
                });
        };
        vm.wishesCount = 1000000;
        // function to load 16 more wishes
        vm.loadMoreWish = function() {
            vm.loadMore = false;
            var limit = document.getElementById('loadLimit').value;
            limit = parseInt(limit) + 4;

            Wish.loadMore(limit)
                .success(function(data) {
                    for (var i=0; i < data.wishes.length; i++) {
                        vm.wishes.push({
                            _id: data.wishes[i]._id,
                            content: data.wishes[i].content,
                            createdDate: data.wishes[i].createdDate,
                            username: data.wishes[i].username
                        });
                    }
                    Wish.count()
                        .success(function(data) {
                            //console.log(data);
                            vm.wishesCount = data.count;
                        });
                    console.log(vm.wishesCount);

                    if (vm.wishesCount <= limit + 4) {
                        vm.loadMore = true;
                    } else {
                        document.getElementById('loadLimit').value = limit;
                    }
                    vm.wishData = {};
                    //vm.message = data._id;
                });
        };

        vm.getRate = function(wishId) {
            Rate.getRate(wishId)
                .success(function(data){
                    vm.ratesCount = data.rates;
                });
        };

        vm.addRate = function() {
            if (!vm.loggedIn) {
                alert('Please login to be able to rate!');
                return false;
            }
            var wishId = $('#wishModalId').text();
            var userId = $('#user_id').val();
            var rateData = {};
            rateData.wishId = wishId;
            rateData.userId = userId;
            console.log(rateData);
            Rate.addRate(rateData)
                .success(function(data){
                    if (data.success && data.success == true) {
                        vm.isRated = true;
                        vm.ratesCount = vm.ratesCount + 1;
                    } else {
                        alert('Something went wrong, please try again!');
                    }
                });
        };

        vm.removeRate = function() {
            var wishId = $('#wishModalId').text();
            var userId = $('#user_id').val();
            var rateData = {};
            rateData.wishId = wishId;
            rateData.userId = userId;
            console.log(rateData);
            Rate.removeRate(rateData)
                .success(function(data){
                    if (data.success && data.success == true) {
                        vm.isRated = false;
                        vm.ratesCount = vm.ratesCount - 1;
                    } else {
                        alert('Something went wrong, please try again!');
                    }
                });
        };

        vm.checkRated = function() {
            if (!vm.loggedIn) {
                vm.isRated = 0;
                return true;
            }
            var wishId = $('#wishModalId').text();
            var userId = $('#user_id').val();
            var rateData = {};
            rateData.wishId = wishId;
            rateData.userId = userId;
            Rate.checkRated(rateData)
                .success(function(data){
                    if (data.isRated == false) {
                        vm.isRated = 0;
                    } else {
                        vm.isRated = 1;
                    }
                });
        };

    });