/// <reference path="lib/knockout.d.ts"/>
/// <reference path="lib/bootstrap.d.ts"/>

/// <reference path="Feed.ts"/>
/// <reference path="Map.ts"/>
/// <reference path="ViewModel.ts"/>

$(function(): void {
	$('[data-toggle="tooltip"]').tooltip();

	var vm: ViewModel = new ViewModel();

	ko.applyBindings(vm);

	return;
});
