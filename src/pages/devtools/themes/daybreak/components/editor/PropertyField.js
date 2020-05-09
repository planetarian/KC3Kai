var re = React.createElement;

DaybreakComponents.registerComponent(class PropertyField extends React.Component {
	constructor(props) {
        super(props);
        /*
        props: {
            name: 'propertyName',
            value: propertyValue,
            type: text|number|bool|select|array|class,
            options: [
                'option1',
                'option2'
            ],
            defaultValue: defaultValue,
            defaultItemValue: defaultItemValue,
            handleInput: function(name, value)
        }
         */
        const {value, type, arrayType, options} = props;
		this.state = {
            isValid: props.isValidLive && this.validateInput(value, type, arrayType, options)
        };
    }

    validateInput = (value, type, arrayType, options) => {
        const valueType = typeof value;
        switch (type) {
            case 'text':
                return valueType === 'number' || valueType === 'string';
            case 'number':
                return valueType === 'number' || !isNaN(Number.parseFloat(value));
            case 'class':
                // Valid css class names
                const regex = /^-?(?:[_a-z]|(?![\u0000-\u0239]).*|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])(?:[_a-z0-9-]|(?![\u0000-\u0239]).*|\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f])*$/i;
                //const regex = new RegExp('^' + regexWord.source + '(?: +' + regexWord.source + ')*$');
                //const regex = /^[_a-zA-Z][_a-zA-Z0-9\-]+(?: [_a-zA-Z][_a-zA-Z0-9\-]+)*$/i;
                value = value.trim();
                const valueSplit = value.split(' ');
                return value.length === 0 || valueSplit.every(v => regex.test(v) && !v.startsWith('db-'));
            case 'bool':
            case 'boolean':
                return valueType === 'boolean' || value === 'true' || value === 'false';
            case 'array':
                return valueType === 'object' &&
                    typeof value.length === 'number' &&
                    value.every(v => this.validateInput(v, arrayType, null, options));
            case 'select':
                return options.includes(value);
            default:
                break;
        }
    };

    handleInput = value => {
        // Perform validation
        const {name, type, arrayType, options, onChanged} = this.props;

        const isValid = this.validateInput(value, type, arrayType, options);
        this.setState({isValid});
        
        if (typeof onChanged === 'function') {
            onChanged(name, value);
        }
        else {
            console.debug('No handler for changed value!');
        }
    };

    
    updateArrValueAt = (oldArr, i, v, onChanged) => {
        const newArr = [...oldArr];
        newArr[i] = v;
        onChanged(newArr);
    };
    
    removeArrValueAt = (oldArr, i, onChanged) => {
        const newArr = [...oldArr];
        newArr.splice(i, 1);
        onChanged(newArr);
    };

    addArrValueAt = (oldArr, i, onChanged) => {
        const newArr = [...oldArr];
        newArr.splice(i, 0, this.props.defaultItemValue);
        onChanged(newArr);
    };

    getControl = (value, type, arrayType, arrayMinItems, arrayMaxItems, options, onChanged) => {
        let control = null;
        switch (type) {
            case 'text':
            case 'number':
            case 'class':
                control = re('input', {type: 'text', value, onChange: ev => onChanged(ev.target.value)});
                break;
            case 'bool':
            case 'boolean':
                control = re('input', {type: 'checkbox', value, onChange: ev => onChanged(ev.target.value)});
                break;
            case 'array':
                const inputs = (value || []).map((p, i) => {
                    const oldArr = value;
                    const buttons = [];
                    if (oldArr.length > arrayMinItems) {
                        buttons.push(re('button', {type: 'button', title: 'Remove this item', onClick: () => this.removeArrValueAt(oldArr, i, onChanged)}, '❌'));
                    }
                    if (oldArr.length < arrayMaxItems) {
                        buttons.push(re('button', {type: 'button', title: 'Add item below this', onClick: () => this.addArrValueAt(oldArr, i+1, onChanged)}, '➕'));
                    }

                    return re('div', {}, this.getControl(p, arrayType, null, null, null, options, v => this.updateArrValueAt(oldArr, i, v, onChanged)), buttons);
                });
                control = re('div', {className: 'db-property-field-array-container'}, inputs);
                break;
            case 'select':
                break;
            default:
                break;
        }
        return control;
    }
    
	render() {
        const {
            name, value, type, arrayType, arrayMinItems, arrayMaxItems,
            options, description, examples, isValidLive
        } = this.props;
        const {isValid} = this.state;

        const titleText = description + (examples && examples.length ? `\ne.g. ${examples}` : '');
        const titleChildren = [re('span', {}, name)];
        if (type === 'array') {
            titleChildren.push(re('button', {type: 'button', onClick: () => this.addArrValueAt(value, 0, this.handleInput)}, '➕'));
        }

        const children = [
            re('div', {className: 'db-property-field-header', title: titleText}, titleChildren),
            re('div', {className: 'db-property-field-value'},
                this.getControl(value, type, arrayType, arrayMinItems, arrayMaxItems, options, this.handleInput)
            )
        ];

        if (!isValid || !isValidLive) {
            children.push(re('div', {className: 'db-property-field-invalid'}, '⚠️'));
        }

        return re('div', {className: 'db-property-field'}, children);
	}
});
