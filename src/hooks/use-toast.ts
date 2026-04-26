import * as React from "react";

export type ToastProps = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const listeners: Array<(toasts: ToastProps[]) => void> = [];
let toasts: ToastProps[] = [];
let counter = 0;

function dispatch(newToasts: ToastProps[]) {
  toasts = newToasts;
  listeners.forEach((l) => l(toasts));
}

export function toast(props: Omit<ToastProps, "id">) {
  const id = String(++counter);
  dispatch([...toasts, { ...props, id, open: true }]);
  return id;
}

export function useToast() {
  const [state, setState] = React.useState<ToastProps[]>(toasts);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    toasts: state,
    toast,
    dismiss: (id: string) =>
      dispatch(toasts.map((t) => (t.id === id ? { ...t, open: false } : t))),
  };
}
