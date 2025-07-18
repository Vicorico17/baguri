"use client";

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { 
  fadeInUp, 
  fadeInLeft, 
  fadeInRight, 
  scaleIn, 
  staggerContainer, 
  staggerItem 
} from '@/contexts/AnimationContext';

// Animated container for staggered children
export function AnimatedContainer({ 
  children, 
  className = "",
  ...props 
}: { 
  children: React.ReactNode;
  className?: string;
} & MotionProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.3 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated item for use within staggered containers
export function AnimatedItem({ 
  children, 
  className = "",
  ...props 
}: { 
  children: React.ReactNode;
  className?: string;
} & MotionProps) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade in up animation
export function FadeInUp({ 
  children, 
  className = "",
  delay = 0,
  ...props 
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
} & MotionProps) {
  return (
    <motion.div
      initial={fadeInUp.initial}
      whileInView={fadeInUp.animate}
      transition={{ ...fadeInUp.transition, delay }}
      viewport={{ once: true, amount: 0.3 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade in from left
export function FadeInLeft({ 
  children, 
  className = "",
  delay = 0,
  ...props 
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
} & MotionProps) {
  return (
    <motion.div
      initial={fadeInLeft.initial}
      whileInView={fadeInLeft.animate}
      transition={{ ...fadeInLeft.transition, delay }}
      viewport={{ once: true, amount: 0.3 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade in from right
export function FadeInRight({ 
  children, 
  className = "",
  delay = 0,
  ...props 
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
} & MotionProps) {
  return (
    <motion.div
      initial={fadeInRight.initial}
      whileInView={fadeInRight.animate}
      transition={{ ...fadeInRight.transition, delay }}
      viewport={{ once: true, amount: 0.3 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scale in animation
export function ScaleIn({ 
  children, 
  className = "",
  delay = 0,
  ...props 
}: { 
  children: React.ReactNode;
  className?: string;
  delay?: number;
} & MotionProps) {
  return (
    <motion.div
      initial={scaleIn.initial}
      whileInView={scaleIn.animate}
      transition={{ ...scaleIn.transition, delay }}
      viewport={{ once: true, amount: 0.3 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated button with hover and tap effects
export function AnimatedButton({ 
  children, 
  className = "",
  onClick,
  ...props 
}: { 
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
} & Omit<MotionProps, 'onClick'> & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Animated link with hover effects
export function AnimatedLink({ 
  children, 
  className = "",
  href,
  ...props 
}: { 
  children: React.ReactNode;
  className?: string;
  href?: string;
} & Omit<MotionProps, 'href'> & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <motion.a
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      className={className}
      href={href}
      {...props}
    >
      {children}
    </motion.a>
  );
}

// Card with hover animation
export function AnimatedCard({ 
  children, 
  className = "",
  ...props 
}: { 
  children: React.ReactNode;
  className?: string;
} & MotionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
      viewport={{ once: true, amount: 0.3 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Loading animation
export function LoadingAnimation({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`w-6 h-6 border-2 border-current border-t-transparent rounded-full ${className}`}
    />
  );
} 