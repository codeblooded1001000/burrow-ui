/**
 * Custom JSON styles when no cloud Map ID is set (raster / legacy).
 * With vector Map IDs, prefer `colorScheme` on the Map — these still refine POI/labels.
 */
export const browseMapStyleLight = [
  { elementType: 'geometry', stylers: [{ color: '#f3f1ec' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5c5c5c' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f3f1ec' }, { weight: 3 }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#ebe8e2' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dde8da' }] },
  { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b7a72' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e3e0d8' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#d5d2ca' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9a9a9a' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c8e4df' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a94' }] },
] as const;

export const browseMapStyleDark = [
  { elementType: 'geometry', stylers: [{ color: '#1c2120' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a8b0ae' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1c2120' }, { weight: 3 }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#242b29' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1e2824' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3230' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1f1e' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#343d3b' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2524' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#8a9693' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#8a9693' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#7a8683' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a3d38' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a7a72' }] },
] as const;
