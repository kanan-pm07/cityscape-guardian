import { HeroSection } from "@/components/HeroSection";
import { FeatureSection } from "@/components/FeatureSection";
import { ReportingInterface } from "@/components/ReportingInterface";

const Index = () => {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeatureSection />
      <ReportingInterface />
    </main>
  );
};

export default Index;
