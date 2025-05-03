
import * as React from "react"

// This matches the Tailwind md breakpoint (768px)
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initialize with the correct value on the client side
    if (typeof window !== 'undefined') {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    // Default to false on server side
    return false;
  });

  React.useEffect(() => {
    // Safety check for SSR environments
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }

    // Use both matchMedia for more modern browsers and resize for broader compatibility
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    try {
      // Modern API for matchMedia
      mql.addEventListener("change", handleResize);
    } catch (e) {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize);
    }
    
    // Set initial value
    handleResize();
    
    return () => {
      try {
        mql.removeEventListener("change", handleResize);
      } catch (e) {
        window.removeEventListener('resize', handleResize);
      }
    }
  }, []);

  return isMobile;
}
