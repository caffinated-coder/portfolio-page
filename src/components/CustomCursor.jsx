import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const cursorWrapperRef = useRef(null);

  useEffect(() => {
    // Check if device supports hover/pointer coordinates (disable custom cursor on touchscreen/mobile)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const wrapper = cursorWrapperRef.current;
    if (!dot || !ring || !wrapper) return;

    // Initially position out of screen
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });

    // GSAP quickTo functions for 60fps high-performance positioning
    const xDotTo = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3.out' });
    const yDotTo = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3.out' });
    
    // The outer ring has slightly longer duration to create a trailing follow effect
    const xRingTo = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' });
    const yRingTo = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' });

    const handleMouseMove = (e) => {
      // Reveal the cursor wrapper once mouse starts moving
      if (wrapper.style.opacity === '0' || !wrapper.style.opacity) {
        wrapper.style.opacity = '1';
      }
      
      xDotTo(e.clientX);
      yDotTo(e.clientY);
      xRingTo(e.clientX);
      yRingTo(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Event Delegation: Track hovered elements for scale morphs
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // Check if target is clickable or input element
      const isInteractive = target.closest('a, button, .skill-tag, .pub-link, input, textarea, .social-pill-link');
      
      if (isInteractive) {
        wrapper.classList.add('cursor-hovering');
        
        // Custom morph if hovering inputs
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          wrapper.classList.add('cursor-text-focus');
        }
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      if (!target) return;

      const isInteractive = target.closest('a, button, .skill-tag, .pub-link, input, textarea, .social-pill-link');
      if (isInteractive) {
        wrapper.classList.remove('cursor-hovering');
        wrapper.classList.remove('cursor-text-focus');
      }
    };

    document.body.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <div 
      className="custom-cursor-wrapper" 
      ref={cursorWrapperRef}
      style={{ opacity: 0 }}
    >
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </div>
  );
}
