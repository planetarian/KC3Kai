var re = React.createElement;

DaybreakComponents.registerComponent(class LayoutManager extends React.Component {
	constructor(props) {
        super(props);
        this.getState(props);
    }

    componentWillReceiveProps(nextProps) {
        this.getState(nextProps);
    }

    getState = props => {
		this.state = {
        };
    }

    static getMetadata() {
        return {
            category: "layout",
            hasChildren: false
        }
    }

    render() {
        const {editor} = this.props;
        
        const rootControls = [
            re('button', {onClick:editor.onChangeEditMode}, `edit mode ${editor.editMode ? 'on' : 'off'}`)
        ];
        if (editor.unsaved){
            rootControls.push(re('button', {onClick:this.saveLayout}, 'save'));
        }
        const panel = re('div', {className: 'db-root-controls'}, rootControls);

        return panel;
    }
});