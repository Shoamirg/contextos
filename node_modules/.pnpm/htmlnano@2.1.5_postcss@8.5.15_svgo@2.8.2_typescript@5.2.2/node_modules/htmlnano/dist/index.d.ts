import PostHTML from 'posthtml';
import { MinifyOptions } from 'terser';
import { Options } from 'cssnano';
import { Config } from 'svgo';

type PostHTMLTreeLike = [PostHTML.Node] & PostHTML.NodeAPI & {
    options?: {
        quoteAllAttributes?: boolean | undefined;
    } | undefined;
    render(): string;
    render(node: PostHTML.Node | PostHTMLTreeLike, renderOptions?: any): string;
};
type MaybeArray<T> = T | Array<T>;
type PostHTMLNodeLike = PostHTML.Node | string;
interface HtmlnanoOptions {
    skipConfigLoading?: boolean;
    skipInternalWarnings?: boolean;
    collapseAttributeWhitespace?: boolean;
    collapseBooleanAttributes?: {
        amphtml?: boolean;
    };
    collapseWhitespace?: 'conservative' | 'all' | 'aggressive';
    custom?: MaybeArray<(tree: PostHTMLTreeLike, options?: any) => (PostHTML.Node | PostHTMLTreeLike)>;
    deduplicateAttributeValues?: boolean;
    minifyUrls?: URL | string | false;
    mergeStyles?: boolean;
    mergeScripts?: boolean;
    minifyCss?: Options | boolean;
    minifyConditionalComments?: boolean;
    minifyJs?: MinifyOptions | boolean;
    minifyJson?: boolean;
    minifySvg?: Config | boolean;
    normalizeAttributeValues?: boolean;
    removeAttributeQuotes?: boolean;
    removeComments?: boolean | 'safe' | 'all' | RegExp | ((comment: string) => boolean);
    removeEmptyAttributes?: boolean;
    removeRedundantAttributes?: boolean;
    removeOptionalTags?: boolean;
    removeUnusedCss?: boolean;
    sortAttributes?: boolean | 'alphabetical' | 'frequency';
    sortAttributesWithLists?: boolean | 'alphabetical' | 'frequency';
}
interface HtmlnanoPreset extends Omit<HtmlnanoOptions, 'skipConfigLoading'> {
}
type HtmlnanoPredefinedPreset = 'safe' | 'ampSafe' | 'max';
type HtmlnanoPredefinedPresets = Record<HtmlnanoPredefinedPreset, HtmlnanoPreset>;
type HtmlnanoOptionsConfigFile = Omit<HtmlnanoOptions, 'skipConfigLoading'> & {
    preset?: HtmlnanoPredefinedPreset;
};
type HtmlnanoModuleAttrsHandler = (attrs: Record<string, string | boolean | void>, node: PostHTML.Node) => Record<string, string | boolean | void>;
type HtmlnanoModuleContentHandler = (content: Array<PostHTMLNodeLike>, node: PostHTML.Node) => MaybeArray<PostHTMLNodeLike>;
type HtmlnanoModuleNodeHandler = (node: PostHTMLNodeLike) => PostHTML.Node | string;
type OptionalOptions<T> = T extends boolean | string | Function | number | null | undefined ? T : T extends object ? Partial<T> : T;
type HtmlnanoModule<Options = any> = {
    onAttrs?: (options: Partial<HtmlnanoOptions>, moduleOptions: OptionalOptions<Options>) => HtmlnanoModuleAttrsHandler;
    onContent?: (options: Partial<HtmlnanoOptions>, moduleOptions: OptionalOptions<Options>) => HtmlnanoModuleContentHandler;
    onNode?: (options: Partial<HtmlnanoOptions>, moduleOptions: OptionalOptions<Options>) => HtmlnanoModuleNodeHandler;
    default?: (tree: PostHTMLTreeLike, options: Partial<HtmlnanoOptions>, moduleOptions: OptionalOptions<Options>) => PostHTMLTreeLike | Promise<PostHTMLTreeLike>;
};

declare function loadConfig(options?: HtmlnanoOptions, preset?: HtmlnanoPreset, configPath?: string): [Partial<HtmlnanoOptions>, HtmlnanoPreset];
declare const htmlnano: ((optionsRun?: HtmlnanoOptions, presetRun?: HtmlnanoPreset) => PostHTML.Plugin<never>) & {
    presets: HtmlnanoPredefinedPresets;
    getRequiredOptionalDependencies: typeof getRequiredOptionalDependencies;
    process: typeof process;
    htmlMinimizerWebpackPluginMinify: typeof htmlMinimizerWebpackPluginMinify;
    loadConfig: typeof loadConfig;
};
declare function getRequiredOptionalDependencies(optionsRun: HtmlnanoOptions, presetRun: HtmlnanoPreset): string[];
declare function process(html: string, options?: HtmlnanoOptions, preset?: HtmlnanoPreset, postHtmlOptions?: PostHTML.Options): Promise<PostHTML.Result<unknown>>;
declare function htmlMinimizerWebpackPluginMinify(input: {
    [file: string]: string;
}, minimizerOptions?: HtmlnanoOptions): Promise<{
    code: string;
}>;

export { htmlnano as default, getRequiredOptionalDependencies, htmlMinimizerWebpackPluginMinify, loadConfig, process };
export type { HtmlnanoModule, HtmlnanoModuleAttrsHandler, HtmlnanoModuleContentHandler, HtmlnanoModuleNodeHandler, HtmlnanoOptions, HtmlnanoOptionsConfigFile, HtmlnanoPredefinedPreset, HtmlnanoPredefinedPresets, HtmlnanoPreset, PostHTMLNodeLike, PostHTMLTreeLike };
