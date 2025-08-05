/**
 * ComponentsTab Component
 * Placeholder for components functionality
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComponentsTabProps {
  assetId: string;
}

export const ComponentsTab = React.memo<ComponentsTabProps>(({ assetId }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Asset Components</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Component management for asset {assetId} will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

ComponentsTab.displayName = "ComponentsTab";