import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import ApiForm from "@/components/ApiForm";
import ApiTable from "@/components/ApiTable";
import { apiPost, apiDelete } from "@/utils/apis";
import GearSpinner from "@/components/ui/gear-spinner";
import { AlertTriangle, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssetData } from "@/hooks/useAssetData";
import { useAssetSubmit } from "@/hooks/useAssetSubmit";
import { equipmentFields, attachmentFields } from "@/data/assetFormFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import AssetFormLayout from "@/components/AssetFormLayout";
import { AttachmentFormLayout } from "@/components/AttachmentFormLayout";
import { apiGet } from "@/utils/apis";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EditAsset = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const { assetType, assetData, isLoading, isError, error } = useAssetData(id);
  const { handleSubmit } = useAssetSubmit(id, assetType);

  // Fetch meter readings for this asset
  const { data: meterReadings, isLoading: isLoadingReadings } = useQuery({
    queryKey: ["meter_readings", id],
    queryFn: async () => {
      const response = await apiGet(`/meter-readings/meter_reading?asset=${id}`);
      return response.data.data || response.data || [];
    },
    enabled: !!id,
  });

  // Fetch codes for this asset
  const { data: codes, isLoading: isLoadingCodes } = useQuery({
    queryKey: ["codes", id],
    queryFn: async () => {
      const response = await apiGet(`/codes/code?asset=${id}`);
      return response.data.data || response.data || [];
    },
    enabled: !!id,
  });

  const handleDeleteMeterReading = async (readingId: string) => {
    try {
      await apiDelete(`/meter-readings/meter_reading/${readingId}`);
      queryClient.invalidateQueries({ queryKey: ["meter_readings", id] });
      toast({
        title: "Success",
        description: "Meter reading deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete meter reading",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      await apiDelete(`/codes/code/${codeId}`);
      queryClient.invalidateQueries({ queryKey: ["codes", id] });
      toast({
        title: "Success",
        description: "Code deleted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete code",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load asset data: {error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!assetType || !assetData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <GearSpinner fullscreen />
      </div>
    );
  }

  const currentFields = assetType === "equipment" ? equipmentFields : attachmentFields;
  const assetTypeName = assetType === "equipment" ? "Equipment" : "Attachment";

  // Transform date strings to Date objects and object values to IDs for dropdowns
  const initialData = {
    ...assetData,
    purchase_date: assetData?.purchase_date ? new Date(assetData.purchase_date) : undefined,
    // Transform object values to their IDs for dropdown compatibility
    category: assetData?.category?.id || assetData?.category || "",
    location: assetData?.location?.id || assetData?.location || "",
    equipment: assetData?.equipment?.id || assetData?.equipment || "",
  };

  const customLayout = assetType === "attachment" ? AttachmentFormLayout : (props: any) => (
    <AssetFormLayout 
      {...props} 
      assetType={assetType}
      assetTypeName={assetTypeName}
    />
  );

  return (
    <div className="space-y-6">
      <div>
        <ApiForm
          fields={currentFields}
          onSubmit={handleSubmit}
          initialData={initialData}
          customLayout={customLayout}
        />
      </div>

      {/* Compact Tabs Section */}
      <div>
        <Tabs defaultValue="parts-bom" className="h-full">
          {/* Compact Pill-Style Tab List */}
          <div className="h-14 overflow-x-auto">
            <TabsList className="grid w-full grid-cols-7 h-14 bg-card border border-border rounded-md p-0">
              <TabsTrigger 
                value="parts-bom" 
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Parts/BOM
              </TabsTrigger>
              <TabsTrigger 
                value="metering-events"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Metering/Events
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled-maintenance"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Scheduled Maintenance
              </TabsTrigger>
              <TabsTrigger 
                value="financials"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Files
              </TabsTrigger>
              <TabsTrigger 
                value="backlog"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Backlog
              </TabsTrigger>
              <TabsTrigger 
                value="log"
                className="px-4 py-1 text-base font-normal data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent hover:text-foreground/80 rounded-none"
              >
                Log
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content Panels - Compact */}
          <TabsContent value="parts-bom" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Parts/BOM</h3>
              <p className="text-caption text-muted-foreground">Parts and Bill of Materials content will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="metering-events" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <div className="flex gap-6">
                {/* Left side - Meter Readings */}
                <div className="w-1/2">
                  {/* Button */}
                  <div className="mb-1">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center gap-2 px-3 py-1"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Update Reading
                    </Button>
                  </div>

                  {/* Table */}
                  <div className="w-5/6">
                    <div className="border border-border rounded-sm">
                      <Table className="text-xs [&_td]:py-1 [&_td]:px-2 [&_th]:py-1 [&_th]:px-2 [&_th]:h-8">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="py-1 px-2">Meter Reading</TableHead>
                            <TableHead className="py-1 px-2">Creation Date</TableHead>
                            <TableHead className="py-1 px-2">Created By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingReadings ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                Loading meter readings...
                              </TableCell>
                            </TableRow>
                          ) : meterReadings && meterReadings.length > 0 ? (
                            meterReadings.map((reading: any) => (
                              <TableRow key={reading.id}>
                                <TableCell className="py-1 px-2">{reading.meter_reading}</TableCell>
                                <TableCell className="py-1 px-2">
                                  {reading.created_at ? new Date(reading.created_at).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell className="py-1 px-2">{reading.created_by || '-'}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                No meter readings found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Right side - Codes */}
                <div className="w-1/2">
                  {/* Button */}
                  <div className="mb-1">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex items-center gap-2 px-3 py-1"
                      onClick={() => setIsCodeDialogOpen(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Update Code
                    </Button>
                  </div>

                  {/* Table */}
                  <div className="w-5/6">
                    <div className="border border-border rounded-sm">
                      <Table className="text-xs [&_td]:py-1 [&_td]:px-2 [&_th]:py-1 [&_th]:px-2 [&_th]:h-8">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="py-1 px-2 text-center">Code</TableHead>
                            <TableHead className="py-1 px-2 text-center">Creation Date</TableHead>
                            <TableHead className="py-1 px-2 text-center">Created By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingCodes ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                Loading codes...
                              </TableCell>
                            </TableRow>
                          ) : codes && codes.length > 0 ? (
                            codes.map((code: any) => (
                              <TableRow key={code.id}>
                                <TableCell className="py-1 px-2 text-center">{code.code}</TableCell>
                                <TableCell className="py-1 px-2 text-center">
                                  {code.created_at ? new Date(code.created_at).toLocaleDateString() : '-'}
                                </TableCell>
                                <TableCell className="py-1 px-2 text-center">{code.created_by || '-'}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                No codes found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dialog for adding readings */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Meter Reading</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <ApiForm
                      fields={[
                        {
                          name: "meter_reading",
                          type: "input",
                          inputType: "text",
                          required: true,
                          label: "Meter Reading"
                        }
                      ]}
                      onSubmit={async (data) => {
                        const submissionData = {
                          ...data,
                          asset: id
                        };
                        try {
                          await apiPost("/meter-readings/meter_reading", submissionData);
                          queryClient.invalidateQueries({ queryKey: ["meter_readings", id] });
                          setIsDialogOpen(false);
                          toast({
                            title: "Success",
                            description: "Meter reading added successfully!",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: error.message || "Failed to add meter reading",
                            variant: "destructive",
                          });
                        }
                      }}
                      customLayout={({ handleSubmit, renderField }) => (
                        <div className="space-y-4">
                          {renderField({ 
                            name: "meter_reading", 
                            type: "input", 
                            inputType: "text", 
                            required: true,
                            label: "Meter Reading"
                          })}
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </DialogContent>
              </Dialog>

              {/* Dialog for adding codes */}
              <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <ApiForm
                      fields={[
                        {
                          name: "code",
                          type: "input",
                          inputType: "text",
                          required: true,
                          label: "Code"
                        }
                      ]}
                      onSubmit={async (data) => {
                        const submissionData = {
                          ...data,
                          asset: id
                        };
                        try {
                          await apiPost("/codes/code", submissionData);
                          queryClient.invalidateQueries({ queryKey: ["codes", id] });
                          setIsCodeDialogOpen(false);
                          toast({
                            title: "Success",
                            description: "Code added successfully!",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: error.message || "Failed to add code",
                            variant: "destructive",
                          });
                        }
                      }}
                      customLayout={({ handleSubmit, renderField }) => (
                        <div className="space-y-4">
                          {renderField({ 
                            name: "code", 
                            type: "input", 
                            inputType: "text", 
                            required: true,
                            label: "Code"
                          })}
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setIsCodeDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleSubmit}>
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="scheduled-maintenance" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Scheduled Maintenance</h3>
              <p className="text-caption text-muted-foreground">Scheduled maintenance content will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="financials" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Financials</h3>
              <p className="text-caption text-muted-foreground">Financial information content will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="files" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Files</h3>
              <p className="text-caption text-muted-foreground">File attachments and documents will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="backlog" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Backlog</h3>
              <p className="text-caption text-muted-foreground">Backlog items and tasks will go here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="log" className="mt-1">
            <div className="bg-card rounded-sm shadow-xs p-4 h-full min-h-[500px]">
              <h3 className="text-h3 font-medium text-foreground">Log</h3>
              <p className="text-caption text-muted-foreground">Activity log content will go here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EditAsset;