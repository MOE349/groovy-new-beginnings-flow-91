/**
 * BacklogTab Component
 * Placeholder for backlog functionality
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BacklogTabProps {
  assetId: string;
}

export const BacklogTab = React.memo<BacklogTabProps>(({ assetId }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Backlog Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Backlog functionality for asset {assetId} will be implemented here.
            </p>
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Pending Items</h4>
                <p className="text-sm text-muted-foreground">No pending backlog items</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Completed Items</h4>
                <p className="text-sm text-muted-foreground">No completed backlog items</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

BacklogTab.displayName = "BacklogTab";