var re = React.createElement;

// DaybreakLayoutRoot is the root container of all Daybreak components.
// It should contain a DaybreakPanel as well as any non-user-configurable elements.
DaybreakComponents.registerComponent(class DaybreakLayoutRoot extends React.Component {
    constructor(props) {
        super(props);
        this.getState(props);
    }

    componentWillReceiveProps(newProps) {
        this.getState(newProps);
    }

    getState = props => {
        const currentLayoutName = this.state && this.state.currentLayoutName;
        const flattened = this.state && this.state.flattened;

        this.state = {
            unsaved: props.layoutSystem.currentLayout.unsaved,
            editMode: false,
            draggingId: null,
            editingCount: 0,
            currentLayoutName: props.layoutSystem.currentLayout.name,
            flattened
        };

        // rebuild flat layout if the layout has changed
        if (currentLayoutName != props.layoutSystem.currentLayout.name) {
            this.state.flattened = this.getFlattenedLayout(props.layoutSystem.currentLayout.definition);
        }
    }

    getFlattenedLayout = layout => {
        const flat = {};
        let i = 0;
        const walkLayout = el => {
            i++;
            flat[i] = {
                id: i,
                component: el.component,
                className: el.className,
                properties: el.properties,
            }
            const flatEl = flat[i];
            if (el.children && el.children.length) {
                flatEl.children = [];
                el.children.forEach(child => {
                    flatEl.children.push({
                        containerProps: child.containerProps,
                        elementId: walkLayout(child.element)
                    });
                });
            }
            return flatEl.id;
        };
        walkLayout(layout);

        return flat;
    };

    getTreeLayout = flat => {
        const buildTree = el => {
            const element = {
                component: el.component,
                className: el.className,
                properties: el.properties,
            }
            if (el.children && el.children.length) {
                element.children = [];
                const {children} = element;
                el.children.forEach(child =>  {
                    children.push({
                        containerProps: child.containerProps,
                        element: buildTree(flat[child.elementId])
                    })
                });
            }
            return element;
        };
        const tree = buildTree(flat[Object.keys(flat)[0]]);
        return tree;
    };

    getElement = id => this.state.flattened[id];

    handleChangeEditMode = e => {
        this.setState({
            editMode:!this.state.editMode,
            editingElement: null,
            editingProperties: null,
            editingElementComponent: null
        });
    };

    handleEditElement = (element, properties, elementComponent) => {
        this.setState({
            editingCount: this.state.editingCount + 1,
            editingElement: element,
            editingProperties: properties,
            editingElementComponent: elementComponent
        });
    };

    handleApplyProperties = (element, className, properties) => {
        properties.forEach(p => {
            element.properties[p.name] = p.value;
        });
        element.className = className;
        this.setState({
            unsaved: true,
            editingCount: this.state.editingCount - 1,
            editingElement: null,
            editingProperties: null,
            editingElementComponent: null
        });
    };

    handleApplyContainerProps = (element, childIndex, containerProps) => {
        const child = element.children[childIndex];
        child.containerProps = {...containerProps};
        this.setState({unsaved: true});
    };

    handleCancelEdit = () => {
        this.setState({
            editingCount: this.state.editingCount - 1,
            editingElement: null,
            editingProperties: null,
            editingElementComponent: null
        });
    };

	componentDidMount() {
        document.addEventListener('pointermove', this.handleOnPointerMove);
	}
	componentWillUnmount() {
        document.removeEventListener('pointermove', this.handleOnPointerMove);
    }
    handleOnPointerMove = ev => {
        this.mousePos = {left: ev.clientX, top: ev.clientY};
        const {draggingFrom} = this.state;
        if (!draggingFrom || !draggingFrom.elementId) {
            return;
        }
        this.updateDragPreview(ev);
    }

    updateDragPreview = ev => {
        const preview = document.querySelector('.db-root-dragpreview');

        if (preview) {
            preview.style.left = `${ev.clientX}px`;
            preview.style.top = `${ev.clientY}px`;
        }
    }

    handleDragElement = (ev, ownerId, elementId, containerProps) => {
        const {draggingFrom} = this.state;
        if (draggingFrom != null) return;

        const owner = this.state.flattened[ownerId];
        const {children} = owner;
        const child = children.filter(c => c.elementId == elementId)[0];
        const index = children.indexOf(child);
        children.splice(index, 1);
        this.setState({
            flattened: {...this.state.flattened},
            draggingFrom: {ownerId, elementId, containerProps}
        });
        this.updateDragPreview(ev);
    };

    deleteElement = elementId => {
        const {flattened} = this.state;
        const element = flattened[elementId];

        // Delete this element's children first
        if (element.children) {
            element.children.forEach(c => {
                this.deleteElement(c.elementId);
            });
        }

        // Update any elements containing this element
        Object.keys(flattened).forEach(id => {
            const el = flattened[id];
            if (!el.children) {
                return;
            }
            el.children = el.children.filter(c => c.elementId != elementId);
        });

        delete flattened[elementId];
    }

    handleBeginAddElement = (elementId, containerProps) => {
        console.debug('adding element?');
        this.setState({
            editingCount: this.state.editingCount + 1,
            addingToElementId: elementId,
            addingContainerProps: containerProps
        });
    };

    handleAddElement = (element, className, properties) => {
        const {flattened, addingToElementId, addingContainerProps, editingCount} = this.state;
        const newId = Math.max.apply(null, Object.keys(flattened)) + 1;
        properties.forEach(p => {
            element.properties[p.name] = p.value;
        });
        element.className = className;
        flattened[newId] = element;
        const el = flattened[addingToElementId];
        if (!el.children) {
            el.children = [];
        }
        el.children.push({
            containerProps: {...addingContainerProps},
            elementId: newId
        });
        this.setState({
            unsaved: true,
            editingCount: editingCount - 1,
            addingToElementId: null,
            addingContainerProps: null
        });
    };

    handleCancelAdd = () => {
        this.setState({
            editingCount: this.state.editingCount - 1,
            addingToElementId: null,
            addingContainerProps: null
        });
    };

    handleDeleteElement = elementId => {
        this.deleteElement(elementId);
        this.setState({flattened: {...this.state.flattened}});
    };

    handleDropElement = (ownerId, containerProps) =>  {
        const {flattened, draggingFrom} = this.state;
        const owner = flattened[ownerId];
        if (!owner.children) {
            owner.children = [];
        }
        owner.children.push({
            containerProps,
            elementId: draggingFrom.elementId
        });
        this.setState({
            flattened: {...this.state.flattened},
            draggingFrom: null
        });
    };

    handleSwapElements = (id1, id2) => {
        const {flattened} = this.state;
        const el1 = flattened[id1];
        const el2 = flattened[id2];
        console.debug(`${id1}<->${id2}`);
    };

    incEdits = () => {
        this.setState({editingCount: this.state.editingCount+1});
    };

    decEdits = () => {
        this.setState({editingCount: this.state.editingCount-1});
    };

    render() {
        const {layoutSystem} = this.props;
        const {
            flattened, editMode, draggingFrom,
            editingElement, editingProperties, editingElementComponent,
            addingToElementId, addingContainerProps,
            editingCount, unsaved
        } = this.state;

        // TODO: handle case where flattened is empty
        const keys = Object.keys(flattened);
        const rootEl = keys.length > 0 ? flattened[keys[0]] : null;

        const editor = {
            allLayouts: layoutSystem.allLayouts,
            currentLayout: layoutSystem.currentLayout,

            saveLayout: name => layoutSystem.saveLayout(name, this.getTreeLayout(flattened)),
            applyLayout: layoutSystem.applyLayout,
            deleteLayout: layoutSystem.deleteLayout,

            editMode: editMode,
            getElement: this.getElement,
            editingElement, editingProperties,
            addingToElementId, addingContainerProps,
            draggingFrom,
            unsaved,

            canEdit: editingCount === 0,
            incEdits: this.incEdits,
            decEdits: this.decEdits,

            onChangeEditMode: this.handleChangeEditMode,

            onDragElement: this.handleDragElement,
            onDropElement: this.handleDropElement,
            draggingFrom,

            onBeginAddElement: this.handleBeginAddElement,
            onDeleteElement: this.handleDeleteElement,

            onMoveElement: this.handleMoveElement,
            onSwapElements: this.handleSwapElements,

            onEditElement: this.handleEditElement,
            onApplyProperties: this.handleApplyProperties,
            onApplyContainerProps: this.handleApplyContainerProps,
            
        };

        const onElementDragStart = () => console.debug("Can't drag the root element.");
        const onBeginAddElement = () => console.debug("Handle internal elements first kthx");
        const className = classNames('db-root-panel', {'editmode': editMode});
        const children = [
            // Generic container which will hold the first element in the tree
            re(DaybreakComponents.DaybreakContainer, {
                editor,
                elementId: rootEl ? rootEl.id : null,
                element: rootEl,
                onElementDragStart,
                onBeginAddElement
            }),
        ];
        
        // Backup layout manager to be rendered if one hasn't been added to the layout itself
        const hasLayoutManager = Object.keys(flattened)
            .some(e => flattened[e].component === 'LayoutManager');
        if (!hasLayoutManager) {
            children.push(re(DaybreakComponents.LayoutManager, {editor}));
        }
        
        // Properties editor, appears when you click the 'edit' button on an element
        if (editingElement) {
            children.push(re(DaybreakComponents.ModalDockPanel, {},
                re(DaybreakComponents.ComponentEditor, {
                    element: editingElement,
                    properties: editingProperties,
                    editingComponent: editingElementComponent,
                    onApply: this.handleApplyProperties,
                    onCancel: this.handleCancelEdit
                })
            ));
        };

        // New element picker, appears when you click an empty element container
        if (addingToElementId) {
            children.push(re(DaybreakComponents.ModalDockPanel, {},
                re(DaybreakComponents.ComponentEditor, {
                    addNew: true,
                    onApply: this.handleAddElement,
                    onCancel: this.handleCancelAdd
                })
            ));
        }

        // If we're dragging an element around, draw a preview element that follows the mouse
        if (draggingFrom && draggingFrom.elementId) {
            const draggingEl = flattened[draggingFrom.elementId];
            const dragPreviewContent = `${draggingEl.component}:${draggingEl.className}`;
            const dragPreview = re('div', {
                className: 'db-root-dragpreview',
                style: {left: this.mousePos.left, top: this.mousePos.top}
            }, dragPreviewContent);
            children.push(dragPreview);
        }

        const panel = re('div', {className}, children);

        return panel;
    }
});
