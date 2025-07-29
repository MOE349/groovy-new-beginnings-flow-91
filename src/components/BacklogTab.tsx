
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import ApiTable from "@/components/ApiTable";
import ApiForm from "@/components/ApiForm";
import { apiCall } from "@/utils/apis";

interface BacklogTabProps {
  assetId: string;
  isBacklogDialogOpen: boolean;
  setIsBacklogDialogOpen: (open: boolean) => void;
}

const BacklogTab = ({ assetId, isBacklogDialogOpen, setIsBacklogDialogOpen }: BacklogTabProps) => {
  const queryClient = useQueryClient();

  return (
    <div className="tab-content-generic">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Asset Backlog</h3>
        <Button
          variant="default"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setIsBacklogDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Backlog Item
        </Button>
      </div>
      
      <div className="max-h-[500px] overflow-auto border rounded-md">
        <ApiTable
          endpoint={`/asset-backlogs/asset_backlog?asset=${assetId}`}
          columns={[
            { key: 'name', header: 'Name' }
          ]}
          queryKey={['asset-backlogs', assetId]}
          emptyMessage="No backlog items found"
          className="w-full"
        />
      </div>

      {/* Backlog Item Creation Dialog */}
      <Dialog open={isBacklogDialogOpen} onOpenChange={setIsBacklogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Backlog Item</DialogTitle>
          </DialogHeader>
          <ApiForm
            fields={[
              {
                name: 'asset',
                label: 'Asset',
                type: 'input',
                inputType: 'hidden'
              },
              {
                name: 'name',
                label: 'Name',
                type: 'input',
                inputType: 'text',
                required: true
              }
            ]}
            initialData={{
              asset: assetId,
              name: ''
            }}
            title=""
            onSubmit={async (data) => {
              try {
                await apiCall('/asset-backlogs/asset_backlog', {
                  method: 'POST',
                  body: {
                    asset: assetId,
                    name: data.name
                  }
                });
                
                toast({
                  title: "Success",
                  description: "Backlog item created successfully"
                });
                
                // Refresh the data
                queryClient.invalidateQueries({
                  queryKey: ['asset-backlogs', assetId]
                });
                
                setIsBacklogDialogOpen(false);
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to create backlog item",
                  variant: "destructive"
                });
              }
            }}
            submitText="Create Backlog Item"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BacklogTab;