"use strict";

angular
	.module("app")

	// sorts
	.filter("sortById", sortById)
	.filter("sortByFirstName", sortByFirstName)
	.filter("sortByLastName", sortByLastName)
	.filter("sortByDate", sortByDate)
	.filter("sortByCompany", sortByCompany)
	.filter("sortByNote", sortByNote)

	// filters
	.filter("searchFilter", searchFilter)
	.filter("findByDate", findByDate)
	.filter("findByCompany", findByCompany)
	.filter("findByNote", findByNote);


/**
 * Sorting by object properties
 */

function sortById() {
	return function (input) {
		return sort(input, 'id');
	}
}

function sortByFirstName() {
	return function (input) {
		return sort(input, 'firstName');
	}
}

function sortByLastName() {
	return function (input) {
		return sort(input, 'lastName');
	}
}

function sortByDate() {
	return function (input) {
		if (input) {
			return input.sort(function (previousValue, nextValue) {
				if (dateID(previousValue.dateOfBirth) > dateID(nextValue.dateOfBirth)) {
					return 1;
				}
				else if (dateID(previousValue.dateOfBirth) < dateID(nextValue.dateOfBirth)) {
					return -1;
				}
				else if (dateID(previousValue.dateOfBirth) == dateID(nextValue.dateOfBirth)) {
					return 0;
				}
			});
		} else {
			return input;
		}
	}
}

function sortByCompany() {
	return function (input) {
		return sort(input, 'company');
	}
}

function sortByNote() {
	return function (input) {
		return sort(input, 'note');
	}
}

/**
 * Filtering data by properties
 */

searchFilter.$inject = ["$filter", "configService"];

function searchFilter($filter, configService) {
	return function (input, options) {
		var query = "",
			props = [],
			propsActive = [];

		for (var key in options) {
			if (key == "query") {
				query = options[key];
			}
			else {
				props.push(key);
				options[key] && (propsActive.push(key));
			}
		}

		props = props.length == propsActive.length || propsActive.length == 0 ? props : propsActive;

		return input.filter(function (item) {
			return props.some(function (key) {
				var option = item[key];
				if(item[key] instanceof Date){
					option = $filter('date')(item[key], configService.getProperties('dateMask'));
				}
				return (option.toString().toLowerCase()).search(query.toLowerCase()) != -1;
			});
		});

	}
}

function findByDate() {
	return function (input, props) {
		if (!props) {
			return input;
		}
		else {
			if (!props.interval) {
				return input.filter(function (item) {
					return props.from ? dateID(item.dateOfBirth) == dateID(props.from) : true;
				});
			}
			else {
				return input.filter(function (item) {
					var from = props.from ? dateID(item.dateOfBirth) >= dateID(props.from) : true,
						to = props.to ? dateID(item.dateOfBirth) <= dateID(props.to) : true;
					return from && to;
				});
			}
		}
	};
}

function findByCompany() {
	return function (input, companies) {

		if (!companies.length || companies[0] == 'all') {
			return input;
		} else {
			return input.filter(function (item) {
				// debugger
				return companies.indexOf(item.company.toLowerCase()) != -1;
			});
		}
	}
}

function findByNote() {
	return function (input, options) {
		var output,
			condition = options.condition,
			equal = options.isEqual,
			number = options.number;

		if (!input || typeof number == "object") {
			return input;
		} else {
			if (condition == 1) {
				if (!equal) {
					return input.filter(function (item) {
						return parseInt(item.note) < parseInt(number);
					});
				}
				else {
					return input.filter(function (item) {
						return parseInt(item.note) <= parseInt(number);
					});
				}
			}
			else if (condition == 2) {
				if (!equal) {
					return input.filter(function (item) {
						return parseInt(item.note) > parseInt(number);
					});
				}
				else {
					return input.filter(function (item) {
						return parseInt(item.note) >= parseInt(number);
					});
				}
			}
			else {
				return input.filter(function (item) {
					return parseInt(item.note) == parseInt(number);
				});
			}
		}
	}
}

/**
 * Sort data array by choosen property
 *
 * @param input
 * @param key
 * @returns {*}
 */
function sort(input, key) {
	if (input) {
		return input.sort(function (previousValue, nextValue) {
			if (previousValue[key] > nextValue[key]) {
				return 1;
			}
			else if (previousValue[key] < nextValue[key]) {
				return -1;
			}
			else if (previousValue[key] == nextValue[key]) {
				return 0;
			}
		});
	} else {
		return input;
	}
}

/**
 * Return number which consist of year, month, day [,hours, minutes, seconds]
 *
 * @param d
 * @returns {Number}
 */
function dateID(d) {
	var date = new Date(d),
		year = date.getFullYear(),
		month = checkZeroDate(date.getMonth() + 1),
		day = checkZeroDate(date.getDate()),
		hours = checkZeroDate(date.getHours()),
		minutes = checkZeroDate(date.getMinutes()),
		seconds = checkZeroDate(date.getSeconds()),
		datetimeArr = [year, month, day];

	/**
	 * if argument[1] is true then return extended dateID with hours, minutes and seconds
	 */
	if (arguments.length > 1 && arguments[1]) {
		datetimeArr.concat([hours, minutes, seconds]);
	}

	return parseInt(datetimeArr.join(""));
}

/**
 * Add 0 before datetime if less than 10
 *
 * @param date
 * @returns {string}
 */
function checkZeroDate(date) {
	/**
	 * example: month   6   ->  06
	 *          day     12  ->  12
	 */
	return date.toString().length == 1 ? ("0" + date) : date;
}