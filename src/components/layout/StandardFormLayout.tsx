import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface StandardFormLayoutProps {
  /** Page title displayed in the form header */
  title: string;
  /** Route to navigate back to when back button is clicked */
  backRoute: string;
  /** Function called when save button is clicked */
  onSave: () => void;
  /** Whether the form is currently loading/submitting */
  loading?: boolean;
  /** Custom save button text (defaults to "Save") */
  saveText?: string;
  /** Custom back button text (defaults to "Back") */
  backText?: string;
  /** Maximum width of the form container (defaults to "max-w-2xl") */
  maxWidth?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether to show the top action bar */
  showTopBar?: boolean;
  /** Whether to show the form header */
  showHeader?: boolean;
  /** Custom content to render in the top bar (replaces default buttons) */
  customTopBarContent?: React.ReactNode;
  /** Additional buttons to show next to the save button */
  additionalActions?: React.ReactNode;
  /** Form content to render */
  children: React.ReactNode;
}

export const StandardFormLayout: React.FC<StandardFormLayoutProps> = ({
  title,
  backRoute,
  onSave,
  loading = false,
  saveText = "Save",
  backText = "Back",
  maxWidth = "max-w-2xl",
  className = "",
  showTopBar = true,
  showHeader = true,
  customTopBarContent,
  additionalActions,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backRoute);
  };

  return (
    <div className={`space-y-0 ${className}`}>
      {/* Top Action Bar */}
      {showTopBar && (
        <div className="h-10 flex items-center justify-between px-4 py-1 bg-secondary border-b border-border">
          {customTopBarContent || (
            <>
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2 text-black dark:text-black hover:scale-105 transition-transform px-4 py-1 h-8 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                {backText}
              </Button>
              <div className="flex items-center gap-2">
                {additionalActions}
                <Button
                  onClick={onSave}
                  disabled={loading}
                  className="bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90 px-4 py-1 h-8 text-sm font-medium shadow-lg border border-secondary-foreground/20 hover:shadow-md transition-all duration-200"
                  style={{
                    boxShadow:
                      "0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  {loading ? "Loading..." : saveText}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Form Container */}
      <div
        className={`bg-card rounded-md shadow-sm px-2 py-1 mt-4 ${maxWidth}`}
      >
        <div className="h-full">
          {/* Form Header */}
          {showHeader && (
            <div className="flex items-center gap-4 mb-4 py-1 -mx-2 bg-accent/20 border border-accent/30 rounded-md">
              <h3 className="text-h3 font-medium text-primary ml-6">{title}</h3>
            </div>
          )}

          {/* Form Content */}
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default StandardFormLayout;
