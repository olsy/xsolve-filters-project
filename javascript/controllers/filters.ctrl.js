angular
	.module("app")
	.controller("filtersController", filtersController);

filtersController.$inject = ["$scope", "$filter", "dataService", "configService"];

function filtersController($scope, $filter, dataService, configService) {

	var db = dataService.getData(),
		config = configService.getProperties(),
		lastSortType = configService.getSortType(),
		source,
		props = {},
		filteredData = [],
		tagsOrderList = [],
		companiesTags = config.companiesTags;

	$scope.menuToggle = false;
	$scope.menuSwitch = menuSwitch;

	$scope.search = config.search;
	$scope.date = config.date;
	$scope.note = config.note;
	$scope.conditionList = config.conditionList;
	$scope.tags = {};
	$scope.watcher = false;

	/**
	 *  Get data from file
	 */
	db.then(function (response) {
		if (response.status === 200) {

			source = validateDate(response.data);

			$scope.companiesList = getCompaniesTags(source);
			$scope.company = createTagsObject($scope.companiesList);

			// order of tags
			tagsOrderList = $scope.companiesList;

			$scope.watcher = !$scope.watcher;
		}
		else {
			console.warn("Data hasn't been loaded!");
		}
	}, function (err) {
		console.warn(err);
	});

	/**
	 *  Update input data for filter findByCompany
	 *  (validate tags object on change)
	 */
	$scope.$watchCollection('tags', function (newValue, oldValue) {

		if (!oldValue['all'] && newValue['all']) {
			for (var key in $scope.tags) {
				$scope.tags[key] = key == 'all';
			}
			companiesTags = ['all'];
		}
		else {
			companiesTags = [];
			for (var key in $scope.tags) {
				$scope.tags[key] && companiesTags.push(key);
			}
			if (!companiesTags.length) {
				$scope.tags['all'] = true;
				companiesTags = ['all'];
			}
			else if (companiesTags.length > 1 && companiesTags.indexOf('all') != -1) {
				$scope.tags.all = false;
				companiesTags.slice(companiesTags.indexOf('all'), 1);
			}
			else if ($scope.companiesList && companiesTags.length == ($scope.companiesList.length - 1) && companiesTags.indexOf('all') == -1) {
				for (var key in $scope.tags) {
					$scope.tags[key] = key == 'all';
				}
				companiesTags = ['all'];
			}
		}
		$scope.watcher = !$scope.watcher;
	});

	/**
	 *  Update data depends on filters
	 */
	$scope.$watchGroup([
			'search.query',
			'search.id',
			'search.firstName',
			'search.lastName',
			'search.dateOfBirth',
			'search.company',
			'search.note',
			'date.from',
			'date.to',
			'date.interval',
			'note.number',
			'note.isEqual',
			'note.condition',
			'watcher'
		],
		function () {
			if (source) {
				// filter data
				filteredData = source;
				filteredData = $filter(sortName(configService.getSortType()))(filteredData);
				filteredData = $filter('searchFilter')(filteredData, $scope.search);
				filteredData = $filter('findByDate')(filteredData, $scope.date);
				filteredData = $filter('findByNote')(filteredData, $scope.note);

				$scope.companiesList = orderList(getCompaniesTags(filteredData), tagsOrderList);
				$scope.company = createTagsObject($scope.companiesList);

				filteredData = $filter('findByCompany')(filteredData, companiesTags);

				// update filter properties and filtered data
				props = {
					search: $scope.search,
					companiesTags: companiesTags,
					date: $scope.date,
					note: $scope.note
				};
				configService.update(props, filteredData);
			}
		});

	/**
	 *  Update data depends on sorts
	 */
	$scope.$watch(function () {
			return configService.sortTypeWatcher();
		},
		function () {
			var sortType = configService.getSortType();
			filteredData = configService.getData();

			if (lastSortType != sortType) {
				filteredData = $filter(sortName(sortType))(filteredData);
			}
			else {
				filteredData.reverse();
			}

			// update filtered data
			configService.updateData(newArray(filteredData));

			// update sort type value
			lastSortType = sortType;
		});

	/**
	 * Open/Close list of search string properties,
	 * when close - reset properties
	 */
	function menuSwitch() {
		for (var key in $scope.search) {
			(key != 'query') && ($scope.search[key] = false);
		}
		$scope.menuToggle = !$scope.menuToggle;
	}
}

/**
 * Return list of companies with unique values
 *
 * @param data
 * @returns {Array}
 */
function getCompaniesTags(data) {
	var tags = [];

	data.forEach(function (item) {
		if (tags.indexOf(item.company.toLowerCase()) == -1) {
			tags.push(item.company.toLowerCase());
		}
	});
	(tags.length >= 2) && tags.unshift('all');

	return tags.length >= 2 ? tags : [];
}

/**
 * Create object what generate tags for filter data by companies
 *
 * @param tags
 * @returns {{}}
 */
function createTagsObject(tags) {
	var obj = {};

	tags.forEach(function (key) {
		Object.defineProperty(obj, key, {
			configurable: true,
			enumerable: true,
			writable: true,
			value: key == 'all'
		});
	});

	return obj;
}

/**
 * Date validation
 *
 * @param data
 */
function validateDate(data) {
	return data.map(function (item) {
		var datetime, date, tmp;
		if (item.hasOwnProperty('dateOfBirth')) {
			datetime = item.dateOfBirth.split(" ");
			date = datetime[0].split(".");

			/**
			 * [day, month] = [month, day]
			 */
			tmp = date[0];
			date[0] = date[1];
			date[1] = tmp;

			item.dateOfBirth = new Date(date.join(".") + " " + datetime[1]);
		}


		return item;
	});
}

/**
 * Create sort name
 *
 * @param name
 * @returns {string}
 */
function sortName(name) {
	return 'sortBy' + name;
}

/**
 * Create new Array
 *
 * @param arr
 * @returns {Array}
 */
function newArray(arr) {
	var newArray = [];
	arr.forEach(function (el) {
		newArray.push(el);
	});
	return newArray;
}

/**
 * Set tags order
 *
 * @param list
 * @param order
 */
function orderList(list, order) {
	var orderList;
	orderList = order.filter(function (company) {
		return list.indexOf(company) != -1;
	});
	return orderList;
}

