import safePreset from './safe.mjs';

/**
 * A safe preset for AMP pages (https://www.ampproject.org)
 */ var ampSafe = {
    ...safePreset,
    collapseBooleanAttributes: {
        amphtml: true
    },
    minifyJs: false
};

export { ampSafe as default };
