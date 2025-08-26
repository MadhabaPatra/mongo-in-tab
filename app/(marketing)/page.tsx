import { HeroSection } from "@/components/hero-section";
import { BadgesSection } from "@/components/badges-section";
import { FeaturesSection } from "@/components/features-section";
import { TestimonialSection } from "@/components/testimonial-section";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <BadgesSection />
      <FeaturesSection />
      <TestimonialSection />
    </div>
  );
}
