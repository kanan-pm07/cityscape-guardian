import { Button } from "@/components/ui/enhanced-button";
import { Camera, Shield, MapPin, AlertTriangle, LogIn, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-cityscape.jpg";

export const HeroSection = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Urban cityscape with billboards" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm rounded-full px-6 py-2 border border-background/20">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-primary-foreground">
              Government of India Initiative
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
              Cityscape
              <span className="block bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
                Guardian
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
              AI-powered detection system for unauthorized billboards. 
              Ensuring safer cities through smart technology and citizen engagement.
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Camera, label: "AI Detection", value: "99.2%" },
              { icon: MapPin, label: "Cities Covered", value: "50+" },
              { icon: AlertTriangle, label: "Violations Found", value: "2.5K+" },
              { icon: Shield, label: "Safety Score", value: "A+" }
            ].map((stat, index) => (
              <div key={index} className="bg-background/10 backdrop-blur-sm rounded-lg p-4 border border-background/20">
                <stat.icon className="w-6 h-6 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-sm text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <>
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="min-w-48"
                  onClick={() => document.getElementById('reporting-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Camera className="w-5 h-5" />
                  Report Billboard
                </Button>
                <Button 
                  variant="success" 
                  size="xl" 
                  className="min-w-48"
                  onClick={() => signOut()}
                >
                  <LogIn className="w-5 h-5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="min-w-48"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="w-5 h-5" />
                  Sign In to Report
                </Button>
                <Button 
                  variant="success" 
                  size="xl" 
                  className="min-w-48"
                  onClick={() => navigate('/auth')}
                >
                  <Eye className="w-5 h-5" />
                  Create Account
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary-foreground/50 rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </section>
  );
};