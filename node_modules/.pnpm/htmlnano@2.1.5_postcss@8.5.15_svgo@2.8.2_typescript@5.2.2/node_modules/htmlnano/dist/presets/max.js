Object.defineProperty(exports, '__esModule', { value: true });

var safePreset = require('./safe.js');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var safePreset__default = /*#__PURE__*/_interopDefault(safePreset);

/**
 * Maximal minification (might break some pages)
 */ var max = {
    ...safePreset__default.default,
    collapseWhitespace: 'all',
    removeComments: 'all',
    removeAttributeQuotes: true,
    removeRedundantAttributes: true,
    mergeScripts: true,
    mergeStyles: true,
    removeUnusedCss: {},
    minifyCss: {
        preset: 'default'
    },
    minifySvg: {},
    minifyConditionalComments: true,
    removeOptionalTags: true
};

exports.default = max;
