import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/db/products";
import { formatPrice } from "@/lib/format";
import ProductImage from "../../product-image";
import AddToCart from "./add-to-cart";
import "./product.css";

// Reads from the database, so render on each request (not at build time).
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

// Only accept plain positive whole numbers that fit in a Postgres INTEGER
// (up to 9 digits), so junk like "abc" or "99999999999" becomes a clean 404
// instead of a database error.
function parseId(raw: string): number | null {
  if (!/^\d{1,9}$/.test(raw)) return null;
  const id = Number(raw);
  return id > 0 ? id : null;
}

export async function generateMetadata(
  props: Props
): Promise<Metadata> {
  const { id: rawId } = await props.params;
  const id = parseId(rawId);
  const product = id === null ? null : await getProductById(id);

  if (!product) return { title: "Product not found | Food & More Store" };
  return {
    title: `${product.name} | Food & More Store`,
    description: product.description ?? undefined,
  };
}

export default async function ProductPage(props: Props) {
  const { id: rawId } = await props.params;
  const id = parseId(rawId);
  if (id === null) notFound();

  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="productPage">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true"> / </span>
        <span>{product.categoryName}</span>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="productDetail">
        <div className="productDetailImage">
          <ProductImage src={product.imagePath} alt={product.name} size={420} />
        </div>

        <div className="productDetailInfo">
          <h2>{product.name}</h2>
          <p className="productDetailPrice">{formatPrice(product.price)}</p>
          <p className="productDescription">
            {product.description ?? "No description available yet."}
          </p>

          {product.isAgeRestricted && (
            <p className="ageNotice">You must be 21 or older to buy this item.</p>
          )}

          <AddToCart productId={product.id} productName={product.name} price={product.price} />
        </div>
      </div>
    </div>
  );
}
