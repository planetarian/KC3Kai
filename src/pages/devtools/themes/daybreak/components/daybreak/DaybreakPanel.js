var re = React.createElement;

DaybreakComponents.registerComponent(class DaybreakPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			actionLog: [],
			layout: null
		};

        this.KC3NetworkListeners = {
            GameStart: data => {}
        }
    }

    componentDidMount() {
        
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

        if (!this.state.myKcServerHost) {
			let host = (new KC3Server()).setNum(PlayerManager.hq.server).ip;
			this.setState({myKcServerHost: host ? `http://${host}` : ""});
        }

		// Restore build docks timer if panel reopened, not from game start
		PlayerManager.setBuildDocksByCache();

		// Disable Tab key to prevent it scrolling any window
		// TODO: investigate whether this is really necessary; need tabs in prop editors
		/*
		$(document).on("keydown", function(e){
			if(e.which === 9) {
				e.stopPropagation();
				e.preventDefault();
			}
		});
		*/
		
		// Start Network listener
		KC3Network.initConfigs();
		KC3Network.addGlobalListener(function(event, data){
			let {actionLog} = this.state;
			if (actionLog.length == 10){
				actionLog.splice(0,1);				
			}
			actionLog.push({event, data});
			this.setState({actionLog: [...actionLog]})

			if(typeof this.KC3NetworkListeners[event] != "undefined"){
				this.KC3NetworkListeners[event](data);
			} else {
				console.warn("No event found for keyword", event);
			}
		});
		KC3Network.listen();
		
		// Attempt to activate game on inspected window
		(new RMsg("service", "activateGame", {
			tabId: chrome.devtools.inspectedWindow.tabId
		})).execute();
    }

    render() {
		let {layout} = this.state;
		if (!layout) {
			layout = {
				name: "",
				unsaved: true,
				definition: DaybreakComponents.GridPanel.sampleElement
			};
		}

		const dbRoot = re(DaybreakComponents.DaybreakLayoutRoot, {
			layout,
			data:{...this.state}
		});
		return dbRoot;
    }
});
