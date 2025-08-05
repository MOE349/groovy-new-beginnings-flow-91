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
          <p className="text-muted-foreground">
            Backlog functionality for asset {assetId} will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

BacklogTab.displayName = "BacklogTab";