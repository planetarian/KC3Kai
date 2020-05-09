var re = React.createElement;

DaybreakComponents.registerComponent(class ActionLogViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    static getMetadata() {
        return {
            category: "game"
        }
    }

    render() {
        return re('div', {className: 'db-actionlog'}, 'Action Log');
    }
});
