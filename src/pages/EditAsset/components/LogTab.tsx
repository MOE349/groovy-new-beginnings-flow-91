/**
 * LogTab Component
 * Placeholder for log functionality
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LogTabProps {
  assetId: string;
}

export const LogTab = React.memo<LogTabProps>(({ assetId }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Asset Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Activity log for asset {assetId} will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

LogTab.displayName = "LogTab";