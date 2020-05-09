var re = React.createElement;

// DaybreakElement is the base container for all configurable display components.
// It provides the aspects necessary for components to be rearranged and edited.
DaybreakComponents.registerComponent(class DaybreakElement extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	handleTitleButtonDown = ev => {
		// prevent clicking the edit button from being interpreted as a title drag action
		ev.stopPropagation();
	};

	handleEditClick = ev => {
		//ev.stopPropagation();
		if (!this.element.getProperties) return;
		const properties = this.element.getProperties();
		
		const {element, editor} = this.props;
		editor.onEditElement(element, [...properties], this.element);
	};

	handleDeleteClick = ev =>  {
		this.props.editor.onDeleteElement(this.props.elementId);
	}

	render() {
		const {elementId, element, editor, onElementDragStart, onPointerUp} = this.props;
		const children = [];
		const component = DaybreakComponents.getComponent(element.component);
		const content = re(component, {ref: el => {this.element = el;}, elementId, element, editor}, null);

		// Title + drag handle
		if (editor.editMode) {
			const titleChildren = [
				re('span', {}, `${element.component}:${element.className}`)
			];
			const editingThis = editor.editingElement && editor.editingElement.id === elementId;
			if (component.prototype.getProperties && editor.canEdit && !editor.editingElement || editingThis) {
				titleChildren.push(re('button', {
					onPointerDown: this.handleTitleButtonDown,
					onClick: this.handleEditClick,
					className: 'db-title-editbutton'
				}, editingThis ? 'editing' : 'edit'));
			}
			if (editor.canEdit && !editor.editingElement) {

				titleChildren.push(re(DaybreakComponents.ConfirmButton, {
					onPointerDown: this.handleTitleButtonDown,
					onClick: this.handleDeleteClick
				}, '❌'));
			}
			const titleEl = re('div', {
					className:`db-title`,
					onPointerDown: ev => onElementDragStart(ev, elementId)
				}, titleChildren
			);
			children.push(titleEl);
		
			children.push(re('div', {className:'db-content'}, content));
		}

		const elContent = editor.editMode ? children : content;
		const dbElement = re('div', {className:'db-element', onPointerUp}, elContent);
		return dbElement;
	}
});
