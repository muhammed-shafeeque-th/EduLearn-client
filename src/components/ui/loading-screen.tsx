import { RouteFallback } from './route-fallback';

/** @deprecated Prefer RouteFallback for route-level suspense */
function LoadingScreen() {
  return <RouteFallback />;
}

export default LoadingScreen;
