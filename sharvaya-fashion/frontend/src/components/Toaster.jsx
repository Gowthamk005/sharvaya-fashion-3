import { useStore } from '../context/StoreContext.jsx';

export default function Toaster() {
  const { toast } = useStore();
  return (
    <div className="toaster" aria-live="polite">
      {toast && (
        <div key={toast.id} className="toast">
          {toast.message}
        </div>
      )}
    </div>
  );
}
