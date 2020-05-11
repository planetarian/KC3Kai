var re = React.createElement;

DaybreakComponents.registerComponent(class GridPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addingRow: 0,
            addingColumn: 0,
            resizingElementId: 0
        };
    }

    static getMetadata() {
        return {
            category: "layout",
            hasChildren: true
        }
    }

    getProperties() {
        const element = this.props && this.props.element;
        const exampleColRowValues = "'auto', '1fr', '50px', 'minmax(30px, 90px)', 'repeat(3, 50pt)'";
        const properties = [
            {
                name: 'columns',
                description: "CSS description of the columns in this grid.",
                examples: exampleColRowValues,
                value: element && element.properties.columns,
                type: 'array',
                arrayType: 'text',
                arrayMinItems: 1,
                arrayMaxItems: 20,
                defaultValue: ['auto'],
                defaultItemValue: 'auto'
            },
            {
                name: 'rows',
                description: "CSS description of the rows in this grid.",
                examples: exampleColRowValues,
                value: element && element.properties.rows,
                type: 'array',
                arrayType: 'text',
                arrayMinItems: 1,
                arrayMaxItems: 20,
                defaultValue: ['auto'],
                defaultItemValue: 'auto'
            }
        ];
        return properties;
    }

    validateProperties(properties) {
        const {element} = this.props;
        const maxCol = element.children && element.children.length > 0
            && Math.max.apply(null, element.children.map(c =>
                c.containerProps.layout.c + c.containerProps.layout.w - 1))
            || 0;
        const maxRow = element.children && element.children.length > 0
            && Math.max.apply(null, element.children.map(c =>
                c.containerProps.layout.r + c.containerProps.layout.h - 1))
            || 0;
        
        const badProps = [];
        if (maxCol > properties.find(p => p.name === 'columns').value.length) {
            badProps.push('columns');
        }
        if (maxRow > properties.find(p => p.name === 'rows').value.length) {
            badProps.push('rows');
        }
        return badProps;
    }

    handleElementDragStart = (ev, elementId) => {
        const {element, editor} = this.props;
        const child = element.children.filter(c => c.elementId == elementId)[0];
        /*
        const newChildren = [...children.filter(c => c.elementId != elementId)];
        this.setState({children: newChildren});
        */
        editor.onDragElement(ev, this.props.elementId, elementId, child.containerProps);
    };

    handleElementDrop = containerProps => {
        this.props.editor.onDropElement(this.props.elementId, containerProps);
    };

    handleBeginAddElement = containerProps => {
        this.props.editor.onBeginAddElement(this.props.elementId, containerProps);
    }

    handleResizeHandlePointerDown = (ev, elementId) => {        
        ev.stopPropagation();
        const panel = ev.target.closest('.db-gridpanel');
        panel.setPointerCapture(ev.pointerId);

        const {editor} = this.props;
        const cl = this.props.element.children.find(c => c.elementId === elementId).containerProps.layout;
        this.setState({resizingElementId: elementId, resizingCol: cl.c + cl.w - 1, resizingRow: cl.r + cl.h - 1});
        editor.incEdits();
    }

    handleResizeHandlePointerMove = ev => {
        ev.stopPropagation();
        if (!this.props.editor.editMode) {
            return;
        }
        const {resizingElementId, resizingCol, resizingRow} = this.state;
        if (!resizingElementId) {
            return;
        }

        this.mousePos = {left: ev.clientX, top: ev.clientY};
        
        const grid = ev.target;
        if (!grid.classList.contains('db-gridpanel')) {
            return;
        }
        
        let newX = ev.clientX;
        let newY = ev.clientY;

        const gridElement = this.props.element;
        const resizingElement = gridElement.children.filter(c => c.elementId === resizingElementId)[0];
        const childCols = resizingElement.containerProps.layout.w;
        const childRows = resizingElement.containerProps.layout.h;

        // first col/row occupied by this element
        const startColHeaderRect = this.placeholders[this.resizeMinC][0].getBoundingClientRect();
        const startRowHeaderRect = this.placeholders[0][this.resizeMinR].getBoundingClientRect();
        
        // current last col/row occupied by this element
        const endColHeaderRect = this.placeholders[this.resizeMinC+childCols-1][0].getBoundingClientRect();
        const endRowHeaderRect = this.placeholders[0][this.resizeMinR+childRows-1].getBoundingClientRect();
        // max col/row we can possibly resize to
        const maxColHeaderRect = this.placeholders[this.resizeMaxC][0].getBoundingClientRect();
        const maxRowHeaderRect = this.placeholders[0][this.resizeMaxR].getBoundingClientRect();

        //const diffX = endColHeaderRect.width - startColHeaderRect.width;
        //const diffY = endRowHeaderRect.height - startRowHeaderRect.height;

        const minX = startColHeaderRect.x + startColHeaderRect.width;
        const maxX = maxColHeaderRect.x + maxColHeaderRect.width;
        const minY = startRowHeaderRect.y + startRowHeaderRect.height;
        const maxY = maxRowHeaderRect.y + maxRowHeaderRect.height;

        newX = Math.min(maxX, Math.max(minX, ev.clientX));
        newY = Math.min(maxY, Math.max(minY, ev.clientY));

        let newC = this.resizeMinC;
        let newR = this.resizeMinR;

        for (let c = this.resizeMinC; c <= this.resizeMaxC; c++) {
            const thisC = this.placeholders[c][0];
            const thisRect = thisC.getBoundingClientRect();
            if (thisRect.x + thisRect.width >= newX) {
                newC = c;
                break;
            }
        }

        for (let r = this.resizeMinR; r <= this.resizeMaxR; r++) {
            const thisR = this.placeholders[0][r];
            const thisRect = thisR.getBoundingClientRect();
            if (thisRect.y + thisRect.height >= newY) {
                newR = r;
                break;
            }
        }

        if ((newC != resizingCol || newR != resizingRow) && this.placeholders[newC] && this.placeholders[newC][newR]) {
            this.setState({resizingCol: newC, resizingRow: newR});
        }

        // This item
        const item = grid.querySelector(`:scope > .db-gridpanel-child-${this.resizeMinC}-${this.resizeMinR}`);
        item.style.marginRight = `${(endColHeaderRect.x + endColHeaderRect.width) - newX}px`;
        item.style.marginBottom = `${(endRowHeaderRect.y + endRowHeaderRect.height) - newY}px`;
    }

    handleResizeHandlePointerUp = (ev) => {
        ev.stopPropagation();
        ev.target.releasePointerCapture(ev.pointerId);
        const {resizingElementId} = this.state;
        if (!resizingElementId) {
            return;
        }
        const grid = ev.target;
        const item = grid.querySelector(`:scope > .db-gridpanel-child-${this.resizeMinC}-${this.resizeMinR}`);
        item.style.marginRight = null;
        item.style.marginBottom = null;
        const width = this.state.resizingCol + 1 - this.resizeMinC;
        const height = this.state.resizingRow + 1 - this.resizeMinR;


        const {element, editor} = this.props;
        const child = element.children.find(c => c.elementId == resizingElementId);
        const index = element.children.indexOf(child);
        const containerProps = {...child.containerProps};
        containerProps.layout = {...containerProps.layout};
        containerProps.layout.w = width;
        containerProps.layout.h = height;

        editor.onApplyContainerProps(element, index, containerProps);

        this.setState({resizingElementId: 0});
        this.props.editor.decEdits();
    }

    render() {
        const {element, editor} = this.props;
        const {resizingElementId, resizingCol, resizingRow} = this.state;

        const childEls = [];

        // record a placeholder cell in the placeholders table for use when resizing
        const setPlaceholder = (r, c, el) => {
            if (this.placeholders == null) {
                this.placeholders = [];
            }
            if (this.placeholders[c] == null) {
                this.placeholders[c] = [];
            }
            this.placeholders[c][r] = el;
        }
        // generate a header cell
        const getMeasureCell = (r, c, content) => {
            const className = classNames(
                'db-gridpanel-head',
                `db-gridpanel-head-${c}-${r}`,
                {
                    'db-gridpanel-head-col': r === 0,
                    'db-gridpanel-head-row': c === 0,
                }
            );
            const cMeasProps = {
                className,
                style: {gridArea: `${r+1} / ${c+1} / ${r+2} / ${c+2}`},
                ref: el => setPlaceholder(r,c,el)
            };
            return re('div', cMeasProps, re('span', {}, content));
        };

        if (editor.editMode) {
            const lProps = element.properties;
            const resizeTable = [];
            
            if (resizingElementId) {
                var child = element.children.find(c => c.elementId === resizingElementId);
                if (!child) {
                    console.debug(`Child id ${resizingElementId} not found!`);
                    return;
                }
                this.resizeMaxC = this.resizeMinC = child.containerProps.layout.c;
                this.resizeMaxR = this.resizeMinR = child.containerProps.layout.r;
            }

            for (let c = 0; c < lProps.columns.length + 1; c++) {
                resizeTable[c] = [];
                for (let r = 0; r < lProps.rows.length + 1; r++) {

                    // skip the upper-left corner
                    if (c === 0 && r === 0) continue;
    
                    // generate column measurers
                    if (r === 0) {
                        childEls.push(getMeasureCell(0, c, element.properties.columns[c-1]));
                        continue;
                    }

                    // generate row measurers
                    if (c === 0) {
                        childEls.push(getMeasureCell(r, 0, element.properties.rows[r-1]));
                        continue;
                    }

                    // get elements that overlap this space
                    const existing = element.children && element.children.filter(child => {
                            const {layout} = child.containerProps;
                            return c >= layout.c && c < layout.c + layout.w &&
                                r >= layout.r && r < layout.r + layout.h;
                        }) || [];
                    const adding = editor.addingToElementId
                            && editor.addingContainerProps.layout.c === c
                            && editor.addingContainerProps.layout.r === r;
                    if (existing.length > 1) {
                        console.debug(`Found more than one element at ${c},${r}`);
                        return;
                    }
                    const elementAt = existing.length == 1 ? existing[0].elementId : 0;

                    // when resizing, draw resize placeholders
                    if (resizingElementId) {
                        if (!adding && (!elementAt || elementAt === resizingElementId)) {
                            if ((c === this.resizeMinC || resizeTable[c-1][r])
                            && (r === this.resizeMinR || resizeTable[c][r-1])) {
                                // max col/row we can possibly resize to
                                this.resizeMaxC = Math.max(this.resizeMaxC, c);
                                this.resizeMaxR = Math.max(this.resizeMaxR, r);
                                
                                // resizeTable contains all cells we can resize to without elements overlapping
                                resizeTable[c][r] = true;

                                // cells we can resize to will have a slight highlight
                                const resizeTarget = re('div', {
                                    className: classNames(
                                        'db-gridpanel-resizegrid',
                                        {
                                            // cells that will be filled based on the current resize dimensions
                                            'db-gridpanel-resizegrid-active': resizingCol >= c && resizingRow >= r
                                        }
                                    ),
                                    style: {
                                        gridArea: `${r+1} / ${c+1} / ${r+2} / ${c+2}`
                                    },
                                    ref: el => setPlaceholder(r,c,el)
                                });
                                childEls.push(resizeTarget);
                            }
                        }
                    }
                    // when not resizing draw new/drag placeholders
                    else {
                        // Skip grid locations where components are already present
                        if (existing.length > 0) {
                            continue;
                        }

                        // Set placeholders in all empty grid locations to accept dropped components
                        const cProps = {
                            editor,
                            className: 'db-gridpanel-target db-gridpanel-target-placeholder',
                            containerProps: {layout: {r, c, w:1, h:1}},
                            onElementDrop: this.handleElementDrop,
                            onBeginAddElement: this.handleBeginAddElement,
                            style: {
                                gridArea: `${r+1} / ${c+1} / ${r+2} / ${c+2}`
                            }};
                        const container = re(DaybreakComponents.DaybreakContainer, cProps);
                        childEls.push(container);
                    }
                }
            }
        }

        // Draw the actual contained elements
        element.children && element.children.forEach(child => {
            const cl = child.containerProps.layout;

            let handle = null;
            // Draw resize handles
            if (editor.editMode) {
                const cProps = {
                    className: 'db-gridpanel-child-resizehandle',
                    onPointerDown: ev => this.handleResizeHandlePointerDown(ev, child.elementId)
                };
                handle = re('div', cProps);
            }

            // Draw child element container
            const cProps = {
                className: classNames(
                    'db-gridpanel-child',
                    `db-gridpanel-child-${cl.c}-${cl.r}`,
                ),
                style: {
                    gridArea: `${cl.r+1} / ${cl.c+1} / ${(cl.r+1)+(cl.h||1)} / ${(cl.c+1)+(cl.w||1)}`
                },
                elementId: child.elementId,
                element: editor.getElement(child.elementId),
                containerProps: child.containerProps,
                editor,
                onElementDragStart: this.handleElementDragStart};
            const container = re(DaybreakComponents.DaybreakContainer, cProps, handle);
            childEls.push(container);
        });

        // Create the GridPanel element itself
        const panel = re('div', {
            className: classNames('db-gridpanel', element.className, {
                'db-gridpanel-resizing': resizingElementId
            }),
            style: {
                gridTemplate: `fit-content(10pt) ${element.properties.rows.join(' ')} / fit-content(10pt) ${element.properties.columns.join(' ')}`
            },
            onPointerMove: ev => this.handleResizeHandlePointerMove(ev),
            onPointerUp: ev => this.handleResizeHandlePointerUp(ev)
        }, childEls);
        return panel;
    }

    static sampleElement = {
        component: "GridPanel",
        className: "rootGridPanel",
        properties: {
            columns: ["auto", "auto"],
            rows: ["auto"]
        },
        children: [
            {
                containerProps: {
                    layout: {c:1, r:1, w:1, h:1}
                },
                element: {
                    component: "GridPanel",
                    className: "mygridpanel",
                    properties: {
                        columns: ["auto","auto","auto","auto"],
                        rows: ["auto","auto","auto"]
                    },
                    children: [
                        {
                            containerProps: {
                                layout: {c: 1, r: 1, w: 1, h: 1}
                            },
                            element: {
                                component: "HelloWorld",
                                className: "hello1"
                            }
                        },
                        {
                            containerProps: {
                                layout: {c: 2, r: 2, w: 2, h: 1},
                            },
                            element: {
                                component: "ActionLogViewer",
                                className: "actionLog"
                            }
                        }
                    ]
                }
            }
        ]
	};
});
