// Compatibility file. The guide's content moved to data/places.json in October 2026.
// A browser that still has the old page saved loads this file: reload the current page instead.
location.replace(location.pathname + "?v=" + Date.now() + location.hash);
