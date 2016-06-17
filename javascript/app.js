angular
	.module("app", ["ui.router", "ngMaterial"])
	.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider){

		$stateProvider
			.state("main", {
				url: "/:page",
				controller: "mainController",
				templateUrl: "views/main.html"
			});

		$urlRouterProvider
			.otherwise("/1");

	}]);