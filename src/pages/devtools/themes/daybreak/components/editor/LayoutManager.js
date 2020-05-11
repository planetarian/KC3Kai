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
            selectedLayout: props.editor.currentLayout,
            layoutName: props.editor.currentLayout.name
        };
    }

    static getMetadata() {
        return {
            category: "layout",
            hasChildren: false
        }
    }

    // functions

    handleSelectedLayoutChanged = ev => {
        const selectedLayout = this.props.editor.allLayouts.find(l => l.name === ev.target.value);
        this.props.editor.applyLayout(selectedLayout.name);
        //this.setState({selectedLayout});
    };

    handleEditClick = ev => {
        this.props.editor.onChangeEditMode();
    };

    handleDeleteClick = ev => {
        this.props.editor.deleteLayout(this.state.selectedLayout.name);
    };

    handleNewClick = ev => {
        const layoutNameBase = "New Layout";
        let i = 0;
        const getLayoutName = (base, i) => {
            return base + (i > 0 ? ` ${i}` : '');
        }
        let finalName = getLayoutName(layoutNameBase, i);
        while (this.props.editor.allLayouts.find(l => l.name === finalName)) {
            i++;
            finalName = getLayoutName(layoutNameBase, i);
        }
        this.setState({layoutName: finalName});
        this.props.editor.onChangeEditMode();
    }

    applyLayout = layoutName => {
        this.props.editor.applyLayout(layoutName);
    };

    handleLayoutNameChanged = ev => {
        this.setState({layoutName: this.state.layoutName})
    };

    handleSaveClick = ev => {
        this.props.editor.saveLayout(this.state.layoutName);
    };

    handleResetClick = ev => {
        this.props.editor.applyLayout(this.state.selectedLayout.name);
    };



    render() {
        const {editor} = this.props;
        

        const children = [];

        if (editor.editMode) {
            children.push(re('span', {}, `current: ${this.state.selectedLayout.name}`));
        }
        else {
            children.push(re('select', {onChange: this.handleSelectedLayoutChanged},
                editor.allLayouts.map(l => re('option', {selected: l.name === this.state.selectedLayout.name}, l.name))
            ))
        }

        children.push(re('button', {onClick: this.handleEditClick}, editor.editMode ? 'editing' : 'edit'));

        if (editor.editMode) {
            children.push(re('span', {}, 'Name:'))
            children.push(re('input', {value: this.state.layoutName, onChange: this.handleLayoutNameChanged}));
            children.push(re(DaybreakComponents.ConfirmButton, {onClick: this.handleSaveClick}, 'save'));
            children.push(re(DaybreakComponents.ConfirmButton, {onClick: this.handleResetClick}, 'reset'));
        }
        else {
            children.push(re(DaybreakComponents.ConfirmButton, {onClick: this.handleDeleteClick}, 'delete'));
            children.push(re('button', {onClick: this.handleNewClick}, 'new'));
        }
        
        const panel = re('div', {className: 'db-root-controls'}, children);

        return panel;
    }
});