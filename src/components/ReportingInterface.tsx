import { useState, useRef } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Upload,
  Loader2,
  LogIn
} from "lucide-react";

export const ReportingInterface = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [violations, setViolations] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [location, setLocation] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Get user's location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            lat: latitude,
            lng: longitude,
            address: "Location detected automatically"
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Connaught Place, New Delhi
          setLocation({
            lat: 28.6304,
            lng: 77.2177,
            address: "Connaught Place, New Delhi, Delhi 110001"
          });
        }
      );
    } else {
      // Default location if geolocation not supported
      setLocation({
        lat: 28.6304,
        lng: 77.2177,
        address: "Connaught Place, New Delhi, Delhi 110001"
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      if (!location) getCurrentLocation();
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file.",
      });
    }
  };

  const handleAnalyzeImage = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to submit a report.",
      });
      return;
    }

    if (!selectedFile || !location) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select an image and allow location access.",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setViolations([]);
    setAnalysisComplete(false);

    try {
      // Convert file to base64
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const base64File = e.target?.result;
        
        // Progress simulation
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 15;
          });
        }, 500);

        // Submit report
        const { data, error } = await supabase.functions.invoke('submit-report', {
          body: {
            imageFile: base64File,
            location
          }
        });

        clearInterval(progressInterval);
        
        if (error) {
          throw error;
        }

        // Poll for analysis results
        const reportId = data.reportId;
        const checkResults = async () => {
          const { data: reportData, error: fetchError } = await supabase
            .from('billboard_reports')
            .select(`
              *,
              violations (*)
            `)
            .eq('id', reportId)
            .single();

          if (fetchError) {
            console.error('Error fetching results:', fetchError);
            return;
          }

          if (reportData.status === 'completed') {
            setViolations(reportData.violations || []);
            setProgress(100);
            setIsAnalyzing(false);
            setAnalysisComplete(true);
            
            toast({
              title: "Analysis complete",
              description: `Found ${reportData.violations?.length || 0} violations.`,
            });
          } else {
            // Continue polling
            setTimeout(checkResults, 2000);
          }
        };

        setTimeout(checkResults, 3000);
      };

      fileReader.readAsDataURL(selectedFile);

    } catch (error: any) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
      setProgress(0);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message || "Please try again later.",
      });
    }
  };

  return (
    <section id="reporting-section" className="py-20 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Billboard Violation Reporting
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload a photo or use live camera to instantly detect violations
          </p>
        </div>

        {!user && (
          <div className="text-center mb-8">
            <Card className="p-6 bg-warning/10 border-warning/20">
              <div className="flex items-center justify-center gap-3 mb-4">
                <LogIn className="w-6 h-6 text-warning" />
                <h3 className="text-lg font-semibold text-foreground">Authentication Required</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Please sign in to submit billboard violation reports and help keep our city safe.
              </p>
              <Button variant="civic" onClick={() => window.location.href = '/auth'}>
                Sign In to Continue
              </Button>
            </Card>
          </div>
        )}

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
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      {selectedFile ? selectedFile.name : "Click to upload image"}
                    </p>
                    <p className="text-sm text-muted-foreground">or drag and drop here</p>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">
                    {location ? "Location Detected" : "Auto-detecting Location"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {location?.address || "Waiting for location access..."}
                </p>
                {location && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Coordinates: {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  variant="civic" 
                  className="w-full" 
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing || !user || !selectedFile}
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
                
                <Button 
                  variant="success" 
                  className="w-full"
                  disabled={!user}
                  onClick={() => {
                    if (!location) getCurrentLocation();
                    // In a real app, this would trigger camera capture
                    toast({
                      title: "Camera feature",
                      description: "Camera capture will be implemented in the next version.",
                    });
                  }}
                >
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
                  <p>{!user ? "Sign in and upload an image to analyze" : "Upload an image to see violation analysis"}</p>
                </div>
              )}

              {analysisComplete && (
                <div className="space-y-4">
                  
                  {/* Overall Status */}
                  <div className={`${violations.length > 0 ? 'bg-destructive/10 border-destructive/20' : 'bg-success/10 border-success/20'} rounded-lg p-4`}>
                    <div className="flex items-center gap-3 mb-2">
                      {violations.length > 0 ? (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      )}
                      <span className={`font-semibold ${violations.length > 0 ? 'text-destructive' : 'text-success'}`}>
                        {violations.length > 0 ? 'Violations Detected' : 'No Violations Found'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {violations.length > 0 
                        ? `${violations.length} violations found - ${violations.some((v: any) => v.severity === 'critical') ? 'Immediate action required' : 'Review recommended'}`
                        : 'This billboard appears to comply with all regulations'
                      }
                    </p>
                  </div>

                  {/* Violations List */}
                  {violations.length > 0 && (
                    <div className="space-y-3">
                      {violations.map((violation: any, index: number) => (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-foreground capitalize">{violation.violation_type} Violation</h4>
                            <Badge 
                              variant={violation.severity === 'critical' ? 'destructive' : 'secondary'}
                              className="text-xs capitalize"
                            >
                              {violation.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {violation.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Confidence:</span>
                            <span className="text-xs font-medium text-primary">{Math.round(violation.confidence_score)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submit Report */}
                  <Button 
                    variant={violations.length > 0 ? "warning" : "success"} 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Report submitted",
                        description: "Your report has been submitted to the authorities.",
                      });
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {violations.length > 0 ? 'Submit Violation Report' : 'Mark as Compliant'}
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