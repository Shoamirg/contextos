Object.defineProperty(exports, '__esModule', { value: true });

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

exports.default = mod;
