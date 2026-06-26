Object.defineProperty(exports, '__esModule', { value: true });

const ampBoilerplateAttributes = [
    'amp-boilerplate',
    'amp4ads-boilerplate',
    'amp4email-boilerplate'
];
function isAmpBoilerplate(node) {
    if (!node.attrs) {
        return false;
    }
    for (const attr of ampBoilerplateAttributes){
        if (attr in node.attrs) {
            return true;
        }
    }
    return false;
}
function isComment(content) {
    if (typeof content === 'string') {
        return content.trim().startsWith('<!--');
    }
    return false;
}
function isConditionalComment(content) {
    const clean = (content || '').trim();
    return clean.startsWith('<!--[if') || clean === '<!--<![endif]-->';
}
function isStyleNode(node) {
    return node.tag === 'style' && !isAmpBoilerplate(node) && 'content' in node && node.content && node.content.length > 0;
}
function extractCssFromStyleNode(node) {
    return Array.isArray(node.content) ? node.content.join(' ') : node.content;
}
function isEventHandler(attributeName) {
    return attributeName && attributeName.slice(0, 2).toLowerCase() === 'on' && attributeName.length >= 5;
}
function extractTextContentFromNode(node) {
    if (!node.content) {
        return '';
    }
    if (!Array.isArray(node.content)) {
        return '';
    }
    let content = '';
    for (const child of node.content){
        if (typeof child === 'string') {
            content += child;
        }
    }
    return content;
}
async function optionalImport(moduleName) {
    try {
        const module = await import(moduleName);
        return module.default || module;
    } catch (e) {
        if (typeof e === 'object' && e && 'code' in e && (e.code === 'MODULE_NOT_FOUND' || e.code === 'ERR_MODULE_NOT_FOUND')) {
            return null;
        }
        throw e;
    }
}

exports.extractCssFromStyleNode = extractCssFromStyleNode;
exports.extractTextContentFromNode = extractTextContentFromNode;
exports.isAmpBoilerplate = isAmpBoilerplate;
exports.isComment = isComment;
exports.isConditionalComment = isConditionalComment;
exports.isEventHandler = isEventHandler;
exports.isStyleNode = isStyleNode;
exports.optionalImport = optionalImport;
