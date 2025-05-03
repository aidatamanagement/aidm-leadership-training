
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
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const handleResize = () => {
      setIsMobile(mql.matches);
    }
    
    // Set initial value
    handleResize();
    
    // Modern API for matchMedia
    try {
      // Try to use the modern addEventListener API
      mql.addEventListener("change", handleResize);
      return () => mql.removeEventListener("change", handleResize);
    } catch (error) {
      // Fallback for older browsers that don't support addEventListener on matchMedia
      console.warn("Using legacy matchMedia API");
      mql.addListener(handleResize);
      return () => mql.removeListener(handleResize);
    }
  }, []);

  return isMobile;
}
