angular
	.module("app")
	.factory("configService", configService);

configService.$inject = [];

function configService() {

	var filterProperties = {
			search: {
				query: "",
				id: false,
				firstName: false,
				lastName: false,
				dateOfBirth: false,
				company: false,
				note: false
			},
			companiesTags: [],
			date: {
				from: "",
				to: "",
				interval: false
			},
			note: {
				number: null,
				isEqual: false,
				condition: 0
			},
			dateMask: "MM/dd/yyyy HH:mm:ss",
			conditionList: [
				{id: 0, value: ""},
				{id: 1, value: "less"},
				{id: 2, value: "more"}
			]
		},
		sortType = 'Id',
		watcher = true,
		filteredData = [];

	return {
		update: update,
		updateProperty: updateProperty,
		getProperties: getProperties,
		getData: getData,
		getSortType: getSortType,
		sortTypeWatcher: sortTypeWatcher,
		updateData: updateData,
		updateSortType: updateSortType
	};

	// update filter properties and data
	function update(props, data) {
		updateData(data);
		updateProperty(props);
	}

	// update data
	function updateData(data){
		filteredData = data;
	}

	// update property
	function updateProperty(props){
		for (var key in props) {
			if(key == 'sortType'){
				updateSortType(props[key]);
			}
			else if (key != 'sortType' && props[key] && filterProperties[key] != props[key]) {
				filterProperties[key] = props[key];
			}
		}
	}

	// update type of sort
	function updateSortType(value){
		watcher = !watcher;
		sortType = value;
	}

	// changes when sort type is updated
	function sortTypeWatcher(){
		return watcher;
	}

	// return filtered data
	function getData() {
		return filteredData;
	}

	// get filter properties
	function getProperties() {
		var properties;
		if (!arguments.length) {
			properties = filterProperties;
			properties.sortType = sortType;
			return properties;
		} else if (arguments.length == 1) {
			return filterProperties[arguments[0]];
		}
	}

	// return type of last sort
	function getSortType(){
		return sortType;
	}

}