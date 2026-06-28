import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Magnetic({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Attach listeners to track local mouse coordinates relative to element center
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const bounding = element.getBoundingClientRect();
      
      // Calculate center coordinates of the element
      const centerX = bounding.left + bounding.width / 2;
      const centerY = bounding.top + bounding.height / 2;

      // Calculate distance offset vector from center
      const offsetX = clientX - centerX;
      const offsetY = clientY - centerY;

      // Pull the button towards the cursor (move it by 35% of the mouse distance offset)
      gsap.to(element, {
        x: offsetX * 0.35,
        y: offsetY * 0.35,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    // Return to starting position with smooth elastic rebound when mouse leaves
    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.3)',
        overwrite: 'auto'
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Wrap the child element, cloning it to pass our ref
  // This allows us to apply the ref directly to the wrapped child without adding wrapper divs
  const child = React.Children.only(children);
  return React.cloneElement(child, {
    ref: containerRef,
    // Add custom inline block styling to ensure transforms behave correctly
    style: { 
      ...child.props.style, 
      display: 'inline-block',
      transformStyle: 'preserve-3d'
    }
  });
}
