import Link from "next/link";
import type { ProductSummary } from "@/lib/db/products";
import { formatPrice } from "@/lib/format";
import "./home.css"; // provides the .productCard styles wherever this is used
import ProductImage from "./product-image";

type Props = {
  product: Pick<ProductSummary, "id" | "name" | "price" | "imagePath">;
};

// One clickable product tile: image, name, and price.
export default function ProductCard({ product }: Props) {
  return (
    <Link className="productCard" href={`/products/${product.id}`}>
      <ProductImage src={product.imagePath} alt={product.name} />
      <span className="productTitle">{product.name}</span>
      <span className="productPrice">{formatPrice(product.price)}</span>
    </Link>
  );
}
