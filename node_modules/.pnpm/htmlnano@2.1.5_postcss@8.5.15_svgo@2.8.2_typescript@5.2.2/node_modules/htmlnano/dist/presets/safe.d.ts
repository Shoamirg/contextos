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

declare const _default: HtmlnanoPreset;

export { _default as default };
