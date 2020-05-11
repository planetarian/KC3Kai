var re = React.createElement;

DaybreakComponents.registerComponent(class DaybreakPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			actionLog: [],
			allLayouts: [],
			currentLayout: {
				name: "Empty Layout",
				isSystemLayout: true,
				definition: {
					component: "HelloWorld"
				}
			}
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
		KC3Network.addGlobalListener((event, data) => {
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

		this.applyCurrentLayout();
	}

	getDefaultLayouts = () => [
		{
			name: "Daybreak",
			isSystemLayout: true,
			unsaved: false,
			definition: DaybreakComponents.GridPanel.sampleElement
		}
	];

	getLayouts = () => {
		if (!ConfigManager.pan_db_layouts) {
			ConfigManager.pan_db_layouts = [];
		}
		return this.getDefaultLayouts().concat(ConfigManager.pan_db_layouts);
	}

	// Get the currently-selected layout and apply it
	applyCurrentLayout = () => {
		ConfigManager.loadIfNecessary();
		let layoutName = ConfigManager.pan_db_layout_sm || "Daybreak";
		this.applyLayout(layoutName);
	}
	
	// load the layout with the given name and apply it
	applyLayout = layoutName => {
		ConfigManager.loadIfNecessary();

		const layouts = this.getLayouts();
		let layout = null;
		layout = layouts.find(l => l.name === layoutName);
		if (!layout) {
			throw new Error(`Layout ${layoutName} does not exist.`);
		}

		if (this.state.currentLayout !== layout) {
			ConfigManager.pan_db_layout_sm = layoutName;
			ConfigManager.save();
		}

		this.setState({
			allLayouts: layouts,
			currentLayout: layout
		});
	}

	// Save a layout with the given name
	saveLayout = (layoutName, layoutDefinition) => {
		ConfigManager.loadIfNecessary();
		const layouts = this.getLayouts();
		const existing = layouts.find(l => l.name === layoutName);
		if (existing && existing.isSystemLayout) {
			throw new Error(`${layoutName} is a system layout and cannot be modified. Please choose a different name.`);
		}
		if (existing) {
			const idx = ConfigManager.pan_db_layouts.indexOf(existing);
			ConfigManager.pan_db_layouts.splice(idx, 1);
		}

		ConfigManager.pan_db_layouts.push({
			name: layoutName,
			isSystemLayout: false,
			definition: layoutDefinition
		});
		
		ConfigManager.save();
	}

	deleteLayout = layoutName => {
		ConfigManager.loadIfNecessary();
		const layouts = getLayouts();
		const existing = layouts.find(l => l.name === layoutName);
		if (!existing) {
			throw new Error(`Layout ${layoutName} does not exist.`);
		}
		else if (existing.isSystemLayout) {
			throw new Error(`${layoutName} is a system layout and cannot be modified/deleted.`);
		}

		const idx = ConfigManager.pan_db_layouts.indexOf(existing);
		ConfigManager.pan_db_layouts.splice(idx, 1);

		ConfigManager.save();
	}

    render() {
		const {currentLayout} = this.state;
		const {allLayouts} = this.state;

		const layoutSystem = {
			allLayouts,
			currentLayout,
			applyLayout: this.applyLayout,
			saveLayout:this.saveLayout,
			deleteLayout: this.deleteLayout
		};

		const dbRoot = re(DaybreakComponents.DaybreakLayoutRoot, {
			layoutSystem,
			data:{...this.state}
		});
		return dbRoot;
    }
});
