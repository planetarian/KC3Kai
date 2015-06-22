(function(){
	"use strict";
	
	// Document ready
	$(document).on("ready", function(){
		// Load previously stored configs
		ConfigManager.load();
		
		// Check if theme exists
		$.ajax({
			type: "HEAD",
			url: "themes/"+ConfigManager.pan_theme+"/main.html",
			success: function(){
				createPanel( ConfigManager.pan_theme );
			},
			error: function(){
				createPanel( "default" );
			}
		});
		
	});
	
	// Execute Chrome API to add panels to devtools
	function createPanel( theme ){
		chrome.devtools.panels.create("KC3改",
			"../../assets/img/logo/16.png",
			"pages/devtools/themes/"+theme+"/"+theme+".html",
			function(panel){}
		);
	}
	
})();