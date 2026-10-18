"use client";

import { useTransition } from "react";
import { removeFromCart, setQuantity } from "@/lib/cart-actions";
import { MAX_QTY, MIN_QTY } from "@/lib/cart-limits";

type Props = {
  productId: number;
  quantity: number;
  name: string;
};

// Quantity stepper and remove button for one cart line.
export default function CartLineControls({ productId, quantity, name }: Props) {
  const [pending, startTransition] = useTransition();

  function update(next: number) {
    startTransition(async () => {
      await setQuantity(productId, next);
    });
  }

  function remove() {
    startTransition(async () => {
      await removeFromCart(productId);
    });
  }

  return (
    <div className="cartLineControls" aria-busy={pending}>
      <div className="cartQuantity">
        <button
          type="button"
          onClick={() => update(quantity - 1)}
          disabled={pending || quantity <= MIN_QTY}
          aria-label={`Decrease quantity of ${name}`}
        >
          −
        </button>
        <span className="cartQuantityValue" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => update(quantity + 1)}
          disabled={pending || quantity >= MAX_QTY}
          aria-label={`Increase quantity of ${name}`}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="removeButton"
        onClick={remove}
        disabled={pending}
        aria-label={`Remove ${name} from cart`}
      >
        Remove
      </button>
    </div>
  );
}
