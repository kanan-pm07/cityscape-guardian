import { Button } from "@/components/ui/enhanced-button";
import { Card } from "@/components/ui/card";
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Zap, 
  Users,
  Database,
  Eye
} from "lucide-react";

export const FeatureSection = () => {
  const features = [
    {
      icon: Eye,
      title: "AI Vision Detection",
      description: "Advanced computer vision algorithms identify unauthorized billboards instantly with 99.2% accuracy.",
      color: "bg-gradient-primary"
    },
    {
      icon: MapPin,
      title: "Geo-location Tracking",
      description: "Precise GPS coordinates and geofencing to verify billboard locations against zoning regulations.",
      color: "bg-gradient-success"
    },
    {
      icon: Database,
      title: "Regulation Database",
      description: "Cross-reference with city zoning laws, permitted billboard database, and structural safety records.",
      color: "bg-gradient-warning"
    },
    {
      icon: Users,
      title: "Citizen Reporting",
      description: "Enable citizens to report violations with photos, timestamps, and automatic geolocation.",
      color: "bg-gradient-primary"
    },
    {
      icon: Zap,
      title: "Real-time Alerts",
      description: "Instant flagging system with detailed violation reports sent to concerned authorities.",
      color: "bg-gradient-success"
    },
    {
      icon: Shield,
      title: "Safety Compliance",
      description: "Monitor structural hazards, content compliance, and placement violations automatically.",
      color: "bg-gradient-warning"
    }
  ];

  const violationTypes = [
    {
      type: "Size Violations",
      description: "Non-standard dimensions beyond 12×20 ft or 8×15 ft limits",
      severity: "Medium",
      color: "bg-gradient-warning"
    },
    {
      type: "Location Violations", 
      description: "Within 100m of schools, hospitals, religious sites, or heritage buildings",
      severity: "High",
      color: "bg-gradient-primary"
    },
    {
      type: "Structural Hazards",
      description: "Poor installation, age-related deterioration, or unsafe positioning",
      severity: "Critical",
      color: "bg-destructive"
    },
    {
      type: "Content Violations",
      description: "Obscene, misleading, or inappropriate advertising content",
      severity: "High", 
      color: "bg-gradient-primary"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Features Grid */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Advanced Detection Technology
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive AI-powered solution for identifying and flagging unauthorized billboard violations across Indian cities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-civic transition-all duration-300 border-border">
              <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Violation Types */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Violation Detection Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our system identifies multiple types of violations to ensure comprehensive compliance monitoring.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {violationTypes.map((violation, index) => (
            <Card key={index} className="p-6 border-border hover:shadow-card transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{violation.type}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${violation.color}`}>
                  {violation.severity}
                </span>
              </div>
              <p className="text-muted-foreground">{violation.description}</p>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Make Your City Safer?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join the movement towards smarter urban governance with AI-powered billboard monitoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="civic" size="lg">
                <Camera className="w-4 h-4" />
                Start Reporting
              </Button>
              <Button variant="success" size="lg">
                <Shield className="w-4 h-4" />
                Official Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};