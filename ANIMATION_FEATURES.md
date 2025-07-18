# 🎭 Animation System Documentation

I've implemented a comprehensive animation system for your Baguri website that provides smooth page transitions and component animations throughout the site.

## ✨ Features Implemented

### 1. **Page Transitions**
- Smooth fade-in/scale animations when navigating between pages
- Automatic transitions handled by `template.tsx` - no manual configuration needed
- Duration: 0.4s with easing for natural feel

### 2. **Animation Components**
All components are available from `@/components/ui/AnimatedComponents`:

#### **Container Animations**
- `<AnimatedContainer>` - Staggered animation for child elements
- `<AnimatedItem>` - Individual items within animated containers
- Perfect for product grids, lists, and card layouts

#### **Entrance Animations**
- `<FadeInUp delay={0.2}>` - Elements fade in from bottom
- `<FadeInLeft delay={0.2}>` - Elements slide in from left
- `<FadeInRight delay={0.2}>` - Elements slide in from right
- `<ScaleIn delay={0.2}>` - Elements scale up from center

#### **Interactive Elements**
- `<AnimatedButton>` - Buttons with hover scale and tap feedback
- `<AnimatedLink>` - Links with subtle hover animations
- `<AnimatedCard>` - Cards that lift on hover
- `<LoadingAnimation>` - Spinning loading indicator

### 3. **Where Animations Are Applied**

#### **Homepage (`/`)**
- Logo scales in on load
- Hero text fades in with staggered timing
- Feature cards animate in sequence
- Call-to-action buttons have interactive feedback
- Footer elements fade in

#### **Shop Page (`/shop`)**
- Page header fades in
- Product grid uses staggered container animation
- Each product card animates in individually
- Smooth hover effects on all interactive elements

### 4. **Animation Context**
The `AnimationContext` provides:
- Global animation state management
- Reusable animation variants
- Consistent timing and easing
- Page transition coordination

## 🚀 How to Use

### Basic Usage
```tsx
import { FadeInUp, AnimatedButton } from '@/components/ui/AnimatedComponents';

function MyComponent() {
  return (
    <FadeInUp>
      <h1>This title fades in from bottom</h1>
      <AnimatedButton onClick={handleClick}>
        Interactive Button
      </AnimatedButton>
    </FadeInUp>
  );
}
```

### Product Grids
```tsx
import { AnimatedContainer, AnimatedItem } from '@/components/ui/AnimatedComponents';

function ProductGrid({ products }) {
  return (
    <AnimatedContainer className="grid grid-cols-2 gap-4">
      {products.map(product => (
        <AnimatedItem key={product.id}>
          <ProductCard product={product} />
        </AnimatedItem>
      ))}
    </AnimatedContainer>
  );
}
```

### Staggered Content
```tsx
import { FadeInUp } from '@/components/ui/AnimatedComponents';

function Features() {
  return (
    <div>
      <FadeInUp delay={0}>
        <h2>First element</h2>
      </FadeInUp>
      <FadeInUp delay={0.2}>
        <p>Second element (200ms later)</p>
      </FadeInUp>
      <FadeInUp delay={0.4}>
        <button>Third element (400ms later)</button>
      </FadeInUp>
    </div>
  );
}
```

## 🎨 Animation Variants

The system includes pre-configured variants in `AnimationContext`:

- **pageVariants**: For page transitions
- **fadeInUp**: Bottom to top entrance
- **fadeInLeft/Right**: Horizontal entrances
- **scaleIn**: Scale-based entrance
- **staggerContainer**: Container for staggered children
- **staggerItem**: Individual staggered items

## ⚡ Performance

- All animations use hardware acceleration (transform, opacity)
- `whileInView` with `once: true` prevents repeated animations
- Viewport detection with `amount: 0.3` for optimal triggering
- Optimized for 60fps performance

## 🎯 Next Steps

To add animations to more pages:

1. Import the animation components you need
2. Wrap sections in animation containers
3. Add delays for staggered effects
4. Use interactive components for buttons/links

Example for a new page:
```tsx
import { FadeInUp, AnimatedContainer, AnimatedItem } from '@/components/ui/AnimatedComponents';

export default function NewPage() {
  return (
    <div>
      <FadeInUp>
        <h1>Page Title</h1>
      </FadeInUp>
      
      <AnimatedContainer className="grid grid-cols-2 gap-4">
        {items.map(item => (
          <AnimatedItem key={item.id}>
            <ItemCard item={item} />
          </AnimatedItem>
        ))}
      </AnimatedContainer>
    </div>
  );
}
```

## 🎪 The Result

Your website now has:
- ✅ Smooth page transitions between all routes
- ✅ Engaging entrance animations for content
- ✅ Interactive feedback on buttons and links
- ✅ Professional, polished user experience
- ✅ Consistent animation timing throughout

The animations make your Romanian fashion marketplace feel modern, smooth, and engaging for both shoppers and designers! 