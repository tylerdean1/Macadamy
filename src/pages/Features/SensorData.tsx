import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Import drone imagery and jobsite photos',
  'Connect weather stations and IoT sensors',
  'Analyze trends in temperature and equipment data',
];

export default function SensorData() {
  return <FeatureListPage title="Drone & Sensor Data" features={features} />;
}
