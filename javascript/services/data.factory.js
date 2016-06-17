"use strict";

angular
	.module("app")
	.factory("dataService", dataService);

dataService.$inject = ["$http", "$q"];

function dataService($http, $q) {

	return {
		getData: getData
	};

	function getData() {
		var deferred = $q.defer();
		$http.get("dane.json")
			.then(
				function (response) {
					deferred.resolve(response);
				},
				function (err) {
					deferred.reject(err);
				});
		return deferred.promise;
	}

}