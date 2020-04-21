	var re = React.createElement;

	class DaybreakPanel extends React.Component {
		constructor(props) {
			super(props);
			this.state = {};
		}
		render() {
			return re('div', null, this.props.children);
		}
	}