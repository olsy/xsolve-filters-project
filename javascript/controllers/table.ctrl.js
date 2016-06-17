angular
	.module("app")
	.controller("mainController", mainController);

mainController.$inject = ["$scope", "$state", "$stateParams", "configService"];

function mainController($scope, $state, $stateParams, configService) {

	var rows = 5,
		page = parseInt($stateParams.page),
		pages,
		redirect = false;

	$scope.dateMask = configService.getProperties('dateMask');
	$scope.sort = configService.updateSortType;
	$scope.isActive = isActive;

	$scope.$watch(function () {
			return configService.getData();
		},
		function (data) {
			/**
			 * redirect to first page when filtration is started
			 */
			if (redirect && page != 1) {
				$state.go('main', {page: 1});
			}

			// page data
			$scope.pageData = getPageData(data, page, rows);
			pages = getPagesCount(data, rows);
			$scope.pages = generatePageArray(pages);

			redirect = true;
		});

	/**
	 * return 'true' if current page is active
	 *
	 * @param page
	 * @returns {boolean}
	 */
	function isActive(page) {
		return page == $stateParams.page;
	}
}

// get data for page
function getPageData(data, page, rows) {
	var firstElement = ( page - 1 ) * rows,
		lastElement = page * rows;

	return data.slice(firstElement, lastElement);
}

// get pages
function getPagesCount(data, rows) {
	return Math.ceil(data.length / rows);
}

// generate pages array
function generatePageArray(pages) {
	var arr = [];

	for (var i = 0; i < pages; i++) {
		arr.push(i + 1);
	}
	return arr;
}