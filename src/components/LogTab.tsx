import ApiTable from "@/components/ApiTable";

interface LogTabProps {
  assetId: string;
}

const LogTab = ({ assetId }: LogTabProps) => {
  return (
    <div className="tab-content-generic space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Active Work Orders</h3>
        <div className="max-h-[280px] overflow-auto border rounded-md">
           <ApiTable
             endpoint={`/work-orders/work_order?asset=${assetId}&status__control__name__in=Active,Draft,Pending`}
             columns={[
               { key: 'code', header: 'Code', type: 'string' },
               { key: 'description', header: 'Description', type: 'string' },
               { key: 'status', header: 'Status', type: 'object', render: (value: any) => value?.control?.name || value?.name || '-' },
               { key: 'maint_type', header: 'Maint Type', type: 'string' },
               { key: 'completion_end_date', header: 'Completion Date', type: 'string' }
             ]}
             queryKey={['active-work-orders', assetId]}
             tableId={`active-work-orders-${assetId}`}
             editRoutePattern="/workorders/edit/{id}"
           />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Completed Work Orders</h3>
        <div className="max-h-[280px] overflow-auto border rounded-md">
           <ApiTable
             endpoint={`/work-orders/work_order?asset=${assetId}&status__control__name=Closed`}
             columns={[
               { key: 'code', header: 'Code', type: 'string' },
               { key: 'description', header: 'Description', type: 'string' },
               { key: 'status', header: 'Status', type: 'object', render: (value: any) => value?.control?.name || value?.name || '-' },
               { key: 'maint_type', header: 'Maint Type', type: 'string' },
               { key: 'completion_end_date', header: 'Completion Date', type: 'string' }
             ]}
             queryKey={['completed-work-orders', assetId]}
             tableId={`completed-work-orders-${assetId}`}
             editRoutePattern="/workorders/edit/{id}"
           />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Asset Move History</h3>
        <div className="max-h-[280px] overflow-auto border rounded-md">
          <ApiTable
            endpoint={`/assets/movement-log?asset=${assetId}`}
            columns={[
              { key: 'from_location', header: 'From Location', type: 'object' },
              { key: 'to_location', header: 'To Location', type: 'object' },
              { key: 'moved_by', header: 'Moved By', type: 'object' },
              { key: 'timestamp', header: 'Moved At', type: 'date' }
            ]}
            queryKey={['asset-movement-log', assetId]}
            tableId={`asset-movement-log-${assetId}`}
          />
        </div>
      </div>
    </div>
  );
};

export default LogTab;