import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

export default function TextReveal({ children, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Grab all split words
    const words = container.querySelectorAll('.reveal-word');
    if (words.length === 0) return;

    // Stagger reveal of words on ScrollTrigger
    const anim = gsap.to(words, {
      scrollTrigger: {
        trigger: container,
        start: 'top 88%', // Trigger when top of container is 88% down the screen
        toggleActions: 'play none none reverse', // Re-reveal if scrolling back up
      },
      y: '0%',
      duration: 0.85,
      stagger: 0.03, // Slight staggered gap between words
      ease: 'power4.out',
    });

    return () => {
      if (anim.scrollTrigger) anim.scrollTrigger.kill();
      anim.kill();
    };
  }, [children]);

  // Handle case where children is not a simple string
  if (typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }

  // Split string into individual words
  const words = children.split(' ');

  return (
    <span ref={containerRef} className={`reveal-text-container ${className}`}>
      {words.map((word, index) => (
        <span key={index} className="reveal-word-wrapper">
          <span className="reveal-word">
            {word}
            {/* Add trailing space after word to maintain paragraph spacing */}
            {index < words.length - 1 ? '\u00A0' : ''}
          </span>
        </span>
      ))}
    </span>
  );
}
