class DaybreakComponents {

    static loadComponentsAsync(components) {
        return Promise.all(components.map(name => DaybreakComponents.loadComponentAsync(name)));
    }

    static loadComponentAsync(name) {
        return new Promise (resolve => {
            if (DaybreakComponents[name]) {
                const errMsg = `Component ${name} appears to already be loaded.`;
                console.error(errMsg);
                throw new Error(errMsg);
            }

            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.type = 'text/css';
            style.href = `components/${name}.css`;
            document.head.appendChild(style);

            const script = document.createElement('script');
            script.onload = () => {
                const component = DaybreakComponents[name];
                resolve({name, component});
            };
            script.type = 'text/javascript';
            script.src = `components/${name}.js`;
            document.head.appendChild(script);
        });
    }

    static registerComponent(componentClass) {
        DaybreakComponents[componentClass.name] = componentClass;
        if (componentClass.getMetadata) {
            const meta = componentClass.getMetadata();
            if (meta.category) {
                if (!DaybreakComponents.categories) {
                    DaybreakComponents.categories = [];
                }
                
                let category = DaybreakComponents.categories.find(c => c.name == meta.category);
                if (!category) {
                    category = {
                        name: meta.category,
                        components: []
                    };
                    DaybreakComponents.categories.push(category);
                }

                category.components.push(componentClass);
            }
        }
    }

    static getCategories() {
        if (!DaybreakComponents.categories) {
            DaybreakComponents.categories = [];
        }
        return DaybreakComponents.categories;
    }

    static getComponent(name) {
        if (!Object.keys(DaybreakComponents).includes(name)) {
            const errMsg = `No such component ${name}`;
            console.error(errMsg);
            throw new Error(errMsg);
        }

        return DaybreakComponents[name];
    }


}
