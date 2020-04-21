	var re = React.createElement;

	class DaybreakElement extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
                name: 'element',
                category: 'uncategorized'
            };
		}
		render() {
			return re('div', null, this.props.children);
		}
	}