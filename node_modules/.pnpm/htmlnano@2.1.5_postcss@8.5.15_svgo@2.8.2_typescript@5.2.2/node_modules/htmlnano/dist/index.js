Object.defineProperty(exports, '__esModule', { value: true });

var posthtml = require('posthtml');
var cosmiconfig = require('cosmiconfig');
var safePreset = require('./presets/safe.js');
var ampSafePreset = require('./presets/ampSafe.js');
var maxPreset = require('./presets/max.js');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var posthtml__default = /*#__PURE__*/_interopDefault(posthtml);
var safePreset__default = /*#__PURE__*/_interopDefault(safePreset);
var ampSafePreset__default = /*#__PURE__*/_interopDefault(ampSafePreset);
var maxPreset__default = /*#__PURE__*/_interopDefault(maxPreset);

const presets = {
    safe: safePreset__default.default,
    ampSafe: ampSafePreset__default.default,
    max: maxPreset__default.default
};
function loadConfig(options, preset, configPath) {
    const { skipConfigLoading = false, ...rest } = options || {};
    let restConfig = rest;
    if (!skipConfigLoading) {
        const explorer = cosmiconfig.cosmiconfigSync('htmlnano');
        const rc = configPath ? explorer.load(configPath) : explorer.search();
        if (rc) {
            const { preset: presetName } = rc.config;
            if (presetName) {
                if (!preset && presetName in presets) {
                    preset = presets[presetName];
                }
                delete rc.config.preset;
            }
            if (!options) {
                restConfig = rc.config;
            }
        }
    }
    return [
        restConfig || {},
        preset || safePreset__default.default
    ];
}
const optionalDependencies = {
    minifyCss: [
        'cssnano',
        'postcss'
    ],
    minifyJs: [
        'terser'
    ],
    minifyUrls: [
        'relateurl',
        'srcset',
        'terser'
    ],
    minifySvg: [
        'svgo'
    ]
};
/**
 * And the old mixing named export and default export again.
 *
 * TL; DR: our bundler has bundled our mixed default/named export module into a "exports" object,
 * and when dynamically importing a CommonJS module using "import" instead of "require", Node.js wraps
 * another layer of default around the "exports" object.
 *
 * The longer version:
 *
 * The bundler we are using outputs:
 *
 * ESM: export { [named], xxx as default }
 * CJS: exports.default = xxx; exports.[named] = ...; exports.__esModule = true;
 *
 * With ESM, the Module object looks like this:
 *
 * ```js
 * Module {
 *   default: xxx,
 *   [named]: ...,
 * }
 * ```
 *
 * With CJS, Node.js handles dynamic import differently. Node.js doesn't respect `__esModule`,
 * and will wrongly treat a CommonJS module as ESM, i.e. assign the "exports" object on its
 * own "default" on the "Module" object.
 *
 * Now we have:
 *
 * ```js
 * Module {
 *   // this is actually the "exports" inside among "exports.__esModule", "exports.[named]", and "exports.default"
 *   default: {
 *     __esModule: true,
 *     // This is the actual "exports.default"
 *     default: xxx
 *   }
 * }
 * ```
 */ const interop = (imported)=>imported.then((mod)=>{
        let htmlnanoModule;
        while('default' in mod){
            htmlnanoModule = mod;
            mod = mod.default;
            // If we find any htmlnano module hook methods, we know this object is a htmlnano module, return directly
            if ('onAttrs' in mod || 'onContent' in mod || 'onNode' in mod) {
                return mod;
            }
        }
        if (htmlnanoModule && typeof htmlnanoModule.default === 'function') {
            return htmlnanoModule;
        }
        throw new TypeError('The imported module is not a valid htmlnano module');
    });
const modules = {
    collapseAttributeWhitespace: ()=>interop(import('./_modules/collapseAttributeWhitespace.js')),
    collapseBooleanAttributes: ()=>interop(import('./_modules/collapseBooleanAttributes.js')),
    collapseWhitespace: ()=>interop(import('./_modules/collapseWhitespace.js')),
    custom: ()=>interop(import('./_modules/custom.js')),
    deduplicateAttributeValues: ()=>interop(import('./_modules/deduplicateAttributeValues.js')),
    // example: () => import('./_modules/example.mjs'),
    mergeScripts: ()=>interop(import('./_modules/mergeScripts.js')),
    mergeStyles: ()=>interop(import('./_modules/mergeStyles.js')),
    minifyConditionalComments: ()=>interop(import('./_modules/minifyConditionalComments.js')),
    minifyCss: ()=>interop(import('./_modules/minifyCss.js')),
    minifyJs: ()=>interop(import('./_modules/minifyJs.js')),
    minifyJson: ()=>interop(import('./_modules/minifyJson.js')),
    minifySvg: ()=>interop(import('./_modules/minifySvg.js')),
    minifyUrls: ()=>interop(import('./_modules/minifyUrls.js')),
    normalizeAttributeValues: ()=>interop(import('./_modules/normalizeAttributeValues.js')),
    removeAttributeQuotes: ()=>interop(import('./_modules/removeAttributeQuotes.js')),
    removeComments: ()=>interop(import('./_modules/removeComments.js')),
    removeEmptyAttributes: ()=>interop(import('./_modules/removeEmptyAttributes.js')),
    removeOptionalTags: ()=>interop(import('./_modules/removeOptionalTags.js')),
    removeRedundantAttributes: ()=>interop(import('./_modules/removeRedundantAttributes.js')),
    removeUnusedCss: ()=>interop(import('./_modules/removeUnusedCss.js')),
    sortAttributes: ()=>interop(import('./_modules/sortAttributes.js')),
    sortAttributesWithLists: ()=>interop(import('./_modules/sortAttributesWithLists.js'))
};
const htmlnano = Object.assign(function htmlnano(optionsRun = {}, presetRun) {
    // eslint-disable-next-line prefer-const -- re-assign options
    let [options, preset] = loadConfig(optionsRun, presetRun);
    const minifier = async (_tree)=>{
        const tree = _tree;
        const nodeHandlers = [];
        const attrsHandlers = [];
        const contentsHandlers = [];
        options = {
            ...preset,
            ...options
        };
        let promise = Promise.resolve(tree);
        for (const [moduleName, moduleOptions] of Object.entries(options)){
            if (!moduleOptions) {
                continue;
            }
            if (!(moduleName in safePreset__default.default)) {
                throw new Error('Module "' + moduleName + '" is not defined');
            }
            if (moduleName in optionalDependencies) {
                const modules = optionalDependencies[moduleName];
                await Promise.all(modules.map(async (dependency)=>{
                    try {
                        await import(dependency);
                    } catch (e) {
                        if (typeof e === 'object' && e !== null && 'code' in e && typeof e.code === 'string') {
                            if (e.code === 'MODULE_NOT_FOUND' || e.code === 'ERR_MODULE_NOT_FOUND') {
                                if (!options.skipInternalWarnings) {
                                    console.warn(`You have to install "${dependency}" in order to use htmlnano's "${moduleName}" module`);
                                    return;
                                }
                            }
                            throw e;
                        }
                    }
                }));
            }
            const mod = moduleName in modules ? await modules[moduleName]() : await import(`./_modules/${moduleName}.mjs`);
            if (typeof mod.onAttrs === 'function') {
                attrsHandlers.push(mod.onAttrs(options, moduleOptions));
            }
            if (typeof mod.onContent === 'function') {
                contentsHandlers.push(mod.onContent(options, moduleOptions));
            }
            if (typeof mod.onNode === 'function') {
                nodeHandlers.push(mod.onNode(options, moduleOptions));
            }
            if (typeof mod.default === 'function') {
                promise = promise.then(async (tree)=>await mod.default(tree, options, moduleOptions));
            }
        }
        if (attrsHandlers.length + contentsHandlers.length + nodeHandlers.length === 0) {
            return promise;
        }
        return promise.then((tree)=>{
            tree.walk((node)=>{
                if (node) {
                    if (node.attrs && typeof node.attrs === 'object') {
                        // Convert all attrs' key to lower case
                        let newAttrsObj = {};
                        Object.entries(node.attrs).forEach(([attrName, attrValue])=>{
                            newAttrsObj[attrName.toLowerCase()] = attrValue;
                        });
                        for (const handler of attrsHandlers){
                            newAttrsObj = handler(newAttrsObj, node);
                        }
                        node.attrs = newAttrsObj;
                    }
                    if (node.content) {
                        node.content = typeof node.content === 'string' ? [
                            node.content
                        ] : node.content;
                        if (Array.isArray(node.content) && node.content.length > 0) {
                            for (const handler of contentsHandlers){
                                var _node_content;
                                const result = handler((_node_content = node.content) != null ? _node_content : [], node);
                                node.content = Array.isArray(result) ? result : [
                                    result
                                ];
                            }
                        }
                    }
                    for (const handler of nodeHandlers){
                        if (handler) {
                            node = handler(node);
                        }
                    }
                }
                return node;
            });
            return tree;
        });
    };
    return minifier;
}, {
    presets,
    getRequiredOptionalDependencies,
    process,
    htmlMinimizerWebpackPluginMinify,
    loadConfig
});
function getRequiredOptionalDependencies(optionsRun, presetRun) {
    const [options] = loadConfig(optionsRun, presetRun);
    return Array.from(Object.keys(options).reduce((acc, moduleName)=>{
        if (moduleName in optionalDependencies) {
            const dependencies = optionalDependencies[moduleName];
            // eslint-disable-next-line @typescript-eslint/unbound-method -- thisArg provided by forEach
            dependencies.forEach(acc.add, acc);
        }
        return acc;
    }, new Set()));
}
function process(html, options, preset, postHtmlOptions) {
    return posthtml__default.default([
        htmlnano(options, preset)
    ]).process(html, postHtmlOptions);
}
// https://github.com/webpack-contrib/html-minimizer-webpack-plugin/blob/faca00f2219514bc671c5942685721f0b5dbaa70/src/utils.js#L74
function htmlMinimizerWebpackPluginMinify(input, minimizerOptions) {
    const [[, code]] = Object.entries(input);
    return process(code, minimizerOptions, presets.safe).then((result)=>{
        return {
            code: result.html
        };
    });
}
if (typeof module !== 'undefined') {
    module.exports = htmlnano;
}

exports.default = htmlnano;
exports.getRequiredOptionalDependencies = getRequiredOptionalDependencies;
exports.htmlMinimizerWebpackPluginMinify = htmlMinimizerWebpackPluginMinify;
exports.loadConfig = loadConfig;
exports.process = process;
