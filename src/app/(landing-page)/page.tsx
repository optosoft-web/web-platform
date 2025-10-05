import { Header } from "@/components/header"
import { HeroSection } from "@/features/landing/hero-section"
import { FeaturesSection } from "@/features/landing/features-section"
import { ComingSoonSection } from "@/features/landing/coming-soon-section"
import { PricingSection } from "@/features/landing/pricing-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ComingSoonSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
