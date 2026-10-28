import type { CSSProperties } from "react";
import Image from "next/image";
import "./home.css"; // provides the .imagePlaceholder styles wherever this is used

type Props = {
  src: string | null;
  alt: string;
  size?: number; // the image box is size × size pixels...
  width?: number; // ...unless a width and/or height is given
  height?: number;
  // "fill" (the default) stretches the whole photo to exactly fit the box: nothing
  // is cropped and there's no empty space, but photos whose shape differs a lot
  // from the box look squeezed or stretched.
  // "contain" shows the whole photo at its true shape and may leave empty space.
  // "cover" fills the box at the true shape and trims whatever sticks out.
  fit?: "fill" | "contain" | "cover";
};

// Shows the product's image from /public in a box of a fixed shape, whatever
// the size or shape of the original file, or a labelled placeholder when the
// product has no image path. On narrow screens the box shrinks, keeping its shape.
export default function ProductImage({
  src,
  alt,
  size = 120,
  width = size,
  height = size,
  fit = "fill",
}: Props) {
  const box: CSSProperties = {
    width,
    maxWidth: "100%",
    height: "auto",
    aspectRatio: `${width} / ${height}`,
  };

  if (!src) {
    return (
      <div className="imagePlaceholder" role="img" aria-label={alt} style={box}>
        <span>{alt}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        ...box,
        position: "relative",
        overflow: "hidden",
        borderRadius: 8,
        // Only "contain" can leave empty space; give it a faint tint so the space
        // looks like part of a tidy tile.
        background:
          fit === "contain" ? "color-mix(in srgb, currentColor 8%, transparent)" : undefined,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${width}px`}
        style={{ objectFit: fit }}
      />
    </div>
  );
}
