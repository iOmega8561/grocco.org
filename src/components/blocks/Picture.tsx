import { useColorScheme } from "../../lib/colorScheme";

/**
 * An image with an optional dark-scheme variant. The browser chooses it from the reader's setting,
 * unless a theme forces a scheme: then the matching file is used directly.
 */
export function Picture({ src, srcDark, alt, className }: { src: string; srcDark?: string; alt: string; className?: string }) {
  const { dark, forced } = useColorScheme();
  if (forced) {
    return <img className={className} src={dark && srcDark ? srcDark : src} alt={alt} loading="lazy" decoding="async" />;
  }
  return (
    <picture>
      {srcDark && <source srcSet={srcDark} media="(prefers-color-scheme: dark)" />}
      <img className={className} src={src} alt={alt} loading="lazy" decoding="async" />
    </picture>
  );
}
