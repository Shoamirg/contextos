Object.defineProperty(exports, '__esModule', { value: true });

// Specification: https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// See also: https://github.com/posthtml/posthtml-render/pull/30
// See also: https://github.com/posthtml/htmlnano/issues/6#issuecomment-707105334
/** Disable quoteAllAttributes while not overriding the configuration */ const mod = {
    default: function removeAttributeQuotes(tree) {
        var _tree_options;
        var _quoteAllAttributes;
        if (tree.options) (_quoteAllAttributes = (_tree_options = tree.options).quoteAllAttributes) != null ? _quoteAllAttributes : _tree_options.quoteAllAttributes = false;
        return tree;
    }
};

exports.default = mod;
