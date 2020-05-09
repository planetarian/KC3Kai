var re = React.createElement;

DaybreakComponents.registerComponent(class ModalDockPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            position: 'right'
        };
    }

    render() {
        const {className, children} = this.props;
        const {position} = this.state;

        const style = {};
        style[position] = 0;
        const fillDirection = position == 'top' || position == 'bottom' ? 'width' : 'height';
        style[fillDirection] = '100%';


        const panel = re('div', {className: classNames('db-modaldockpanel', className), style},
            re('div', {className: 'db-modaldockpanel-content'}, children),
            re('button', {
                className: 'db-button-dock-up',
                onClick: () => this.setState({position: 'top'}),
                style: position == 'top' ? {display: 'none'} : null
            }, re('span', {}, '⏶')),
            re('button', {
                className: 'db-button-dock-left',
                onClick: () => this.setState({position: 'left'}),
                style: position == 'left' ? {display: 'none'} : null
            }, re('span', {}, '⏴')),
            re('button', {
                className: 'db-button-dock-right',
                onClick: () => this.setState({position: 'right'}),
                style: position == 'right' ? {display: 'none'} : null
            }, re('span', {}, '⏵')),
            re('button', {
                className: 'db-button-dock-down',
                onClick: () => this.setState({position: 'bottom'}),
                style: position == 'bottom' ? {display: 'none'} : null
            }, re('span', {}, '⏷')),
        );        
        return panel;
    }
});