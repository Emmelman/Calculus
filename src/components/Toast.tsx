import { useEffect } from "react";
import { useToast } from "../lib/fx";

/** Renders the transient reward toast and auto-clears it. Mount once in App. */
export function ToastHost() {
  const message = useToast((s) => s.message);
  const seq = useToast((s) => s.seq);
  const clear = useToast((s) => s.clear);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(clear, 1500);
    return () => clearTimeout(t);
  }, [seq, message, clear]);

  if (!message) return null;
  return (
    <div className="toast" key={seq}>
      {message}
    </div>
  );
}
