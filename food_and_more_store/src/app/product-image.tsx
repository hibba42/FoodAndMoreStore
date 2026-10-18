import Image from "next/image";
import "./home.css"; // provides the .imagePlaceholder styles wherever this is used

type Props = {
  src: string | null;
  alt: string;
  size?: number; // rendered width/height in pixels
};

// Shows the product's image from /public, or a labelled placeholder
// when the product has no image path.
export default function ProductImage({ src, alt, size = 120 }: Props) {
  if (!src) {
    return (
      <div
        className="imagePlaceholder"
        role="img"
        aria-label={alt}
        style={{ width: size, height: size }}
      >
        <span>{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ borderRadius: 8, maxWidth: "100%", height: "auto" }}
    />
  );
}
