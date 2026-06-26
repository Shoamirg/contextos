Object.defineProperty(exports, '__esModule', { value: true });

var collapseAttributeWhitespace_js = require('./collapseAttributeWhitespace.js');

/** Deduplicate values inside list-like attributes (e.g. class, rel) */ const mod = {
    onAttrs () {
        return (attrs)=>{
            const newAttrs = attrs;
            Object.keys(attrs).forEach((attrName)=>{
                if (!collapseAttributeWhitespace_js.attributesWithLists.has(attrName)) {
                    return;
                }
                if (typeof attrs[attrName] !== 'string') {
                    return;
                }
                const attrValues = attrs[attrName].split(/\s/);
                const uniqeAttrValues = new Set();
                const deduplicatedAttrValues = [];
                attrValues.forEach((attrValue)=>{
                    if (!attrValue) {
                        // Keep whitespaces
                        deduplicatedAttrValues.push('');
                        return;
                    }
                    if (uniqeAttrValues.has(attrValue)) {
                        return;
                    }
                    deduplicatedAttrValues.push(attrValue);
                    uniqeAttrValues.add(attrValue);
                });
                newAttrs[attrName] = deduplicatedAttrValues.join(' ');
            });
            return newAttrs;
        };
    }
};

exports.default = mod;
