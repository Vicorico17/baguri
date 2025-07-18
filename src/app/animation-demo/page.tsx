"use client";

import { 
  FadeInUp, 
  FadeInLeft, 
  FadeInRight, 
  ScaleIn, 
  AnimatedContainer, 
  AnimatedItem,
  AnimatedButton,
  AnimatedLink,
  AnimatedCard,
  LoadingAnimation 
} from '@/components/ui/AnimatedComponents';

export default function AnimationDemo() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      {/* Header */}
      <ScaleIn>
        <h1 className="text-4xl font-bold text-center mb-8">🎭 Baguri Animation Demo</h1>
      </ScaleIn>

      {/* Basic Entrance Animations */}
      <section className="max-w-4xl mx-auto mb-16">
        <FadeInUp>
          <h2 className="text-2xl font-semibold mb-8">Basic Entrance Animations</h2>
        </FadeInUp>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FadeInLeft>
            <div className="bg-zinc-800 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Fade In Left</h3>
              <p className="text-zinc-400">This content slides in from the left side.</p>
            </div>
          </FadeInLeft>

          <FadeInUp delay={0.2}>
            <div className="bg-zinc-800 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Fade In Up</h3>
              <p className="text-zinc-400">This content fades in from the bottom.</p>
            </div>
          </FadeInUp>

          <FadeInRight delay={0.4}>
            <div className="bg-zinc-800 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Fade In Right</h3>
              <p className="text-zinc-400">This content slides in from the right side.</p>
            </div>
          </FadeInRight>
        </div>
      </section>

      {/* Staggered Container Demo */}
      <section className="max-w-4xl mx-auto mb-16">
        <FadeInUp>
          <h2 className="text-2xl font-semibold mb-8">Staggered Product Grid (Like Shop Page)</h2>
        </FadeInUp>
        
        <AnimatedContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <AnimatedItem key={i}>
              <AnimatedCard className="bg-zinc-800 p-4 rounded-lg text-center">
                <div className="bg-amber-500 h-32 rounded mb-4"></div>
                <h3 className="font-medium">Product {i + 1}</h3>
                <p className="text-zinc-400 text-sm">Romanian Fashion</p>
                <p className="text-amber-200 font-bold mt-2">{150 + i * 25} lei</p>
              </AnimatedCard>
            </AnimatedItem>
          ))}
        </AnimatedContainer>
      </section>

      {/* Interactive Elements */}
      <section className="max-w-4xl mx-auto mb-16">
        <FadeInUp>
          <h2 className="text-2xl font-semibold mb-8">Interactive Elements</h2>
        </FadeInUp>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <AnimatedButton
            onClick={() => alert('Button clicked!')}
            className="px-6 py-3 bg-amber-500 text-zinc-900 rounded-full font-medium"
          >
            Animated Button
          </AnimatedButton>
          
          <AnimatedLink
            href="#"
            className="px-6 py-3 border border-zinc-600 rounded-full font-medium inline-block"
          >
            Animated Link
          </AnimatedLink>
          
          <div className="flex items-center gap-2">
            <LoadingAnimation />
            <span>Loading Animation</span>
          </div>
        </div>
      </section>

      {/* Scale In Demo */}
      <section className="max-w-4xl mx-auto mb-16">
        <FadeInUp>
          <h2 className="text-2xl font-semibold mb-8">Scale Animations</h2>
        </FadeInUp>
        
        <div className="text-center">
          <ScaleIn delay={0.2}>
            <div className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 p-8 rounded-full mb-4">
              <span className="text-4xl">🎯</span>
            </div>
          </ScaleIn>
          <FadeInUp delay={0.4}>
            <p className="text-zinc-400">Perfect for logos, icons, and emphasis elements</p>
          </FadeInUp>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-4xl mx-auto">
        <FadeInUp>
          <h2 className="text-2xl font-semibold mb-8">Feature Cards with Hover</h2>
        </FadeInUp>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatedCard className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
            <h3 className="text-xl font-semibold mb-4">🛍️ For Shoppers</h3>
            <ul className="space-y-2 text-zinc-400">
              <li>• Discover unique Romanian fashion</li>
              <li>• Smooth shopping experience</li>
              <li>• Interactive animations</li>
            </ul>
          </AnimatedCard>
          
          <AnimatedCard className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
            <h3 className="text-xl font-semibold mb-4">🎨 For Designers</h3>
            <ul className="space-y-2 text-zinc-400">
              <li>• Professional presentation</li>
              <li>• Engaging user interactions</li>
              <li>• Modern, polished feel</li>
            </ul>
          </AnimatedCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto mt-16 pt-8 border-t border-zinc-800 text-center">
        <FadeInUp>
          <p className="text-zinc-400">
            All animations are now live on your website! Navigate between pages to see smooth transitions.
          </p>
        </FadeInUp>
      </footer>
    </div>
  );
} 