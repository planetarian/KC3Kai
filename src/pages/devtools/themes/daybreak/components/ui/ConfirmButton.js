var re = React.createElement;

DaybreakComponents.registerComponent(class ConfirmButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {doConfirm: false};
    }

    handleClick = ev => {
        const {needsConfirmation} = this.props;
        if (typeof needsConfirmation === 'function' && !needsConfirmation()) {
            this.confirmClick(ev);
            return;
        }
        this.setState({doConfirm: true});
    };

    confirmClick = ev => {
        const {onClick} = this.props;
        if (!onClick) {
            console.debug('No handler registered!');
            return;
        }
        this.setState({doConfirm: false});
        onClick(ev);
    };

    cancelClick = () => {
        this.setState({doConfirm: false});
    };

    render() {
        const {children, onPointerDown, onPointerMove, onPointerUp} = this.props;
        const {doConfirm} = this.state;

        const ctlChildren = [];
        
        if (!children) {
            console.debug('No children provided!');
            return re('span', {}, '[ConfirmButton error]');
        }

        if (!doConfirm) {
            ctlChildren.push(re('button', {onClick: this.handleClick}, children));
        } else {
            ctlChildren.push(re('span', {className: 'db-confirmbutton-controls'},
                re('span', {}, children + ':'),
                re('button', {onClick: this.confirmClick}, '✓'),
                re('button', {onClick: this.cancelClick}, '🗙')
            ));
        }
        return re('span', {className: 'db-confirmbutton', onPointerDown, onPointerMove, onPointerUp}, ctlChildren);
    }
});
