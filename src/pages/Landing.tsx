import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Welcome to Alfrih</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This is the public landing experience for the root domain. From here,
            users can learn about the platform or sign in to their tenant. API calls
            from this page use base URL api.alfrih.com.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button variant="secondary" asChild>
              <a href="https://admin.alfrih.com">Go to Admin</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


