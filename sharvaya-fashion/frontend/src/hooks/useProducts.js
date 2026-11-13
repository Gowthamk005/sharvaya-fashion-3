import { useCallback, useEffect, useRef, useState } from 'react';
import { listProducts } from '../api/products.js';

const EMPTY = { items: [], total: 0, page: 0, pages: 1, loading: true, loadingMore: false, error: '' };

/*
 * Loads products for the given filters.
 *  - Changing the filters starts again from page 1 (older requests are cancelled, so a slow answer
 *    can never overwrite a newer one).
 *  - loadMore() appends the next page.
 *  - reload() fetches page 1 again, e.g. after an admin adds or removes a product.
 */
export function useProducts(params, { enabled = true } = {}) {
  const key = JSON.stringify(params);
  const [state, setState] = useState(EMPTY);
  const [version, setVersion] = useState(0);
  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: '' }));

    listProducts({ ...JSON.parse(key), page: 1 }, { signal: controller.signal })
      .then((res) =>
        setState({
          items: res.items,
          total: res.total,
          page: res.page,
          pages: res.pages,
          loading: false,
          loadingMore: false,
          error: '',
        })
      )
      .catch((err) => {
        if (err.name !== 'AbortError') setState((s) => ({ ...s, loading: false, error: err.message }));
      });

    return () => controller.abort();
  }, [key, enabled, version]);

  const { page, pages, loadingMore } = state;

  const loadMore = useCallback(async () => {
    if (loadingMore || page >= pages) return;
    const requestKey = keyRef.current;
    setState((s) => ({ ...s, loadingMore: true }));
    try {
      const res = await listProducts({ ...JSON.parse(requestKey), page: page + 1 });
      if (requestKey !== keyRef.current) return; // filters changed while loading: drop this page
      setState((s) => ({
        ...s,
        items: [...s.items, ...res.items],
        total: res.total,
        page: res.page,
        pages: res.pages,
        loadingMore: false,
      }));
    } catch (err) {
      setState((s) => ({ ...s, loadingMore: false, error: err.message }));
    }
  }, [page, pages, loadingMore]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { ...state, hasMore: state.page < state.pages, loadMore, reload };
}
