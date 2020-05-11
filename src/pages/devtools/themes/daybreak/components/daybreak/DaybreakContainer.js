var re = React.createElement;

// DaybreakContainer is a generic container for user-configurable layout components.
// Each DaybreakContainer directly contains only a single child component.
// A component may have multiple DaybreakContainers to hold multiple child components.
DaybreakComponents.registerComponent(class DaybreakContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	onPointerEnter = ev => {
		ev.target.classList.add('db-container-droptarget-over');
	};

	onPointerLeave = ev => {
		ev.target.classList.remove('db-container-droptarget-over');
	};

	onPointerUp = ev => {
		const {elementId, editor, onElementDrop, onBeginAddElement, containerProps} = this.props;
		if (editor.draggingFrom && editor.draggingFrom.elementId) {
			if (editor.draggingFrom.elementId === elementId) {
				return;
			}
			ev.stopPropagation();
			onElementDrop(containerProps);
		}
		else if (!elementId && editor.canEdit) {
			// only placeholders should have this function available
			if (onBeginAddElement) {
				onBeginAddElement(containerProps);
			}
		}
	};

	render() {
		const {elementId, element, style, editor, onElementDragStart} = this.props;
		let child = null;
		if (element && element.component){
			const childProps = {
				elementId, element, editor,
				onElementDragStart,
				//onPointerUp: this.onPointerUp
			};
			child = re(DaybreakComponents.DaybreakElement, childProps);
		}
		else if (editor.editMode && !editor.addingToElementId) {
			const placeholderProps = {
				className: 'db-container-droptarget',
				onPointerEnter: this.onPointerEnter,
				onPointerLeave: this.onPointerLeave,
				onPointerUp: this.onPointerUp
			};
			child = re('div', placeholderProps);
		}
		const className = classNames('db-container', this.props.className);
		return re('div', {className, style}, child, this.props.children);
	}
});
