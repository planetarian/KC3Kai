(function(){
	"use strict";

	var isRunning = false;
	// The URL prefix of current player's KC server
	var myKcServerHost = "";

	$(document).on("ready", function(){
		// Initialize data managers
		ConfigManager.load();
		KC3Master.init();
		RemodelDb.init();
		WhoCallsTheFleetDb.init("../../../../");
		KC3Meta.init("../../../../data/");
		KC3Master.loadAbyssalShips("../../../../data/");
		KC3Meta.defaultIcon("../../../../assets/img/ui/empty.png");
		KC3Meta.loadQuotes();
		PlayerManager.init();
		PlayerManager.loadConsumables();
		KC3ShipManager.load();
		KC3GearManager.load();
		KC3SortieManager.load();
		KC3Database.init();
		KC3Translation.execute();
		KC3QuestSync.init();

		// Restore build docks timer if panel reopened, not from game start
		PlayerManager.setBuildDocksByCache();

		myKcServerHost = myKcServerHost || (() => {
			let host = (new KC3Server()).setNum(PlayerManager.hq.server).ip;
			return host ? `http://${host}` : "";
		})();

		// Disable Tab key to prevent it scrolling any window
		$(document).on("keydown", function(e){
			if(e.which === 9) {
				e.stopPropagation();
				e.preventDefault();
			}
		});
		
		// Start Network listener
		KC3Network.initConfigs();
		KC3Network.addGlobalListener(function(event, data){
			if(isRunning || (["GameStart","HomeScreen","CatBomb"].indexOf(event)+1)){
				if(typeof NatsuiroListeners[event] != "undefined"){
					NatsuiroListeners[event](data);
				} else {
					console.warn("No event found for keyword", event);
				}
			}
		});
		KC3Network.listen();
		
		// Attempt to activate game on inspected window
		(new RMsg("service", "activateGame", {
			tabId: chrome.devtools.inspectedWindow.tabId
		})).execute();
	});

	//
	// React components
	//

	var e = React.createElement;

	class DaybreakPanel extends React.Component {
		constructor(props) {
			super(props);
			this.state = {date: new Date()};
		}
		componentDidMount() {
			this.timerID = setInterval(() => this.tick(), 1000);
		}
		componentWillUnmount() {
			clearInterval(this.timerID);
		}
		tick() {
			this.setState({
				date: new Date()
			});
		}
		render() { 
			return e('div', null, `Hello world! ${this.state.date}`);
		}
	}


	function render() {
		ReactDOM.render(e(DaybreakPanel, null, null), document.querySelector('#root'));
	}
	setInterval(() => render(), 1000);

})();