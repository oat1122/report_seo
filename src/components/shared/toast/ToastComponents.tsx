import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";

const ToastContent = ({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) => (
  <div className="flex items-center gap-3">
    {icon}
    <p className="text-sm">{message}</p>
  </div>
);

export const PendingToast = ({ message }: { message: string }) => (
  <ToastContent
    icon={<Loader2 className="size-5 animate-spin" />}
    message={message}
  />
);

export const SuccessToast = ({ message }: { message: string }) => (
  <ToastContent
    icon={<CheckCircle2 className="size-5 text-success" />}
    message={message}
  />
);

export const ErrorToast = ({ message }: { message: string }) => (
  <ToastContent
    icon={<CircleAlert className="size-5 text-destructive" />}
    message={message}
  />
);
