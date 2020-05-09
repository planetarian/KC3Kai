var re = React.createElement;

// HelloWorld is a simple test component.
DaybreakComponents.registerComponent(class HelloWorld extends React.Component {
	constructor(props) {
		super(props);
		this.state = {intro: "Hello, world!", date: new Date()};
	}

    static getMetadata() {
        return {
            category: "game"
        }
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
		const {intro, date} = this.state;
		const className = classNames('db-hello', this.props.className);
		return re('div', {className}, `${intro} ${date}`);
	}
});
