import { useEffect, useRef, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { HangerIcon, PlusIcon, TrashIcon, UploadIcon } from '../components/icons.jsx';
import { addDemoProducts, clearProducts, createProduct, deleteProduct } from '../api/products.js';
import { useProducts } from '../hooks/useProducts.js';
import { useStore } from '../context/StoreContext.jsx';
import { SIZES } from '../data/shopOptions.js';
import { compressImage } from '../utils/image.js';
import { formatPrice } from '../utils/format.js';

const EMPTY_FORM = { name: '', price: '', description: '' };

// The owner's screen: add products (with live preview) and manage the Shop All list.
export default function AdminDashboard({ token, user, onSignOut }) {
  const { notify } = useStore();
  const list = useProducts({ sort: 'featured', limit: 24 });

  const [form, setForm] = useState(EMPTY_FORM);
  const [sizes, setSizes] = useState([]);
  const [photo, setPhoto] = useState(null); // { blob, url, name }
  const [photoBusy, setPhotoBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyList, setBusyList] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  // Free the preview's object URL when it is replaced or the page closes
  useEffect(() => () => photo && URL.revokeObjectURL(photo.url), [photo]);

  // An expired or revoked token ends the session; the page then shows the sign-in form again
  const handleError = (err) => {
    if (err.status === 401) {
      notify('Your session has expired. Please sign in again.');
      onSignOut();
      return;
    }
    notify(err.message);
  };

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined, form: undefined }));
  };

  const toggleSize = (size) => {
    setSizes((current) => {
      const next = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];
      return SIZES.filter((s) => next.includes(s)); // keep a tidy order
    });
    setErrors((er) => ({ ...er, sizes: undefined }));
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((er) => ({ ...er, image: 'Please choose an image file (JPG, PNG or WebP).' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((er) => ({ ...er, image: 'That image is larger than 10 MB.' }));
      return;
    }
    setPhotoBusy(true);
    try {
      const blob = await compressImage(file);
      setPhoto({ blob, url: URL.createObjectURL(blob), name: file.name });
      setErrors((er) => ({ ...er, image: undefined }));
    } catch (err) {
      setErrors((er) => ({ ...er, image: err.message }));
    } finally {
      setPhotoBusy(false);
    }
  };

  const clearPhoto = () => {
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setSizes([]);
    clearPhoto();
    setErrors({});
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving || photoBusy) return;

    const er = {};
    const priceNumber = Number(form.price);
    if (!form.name.trim()) er.name = 'Enter the product name.';
    if (!form.price || !Number.isInteger(priceNumber) || priceNumber <= 0) er.price = 'Enter a whole-rupee price.';
    if (sizes.length === 0) er.sizes = 'Select at least one size.';
    if (!form.description.trim()) er.description = 'Add a short description.';
    setErrors(er);
    if (Object.keys(er).length) return;

    const data = new FormData();
    data.append('name', form.name.trim());
    data.append('price', String(priceNumber));
    data.append('sizes', sizes.join(','));
    data.append('description', form.description.trim());
    if (photo) data.append('image', photo.blob, 'product.jpg');

    setSaving(true);
    try {
      await createProduct(data, token);
      notify('Product added to the store');
      resetForm();
      list.reload();
    } catch (err) {
      if (err.status === 401) return handleError(err);
      // Map the server's field messages onto the form; anything else shows at the bottom
      const fieldErrors = Object.fromEntries((err.details || []).map((d) => [d.field, d.message]));
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { form: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from the store?`)) return;
    setBusyList(true);
    try {
      await deleteProduct(product.id, token);
      notify('Product removed');
      list.reload();
    } catch (err) {
      handleError(err);
    } finally {
      setBusyList(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Remove ALL products from the store? This cannot be undone.')) return;
    setBusyList(true);
    try {
      await clearProducts(token);
      notify('All products removed');
      list.reload();
    } catch (err) {
      handleError(err);
    } finally {
      setBusyList(false);
    }
  };

  const handleDemo = async () => {
    setBusyList(true);
    try {
      const res = await addDemoProducts(token);
      notify(`${res.added} demo products added`);
      list.reload();
    } catch (err) {
      handleError(err);
    } finally {
      setBusyList(false);
    }
  };

  const previewProduct = {
    id: 'preview',
    name: form.name.trim() || 'Product name',
    price: Number(form.price) || 0,
    sizes,
    description: form.description,
    image: photo?.url || '',
  };

  return (
    <main className="admin-main">
      <div className="admin-heading">
        <h1>Add a product</h1>
        <p>
          Signed in as <strong>{user.email}</strong>. Products you add are saved online and appear on the home page
          and in <strong>Shop All</strong>.
        </p>
      </div>

      <div className="admin-grid">
        {/* ---------- Form ---------- */}
        <form className="panel" onSubmit={submit} noValidate>
          <div className="a-field">
            <label htmlFor="p-name">Product name</label>
            <input
              id="p-name"
              value={form.name}
              onChange={setField('name')}
              maxLength={80}
              placeholder="e.g. Silk Blend Saree"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <span className="a-error">{errors.name}</span>}
          </div>

          <div className="a-field">
            <label htmlFor="p-price">Price</label>
            <div className="price-input">
              <span aria-hidden="true">₹</span>
              <input
                id="p-price"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={form.price}
                onChange={setField('price')}
                placeholder="0"
                aria-invalid={Boolean(errors.price)}
              />
            </div>
            {errors.price && <span className="a-error">{errors.price}</span>}
          </div>

          <div className="a-field">
            <span className="a-label">Product size</span>
            <div className="size-row" role="group" aria-label="Available sizes">
              {SIZES.map((size) => (
                <button
                  type="button"
                  key={size}
                  className={`size-chip ${sizes.includes(size) ? 'is-on' : ''}`}
                  aria-pressed={sizes.includes(size)}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            {errors.sizes && <span className="a-error">{errors.sizes}</span>}
          </div>

          <div className="a-field">
            <label htmlFor="p-desc">Product description</label>
            <textarea
              id="p-desc"
              rows="5"
              value={form.description}
              onChange={setField('description')}
              maxLength={500}
              placeholder="Fabric, fit, care instructions..."
              aria-invalid={Boolean(errors.description)}
            />
            <div className="a-meta">
              {errors.description ? <span className="a-error">{errors.description}</span> : <span />}
              <span className="a-count">{form.description.length}/500</span>
            </div>
          </div>

          <div className="a-field">
            <span className="a-label">Product image</span>
            {photo ? (
              <div className="image-picked">
                <img src={photo.url} alt="Selected product" />
                <div>
                  <p className="image-name">{photo.name}</p>
                  <button type="button" className="link-btn" onClick={clearPhoto}>
                    Remove image
                  </button>
                </div>
              </div>
            ) : (
              <label
                className={`dropzone ${dragging ? 'is-drag' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
              >
                <UploadIcon />
                <span className="dropzone-title">{photoBusy ? 'Preparing photo...' : 'Drop an image here'}</span>
                <span className="dropzone-sub">or click to browse - JPG, PNG, WebP</span>
                <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
              </label>
            )}
            {errors.image && <span className="a-error">{errors.image}</span>}
          </div>

          {errors.form && (
            <p className="a-error form-error" role="alert">
              {errors.form}
            </p>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving || photoBusy}>
              <PlusIcon size={18} />
              {saving ? 'Saving...' : 'Add product'}
            </button>
            <button type="button" className="btn-ghost" onClick={resetForm} disabled={saving}>
              Reset
            </button>
          </div>
        </form>

        {/* ---------- Live preview ---------- */}
        <aside className="preview-col">
          <div className="panel preview-panel">
            <h2>Live preview</h2>
            <p className="preview-hint">This is how the card looks in the store. Hover it to see Add to Cart.</p>
            <div className="preview-card">
              <ProductCard product={previewProduct} preview />
            </div>
          </div>
        </aside>
      </div>

      {/* ---------- Product list, in the order they were added (newest first) ---------- */}
      <section className="panel list-panel">
        <div className="list-head">
          <h2>
            Shop All products <span className="count-pill">{list.total}</span>
          </h2>
          {list.total > 0 && (
            <button type="button" className="link-btn danger" onClick={handleClearAll} disabled={busyList}>
              Clear all
            </button>
          )}
        </div>

        {list.loading ? (
          <p className="list-empty">Loading products...</p>
        ) : list.error ? (
          <p className="list-empty" role="alert">
            {list.error}
          </p>
        ) : list.items.length === 0 ? (
          <div className="list-empty">
            <p>No products yet. Add your first one above.</p>
            <button type="button" className="link-btn" onClick={handleDemo} disabled={busyList}>
              Or add the sample products
            </button>
          </div>
        ) : (
          <>
            <ul className="product-list">
              {list.items.map((p, i) => (
                <li key={p.id} className="product-row">
                  <span className="row-index">{i + 1}</span>
                  <div className="row-thumb">{p.image ? <img src={p.image} alt="" loading="lazy" /> : <HangerIcon size={22} />}</div>
                  <div className="row-main">
                    <p className="row-name">{p.name}</p>
                    <p className="row-sub">{p.sizes?.join(' · ')}</p>
                  </div>
                  <p className="row-price">{formatPrice(p.price)}</p>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => handleRemove(p)}
                    disabled={busyList}
                    aria-label={`Remove ${p.name}`}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
            {list.hasMore && (
              <div className="list-more">
                <button type="button" className="btn-ghost" onClick={list.loadMore} disabled={list.loadingMore}>
                  {list.loadingMore ? 'Loading...' : 'Show more'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
