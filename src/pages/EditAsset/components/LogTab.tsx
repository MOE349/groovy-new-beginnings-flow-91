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
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Activity log for asset {assetId} will be implemented here.
            </p>
            <div className="space-y-2">
              <div className="border-l-2 border-primary pl-4 py-2">
                <div className="text-sm font-medium">Asset Created</div>
                <div className="text-xs text-muted-foreground">System initialized asset record</div>
              </div>
              <div className="border-l-2 border-muted pl-4 py-2">
                <div className="text-sm font-medium">Last Modified</div>
                <div className="text-xs text-muted-foreground">Asset information updated</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

LogTab.displayName = "LogTab";