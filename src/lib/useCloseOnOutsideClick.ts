import { RefObject, useEffect } from "react";

type OutsideClickParams = {
  open: boolean;
  refs: Array<RefObject<HTMLElement | null>>;
  onClose: () => void;
};

export function useCloseOnOutsideClick({ open, refs, onClose }: OutsideClickParams) {
  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      if (refs.some((ref) => ref.current?.contains(e.target as Node))) return;
      onClose();
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, refs, onClose]);
}