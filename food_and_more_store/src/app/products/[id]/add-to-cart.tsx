"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";
import { MAX_QTY, MIN_QTY } from "@/lib/cart-limits";
import { formatPrice, lineTotal } from "@/lib/format";

type Props = {
  productId: number;
  productName: string;
  price: string;
};

type Feedback = { kind: "success" | "error"; text: string } | null;

export default function AddToCart({ productId, productName, price }: Props) {
  // Keep the raw text so the field can be cleared while typing.
  const [text, setText] = useState("1");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();

  const parsed = parseInt(text, 10);
  const quantity = Number.isNaN(parsed)
    ? MIN_QTY
    : Math.min(MAX_QTY, Math.max(MIN_QTY, parsed));

  function setQuantity(next: number) {
    setText(String(Math.min(MAX_QTY, Math.max(MIN_QTY, next))));
    setFeedback(null);
  }

  function handleAdd() {
    startTransition(async () => {
      const result = await addToCart(productId, quantity);
      if (result.ok) {
        setFeedback({
          kind: "success",
          text: `Added ${quantity} × ${productName}. You now have ${result.lineQuantity} in your cart.`,
        });
        setText("1");
      } else {
        setFeedback({ kind: "error", text: result.error });
      }
    });
  }

  return (
    <div className="addToCart">
      <div className="quantityRow">
        <label htmlFor="quantity">Quantity</label>
        <div className="quantityControl">
          <button
            type="button"
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity <= MIN_QTY}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            inputMode="numeric"
            min={MIN_QTY}
            max={MAX_QTY}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFeedback(null);
            }}
            onBlur={() => setText(String(quantity))}
          />
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= MAX_QTY}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <p className="lineTotal">Total: {formatPrice(lineTotal(price, quantity))}</p>

      <button type="button" className="addButton" onClick={handleAdd} disabled={pending}>
        {pending ? "Adding…" : "Add to cart"}
      </button>

      <p className="cartMessage" role="status">
        {feedback && (
          <>
            {feedback.text}
            {feedback.kind === "success" && (
              <>
                {" "}
                <Link href="/cart">View cart</Link>
              </>
            )}
          </>
        )}
      </p>
    </div>
  );
}
