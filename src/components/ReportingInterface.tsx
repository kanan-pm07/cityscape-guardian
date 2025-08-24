import { useState } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Upload,
  Loader2
} from "lucide-react";

export const ReportingInterface = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAnalyzeImage = () => {
    setIsAnalyzing(true);
    setProgress(0);
    
    // Simulate AI analysis progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setAnalysisComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const violations = [
    {
      type: "Size Violation",
      severity: "Medium",
      description: "Billboard exceeds standard 12×20 ft dimensions",
      confidence: "94%"
    },
    {
      type: "Location Violation", 
      severity: "High",
      description: "Within 85m of heritage building (minimum 100m required)",
      confidence: "97%"
    },
    {
      type: "Structural Risk",
      severity: "Critical", 
      description: "Visible structural damage and poor installation",
      confidence: "89%"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Billboard Violation Reporting
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload a photo or use live camera to instantly detect violations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Upload Interface */}
          <Card className="p-6 border-border">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Report Billboard
                </h3>
                <p className="text-muted-foreground text-sm">
                  Take a photo or upload an existing image
                </p>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Click to upload image</p>
                    <p className="text-sm text-muted-foreground">or drag and drop here</p>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Auto-detected Location</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connaught Place, New Delhi, Delhi 110001
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Coordinates: 28.6304° N, 77.2177° E
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  variant="civic" 
                  className="w-full" 
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload & Analyze
                    </>
                  )}
                </Button>
                
                <Button variant="success" className="w-full">
                  <Camera className="w-4 h-4" />
                  Use Live Camera
                </Button>
              </div>

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing...</span>
                    <span className="text-primary font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </div>
          </Card>

          {/* Results Panel */}
          <Card className="p-6 border-border">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Analysis Results
                </h3>
                <p className="text-muted-foreground text-sm">
                  AI-powered violation detection
                </p>
              </div>

              {!analysisComplete && !isAnalyzing && (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Upload an image to see violation analysis</p>
                </div>
              )}

              {analysisComplete && (
                <div className="space-y-4">
                  
                  {/* Overall Status */}
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <span className="font-semibold text-destructive">Violations Detected</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      3 violations found - Immediate action required
                    </p>
                  </div>

                  {/* Violations List */}
                  <div className="space-y-3">
                    {violations.map((violation, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground">{violation.type}</h4>
                          <Badge 
                            variant={violation.severity === 'Critical' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {violation.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {violation.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Confidence:</span>
                          <span className="text-xs font-medium text-primary">{violation.confidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Report */}
                  <Button variant="warning" className="w-full">
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Violation Report
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};