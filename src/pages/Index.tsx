import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to Your App
          </h1>
          <p className="text-muted-foreground text-lg">
            Start building your amazing project here!
          </p>
        </div>
        
        <div className="flex justify-center">
          <Link to="/assets">
            <Button size="lg">
              View Assets
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
