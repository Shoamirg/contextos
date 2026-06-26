/** Meta-module that runs custom modules */ const mod = {
    default: function custom(tree, options, customModules) {
        if (!customModules) {
            return tree;
        }
        if (!Array.isArray(customModules)) {
            customModules = [
                customModules
            ];
        }
        customModules.forEach((customModule)=>{
            if (customModule) {
                tree = customModule(tree, options);
            }
        });
        return tree;
    }
};

export { mod as default };
