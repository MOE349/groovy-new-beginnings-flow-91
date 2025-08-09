import React from "react";
import { AppPage } from "@/components/layout/AppPage";

const Parts = () => {
  return (
    <AppPage
      top={
        <div className="pt-2">
          <h2 className="text-xl font-semibold">Parts</h2>
        </div>
      }
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-muted-foreground mb-4">
            Parts
          </h1>
          <p className="text-muted-foreground">This module is coming soon...</p>
        </div>
      </div>
    </AppPage>
  );
};

export default Parts;
