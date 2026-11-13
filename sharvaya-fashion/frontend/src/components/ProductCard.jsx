import { CartIcon, HangerIcon } from './icons.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice } from '../utils/format.js';
import './ProductCard.css';

/*
 * Only the image, name and price are shown on the card.
 * "Add to Cart" slides in on hover (always visible on touch screens).
 * Size + description are shown in the Product Details popup.
 * `preview` is used by the admin page so the preview card never touches the real cart.
 */
export default function ProductCard({ product, onDetails, preview = false }) {
  const { addToCart, notify } = useStore();

  const handleAdd = () => {
    if (preview) return;
    addToCart(product.id);
    notify(`${product.name} added to cart`);
  };

  return (
    <article className="product-card">
      <div className="product-media">
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" draggable="false" />
        ) : (
          <div className="product-placeholder">
            <HangerIcon />
            <span>Product Img</span>
          </div>
        )}

        <button type="button" className="add-cart-btn" onClick={handleAdd}>
          <CartIcon size={18} />
          <span>Add to Cart</span>
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>
        <p className="product-price">{formatPrice(product.price)}</p>
      </div>

      <button
        type="button"
        className="details-btn"
        onClick={() => !preview && onDetails?.(product)}
      >
        Product Details
      </button>
    </article>
  );
}
