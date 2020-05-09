var re = React.createElement;

DaybreakComponents.registerComponent(class PropertyGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {expanded: true};
    }
    
	render() {
        const {name, properties} = props;
        const {expanded} = state;

        const children = [
            re('div', {
                className: 'db-property-group-header',
                onClick: () => this.setState({expanded: !expanded})
            }, name)
        ];

        if (expanded) {
            properties.forEach(property => {
                const {name, value} = property;
                children.push(re(PropertyField, {name, value}));
            });
        }

        return re(React.Fragment, {}, children);
	}
});
