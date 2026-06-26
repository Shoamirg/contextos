import safePreset from './safe.mjs';

/**
 * Maximal minification (might break some pages)
 */ var max = {
    ...safePreset,
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

export { max as default };
