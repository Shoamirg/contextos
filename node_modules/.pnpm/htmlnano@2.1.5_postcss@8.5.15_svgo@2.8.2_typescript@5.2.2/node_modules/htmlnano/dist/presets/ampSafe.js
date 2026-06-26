Object.defineProperty(exports, '__esModule', { value: true });

var safePreset = require('./safe.js');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var safePreset__default = /*#__PURE__*/_interopDefault(safePreset);

/**
 * A safe preset for AMP pages (https://www.ampproject.org)
 */ var ampSafe = {
    ...safePreset__default.default,
    collapseBooleanAttributes: {
        amphtml: true
    },
    minifyJs: false
};

exports.default = ampSafe;
