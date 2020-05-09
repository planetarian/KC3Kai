var re = React.createElement;

(async function(){
	"use strict";
	_gaq.push(['_trackEvent', "Panel: Daybreak Theme", 'clicked']);

	//
	// React components
	//
	
	await DaybreakComponents.loadComponentsAsync([
		"daybreak/DaybreakPanel",
		"daybreak/DaybreakLayoutRoot",
		"daybreak/DaybreakContainer",
		"daybreak/DaybreakElement",
		"editor/ComponentEditor",
		"editor/PropertyGroup",
		"editor/PropertyField",
		"layout/GridPanel",
		"ui/ModalDockPanel",
		"ui/ConfirmButton",
		"game/ActionLogViewer",
		"test/HelloWorld"
	]);

	const panel = re(DaybreakComponents.DaybreakPanel, {});
	ReactDOM.render(panel, document.getElementById('db-root'));
})();
