import { toast, type ToastOptions } from "react-hot-toast";

export type ToastType = "Success" | "Error" | "Normal";

export const toaster = (
  label: string,
  type?: ToastType,
  options?: ToastOptions,
) => {
  switch (type) {
    case "Success":
      return toast.success(label, options);
    case "Error":
      return toast.error(label, options);
    case "Normal":
      return toast(label, options);
    default:
      return toast(label, options);
  }
};
