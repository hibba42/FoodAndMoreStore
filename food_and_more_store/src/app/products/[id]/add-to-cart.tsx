"use client";

import { useState } from "react";
import { formatPrice, lineTotal } from "@/lib/format";

const MIN = 1;
const MAX = 99;

type Props = {
  productName: string;
  price: string;
};

// Placeholder UI: the quantity controls work, but "Add to cart" doesn't
// talk to a backend yet. Later this will call a Server Action.
export default function AddToCart({ productName, price }: Props) {
  // Keep the raw text so the field can be cleared while typing.
  const [text, setText] = useState("1");
  const [message, setMessage] = useState("");

  const parsed = parseInt(text, 10);
  const quantity = Number.isNaN(parsed) ? MIN : Math.min(MAX, Math.max(MIN, parsed));

  function setQuantity(next: number) {
    setText(String(Math.min(MAX, Math.max(MIN, next))));
    setMessage("");
  }

  return (
    <div className="addToCart">
      <div className="quantityRow">
        <label htmlFor="quantity">Quantity</label>
        <div className="quantityControl">
          <button
            type="button"
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity <= MIN}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            inputMode="numeric"
            min={MIN}
            max={MAX}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setMessage("");
            }}
            onBlur={() => setText(String(quantity))}
          />
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= MAX}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <p className="lineTotal">Total: {formatPrice(lineTotal(price, quantity))}</p>

      <button
        type="button"
        className="addButton"
        onClick={() =>
          setMessage(
            `${quantity} × ${productName} would be added to your cart. (Demo only: the cart isn't connected yet.)`
          )
        }
      >
        Add to cart
      </button>

      <p className="cartMessage" role="status">
        {message}
      </p>
    </div>
  );
}
