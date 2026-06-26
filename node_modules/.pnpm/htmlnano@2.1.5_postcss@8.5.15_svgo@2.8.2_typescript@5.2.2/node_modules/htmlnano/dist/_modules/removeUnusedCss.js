Object.defineProperty(exports, '__esModule', { value: true });

var helpers_js = require('../helpers.js');

// These options must be set and shouldn't be overriden to ensure uncss doesn't look at linked stylesheets.
const uncssOptions = {
    ignoreSheets: [
        /\s*/
    ],
    stylesheets: []
};
function processStyleNodeUnCSS(html, styleNode, uncssOptions, uncss) {
    const css = helpers_js.extractCssFromStyleNode(styleNode);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- uncss no types
    return runUncss(html, css, uncssOptions, uncss).then((css)=>{
        // uncss may have left some style tags empty
        if (css.trim().length === 0) {
            // @ts-expect-error -- explicitly remove the tag
            styleNode.tag = false;
            styleNode.content = [];
            return;
        }
        styleNode.content = [
            css
        ];
    });
}
function runUncss(html, css, userOptions, uncss) {
    if (typeof userOptions !== 'object') {
        userOptions = {};
    }
    const options = {
        ...userOptions,
        ...uncssOptions
    };
    return new Promise((resolve, reject)=>{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- we dont have uncss types
        options.raw = css;
        uncss(html, options, (error, output)=>{
            if (error) {
                reject(error);
                return;
            }
            resolve(output);
        });
    });
}
const purgeFromHtml = function(tree) {
    // content is not used as we can directly used the parsed HTML,
    // making the process faster
    const selectors = [];
    tree.walk((node)=>{
        const classes = node.attrs && node.attrs.class && node.attrs.class.split(' ') || [];
        const ids = node.attrs && node.attrs.id && node.attrs.id.split(' ') || [];
        selectors.push(...classes, ...ids);
        if (node.tag) {
            selectors.push(node.tag);
        }
        return node;
    });
    return ()=>selectors;
};
function processStyleNodePurgeCSS(tree, styleNode, purgecssOptions, purgecss) {
    const css = helpers_js.extractCssFromStyleNode(styleNode);
    return runPurgecss(tree, css, purgecssOptions, purgecss).then((css)=>{
        if (css.trim().length === 0) {
            // @ts-expect-error -- explicitly remove the tag
            styleNode.tag = false;
            styleNode.content = [];
            return;
        }
        styleNode.content = [
            css
        ];
    });
}
function runPurgecss(tree, css, userOptions, purgecss) {
    if (typeof userOptions !== 'object') {
        userOptions = {};
    }
    const options = {
        ...userOptions,
        content: [
            {
                raw: tree.render(),
                extension: 'html'
            }
        ],
        css: [
            {
                raw: css,
                // @ts-expect-error -- old purgecss options
                extension: 'css'
            }
        ],
        extractors: [
            {
                extractor: purgeFromHtml(tree),
                extensions: [
                    'html'
                ]
            }
        ]
    };
    return new purgecss.PurgeCSS().purge(options).then((result)=>{
        return result[0].css;
    });
}
/** Remove unused CSS */ const mod = {
    async default (tree, options, userOptions) {
        const promises = [];
        let html;
        const purgecss = await helpers_js.optionalImport('purgecss');
        const uncss = await helpers_js.optionalImport('uncss');
        tree.walk((node)=>{
            if (helpers_js.isStyleNode(node)) {
                if (userOptions.tool === 'purgeCSS') {
                    if (purgecss) {
                        promises.push(processStyleNodePurgeCSS(tree, node, userOptions, purgecss));
                    }
                } else {
                    if (uncss) {
                        html != null ? html : html = tree.render(tree);
                        promises.push(processStyleNodeUnCSS(html, node, userOptions, uncss));
                    }
                }
            }
            return node;
        });
        return Promise.all(promises).then(()=>tree);
    }
};

exports.default = mod;
