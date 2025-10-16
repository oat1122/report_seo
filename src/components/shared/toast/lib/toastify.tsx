// src/lib/toastify.tsx
import { toast } from "react-toastify";
import {
  PendingToast,
  SuccessToast,
  ErrorToast,
} from "@/components/shared/toast/ToastComponents";

interface PromiseToastMessages {
  pending: string;
  success: string;
  error: string;
}

/**
 * A utility function to show promise-based toasts with custom components.
 * @param promise The promise to track.
 * @param messages The messages to display for each state.
 * @returns The toast ID.
 */
export const showPromiseToast = (
  promise: Promise<any>,
  messages: PromiseToastMessages
): Promise<any> => {
  return toast.promise(promise, {
    pending: {
      render: () => <PendingToast message={messages.pending} />,
      icon: false,
    },
    success: {
      render: () => <SuccessToast message={messages.success} />,
      icon: false,
    },
    error: {
      render: ({ data }: any) => {
        const errorMessage = typeof data === "string" ? data : messages.error;
        return <ErrorToast message={errorMessage} />;
      },
      icon: false,
    },
  });
};
