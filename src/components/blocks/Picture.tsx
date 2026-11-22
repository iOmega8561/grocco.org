/** An image with an optional dark-scheme variant, chosen by the browser. */
export function Picture({ src, srcDark, alt, className }: { src: string; srcDark?: string; alt: string; className?: string }) {
  return (
    <picture>
      {srcDark && <source srcSet={srcDark} media="(prefers-color-scheme: dark)" />}
      <img className={className} src={src} alt={alt} loading="lazy" decoding="async" />
    </picture>
  );
}
