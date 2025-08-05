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
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Component management for asset {assetId} will be implemented here.
            </p>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Asset Components</h4>
              <div className="text-sm text-muted-foreground">
                <p>• Engine components</p>
                <p>• Hydraulic systems</p>
                <p>• Electrical components</p>
                <p>• Mechanical parts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ComponentsTab.displayName = "ComponentsTab";