var re = React.createElement;

DaybreakComponents.registerComponent(class ComponentEditor extends React.Component {
	constructor(props) {
        super(props);
        this.getState(props);
    }

    componentWillReceiveProps(nextProps) {
        this.getState(nextProps);
    }

    getState = props => {
		this.state = {
            element: props.element,
            elementClass: props.element && props.element.className,
            properties: props.properties && [...props.properties] || [],
            position: 'right',
            badProps: []
        };
    }

    handleComponentChange = ev => {
    	const selectedComponent = ev.target.selectedOptions[0].value;
        const comp = DaybreakComponents[selectedComponent];
        let componentProperties = [];
        if (selectedComponent && comp && typeof comp.prototype.getProperties === 'function') {
            componentProperties = comp.prototype.getProperties();
            componentProperties.forEach(prop => prop.value = prop.defaultValue);
        }
        const newElement = {
            component: selectedComponent,
            className: '',
            properties: []
        };
        componentProperties.forEach(prop => newElement.properties[prop.name] = prop.value);
        this.setState({
            selectedComponent,
            element: newElement,
            elementClass: newElement.className,
            properties: [...componentProperties]
        });
    };

    handleInput = (name, value) => {
        const newProperties = [...this.state.properties];
        const pIndex = newProperties.indexOf(newProperties.find(p => p.name === name));
        if (pIndex < 0) {
            console.debug(`Couldn't find property ${name}!`);
            return;
        }
        // create a copy of the property and set its value
        const newProperty = {...newProperties[pIndex]};
        newProperty.value = value;
        // splice the copy into the state properties
        newProperties[pIndex] = newProperty;
        this.setState({properties: newProperties});
    };

    handleOnClassChanged = (value) => {
        this.setState({elementClass: value});
    }

    needsConfirmation = () => {
        const {properties} = this.props;
        return !properties || !properties.every(prop => {
           const newProp = this.state.properties.find(p => p.name === prop.name);

           if (prop.type === 'array' && prop.value.length !== undefined) {
               // check array lengths
               if (prop.value.length != newProp.value.length) {
                   return false;
               }
               // check each array element
               for (let i = 0; i < prop.value.length; i++) {
                   if (prop.value[i] !== newProp.value[i]) {
                       return false;
                   }
               }
               return true;
           }
           else {
               // check non-array value
               return prop.value === newProp.value;
           }
       }); 
    };

    handleApply = () => {
        const {onApply, editingComponent} = this.props;
        const {element, elementClass, properties} = this.state;
        
        if (editingComponent && typeof editingComponent.validateProperties === 'function') {
            const badProps = editingComponent.validateProperties(properties);
            if (badProps.length > 0) {
                this.setState({badProps});
                return;
            }
            else if (badProps.length > 0) {
                this.setState({badProps: []});
            }
        }

        onApply(element, elementClass, properties);
    };
    
	render() {
        const {onCancel, addNew} = this.props;
        const {element, properties, badProps, elementClass} = this.state;

        const formChildren = [];

        if (addNew) {
            const components = DaybreakComponents.getCategories();
            formChildren.push(re('select', {
                size: 20,
                onChange: this.handleComponentChange
            }, components.map(ct =>
                re('optgroup', {label: ct.name}, ct.components.map(cm =>
                    re('option', {}, cm.name)
                ))
            )));
        }

        if (element) {
            formChildren.push(
                re('h3', {}, element.component),
                re(DaybreakComponents.PropertyField, {
                    name: 'className',
                    value: elementClass,
                    type: 'class',
                    isValidLive: true,
                    onChanged: (n,v) => this.handleOnClassChanged(v)
                })
            );
        }

        formChildren.push(properties.map(p =>
            re(DaybreakComponents.PropertyField, {
                ...p,
                isValidLive: !badProps.includes(p.name),
                onChanged: this.handleInput
            })
        ));

        const panel = re('div', {className: 'db-properties-editor-content'},
            re('div', {className: 'db-properties-editor-form'},
                re('form', {
                    onSubmit: this.handleApply,
                    onKeyDown: ev => {
                        if (ev.keyCode === 13) {
                            this.handleApply();
                        }
                    }
                }, formChildren)
            ),
            re('div', {className: 'db-properties-editor-controls'},
                re('button', {onClick: this.handleApply}, 'Apply'),
                re('button', {onClick: () => {this.setState({
                    properties: [...this.props.properties],
                    elementClass: element.className
                })}}, 'Reset'),
                re(DaybreakComponents.ConfirmButton, {
                    onClick: onCancel,
                    needsConfirmation: this.needsConfirmation
                }, 'Cancel'),
            )
        );
        return panel;
	}
});
