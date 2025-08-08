import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Admin Console</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This is the admin area. Backend calls from this subdomain use base URL
            api.alfrih.com regardless of subdomain.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


