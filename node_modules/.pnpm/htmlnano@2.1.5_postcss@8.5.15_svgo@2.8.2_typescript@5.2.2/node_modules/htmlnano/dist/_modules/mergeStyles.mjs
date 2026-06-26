import { isAmpBoilerplate, extractTextContentFromNode } from '../helpers.mjs';

/* Merge multiple <style> into one */ const mod = {
    default (tree) {
        const styleNodes = {};
        tree.match({
            tag: 'style'
        }, (node)=>{
            if (typeof node !== 'object' || !node.tag || !node.content) return node;
            const nodeAttrs = node.attrs || {};
            // Skip <style scoped></style>
            // https://developer.mozilla.org/en/docs/Web/HTML/Element/style
            //
            // Also skip SRI, reasons are documented in "minifyJs" module
            if ('scoped' in nodeAttrs || 'integrity' in nodeAttrs) {
                return node;
            }
            if (isAmpBoilerplate(node)) {
                return node;
            }
            const styleType = nodeAttrs.type || 'text/css';
            const styleMedia = nodeAttrs.media || 'all';
            const styleKey = styleType + '_' + styleMedia;
            if (styleKey in styleNodes) {
                var _styleNodes_styleKey;
                const styleContent = extractTextContentFromNode(node);
                var _content;
                (_content = (_styleNodes_styleKey = styleNodes[styleKey]).content) != null ? _content : _styleNodes_styleKey.content = [];
                styleNodes[styleKey].content.push(' ' + styleContent);
                return ''; // Remove node
            }
            node.content = node.content || [];
            styleNodes[styleKey] = node;
            return node;
        });
        return tree;
    }
};

export { mod as default };
