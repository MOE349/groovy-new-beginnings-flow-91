
import React, { useState } from 'react';

interface PartsBomTabContentProps {
  assetId: string;
}

const PartsBomTabContent: React.FC<PartsBomTabContentProps> = ({ assetId }) => {
  return (
    <div className="bg-card rounded-sm shadow-xs p-2 h-full min-h-[500px] overflow-hidden">
      {/* Two Container Layout */}
      <div className="flex gap-14 h-full">
        
        {/* Parts Container */}
        <div className="w-1/2 ml-8">
          <div className="p-6 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
            <div className="flex items-center justify-center gap-4 mb-6 py-0.5 -mx-2 -mt-3 bg-accent/20 border border-accent/30 rounded-md">
              <h4 className="text-base font-medium text-primary dark:text-secondary">Parts</h4>
            </div>
            
            <div className="flex-grow space-y-4 overflow-auto">
              {/* Empty container - parts content will go here */}
            </div>
          </div>
        </div>

        {/* Purchase Orders Container */}
        <div className="w-1/2 mr-8">
          <div className="p-6 h-full relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-primary/60 before:via-primary/80 before:to-primary/60 before:rounded-full before:shadow-md after:absolute after:right-0 after:top-4 after:bottom-4 after:w-0.5 after:bg-gradient-to-b after:from-primary/60 after:via-primary/80 after:to-primary/60 after:rounded-full after:shadow-md shadow-xl shadow-primary/5 bg-gradient-to-br from-background via-card to-background border border-primary/10 rounded-3xl flex flex-col">
            <div className="flex items-center justify-center gap-4 mb-6 py-0.5 -mx-2 -mt-3 bg-accent/20 border border-accent/30 rounded-md">
              <h4 className="text-base font-medium text-primary dark:text-secondary">Purchase Orders</h4>
            </div>
            
            <div className="flex-grow space-y-4 overflow-auto">
              {/* Empty container - purchase orders content will go here */}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PartsBomTabContent;
