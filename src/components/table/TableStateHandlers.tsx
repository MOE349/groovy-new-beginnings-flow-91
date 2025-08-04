import { Alert, AlertDescription } from "@/components/ui/alert";
import GearSpinner from "@/components/ui/gear-spinner";

interface TableStateHandlersProps {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isEmpty: boolean;
  emptyMessage?: string;
  hasFilters?: boolean;
}

export const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <GearSpinner fullscreen />
  </div>
);

export const ErrorAlert = ({ error }: { error: Error | null }) => (
  <Alert variant="destructive">
    <AlertDescription>
      Failed to load data: {error?.message || "Unknown error"}
    </AlertDescription>
  </Alert>
);

export const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-8 text-muted-foreground">
    {message}
  </div>
);

export const TableStateHandlers = ({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyMessage = "No data available",
  hasFilters = false,
}: TableStateHandlersProps) => {
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorAlert error={error} />;
  if (isEmpty) {
    const message = hasFilters ? "No results match your filters" : emptyMessage;
    return <EmptyState message={message} />;
  }
  
  return null;
};