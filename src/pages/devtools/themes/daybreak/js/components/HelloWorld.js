

	var re = React.createElement;

	class HelloWorld extends React.Component {
		constructor(props) {
			super(props);
			this.state = {intro: "Hello, world!", date: new Date()};
		}
		componentDidMount() {
			this.timerID = setInterval(() => this.tick(), 1000);
		}
		componentWillUnmount() {
			clearInterval(this.timerID);
		}
		tick() {
			this.setState({date: new Date()});
		}
		render() { 
			return re(DaybreakElement, null, `${this.state.intro} ${this.state.date}`);
		}
	}