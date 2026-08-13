import dashboardUi from '@/assets/images/dashboard_ui.jpg';
import featureCompliance from '@/assets/images/feature_compliance.jpg';
import featureOptimization from '@/assets/images/feature_optimization.jpg';
import featureTracking from '@/assets/images/feature_tracking.jpg';
import globalCargoPlane from '@/assets/images/global_cargo_plane.jpg';
import heroQuayvox from '@/assets/images/hero_quayvox.png';
import opsCenterBg from '@/assets/images/ops_center_bg.jpg';
import routeHighway from '@/assets/images/route_highway.jpg';
import visibilityAerial from '@/assets/images/visibility_aerial.jpg';

/** Bundled image URLs — prefer these over `/images/...` public paths */
export const images = {
  dashboardUi,
  featureCompliance,
  featureOptimization,
  featureTracking,
  globalCargoPlane,
  heroMap: heroQuayvox,
  opsCenterBg,
  routeHighway,
  visibilityAerial,
} as const;
