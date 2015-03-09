/// <reference path="lib/knockout.d.ts"/>
/// <reference path="lib/jquery.d.ts"/>
/// <reference path="lib/bootstrap.d.ts"/>

/// <reference path="Feed.ts"/>
/// <reference path="Map.ts"/>
/// <reference path="ViewModel.ts"/>

function resizeSidebar(): void {
	var sideHeight: number = $('#left-sidebar').height();
	var headerHeight: number = $('#tab-header').height();
	$('.tab-content').height(sideHeight - headerHeight);
}

$(function(): void {
	// Resize the tab content
	resizeSidebar();
	$(window).resize(resizeSidebar);

	var vm: ViewModel = new ViewModel();

	ko.applyBindings(vm);

	return;
});
