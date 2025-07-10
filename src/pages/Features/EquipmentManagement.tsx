import FeatureListPage from '@/components/FeatureListPage';

const features = [
  'Equipment inventory with assignments',
  'Maintenance schedules and service logs',
  'Usage tracking and depreciation forecasting',
];

export default function EquipmentManagement() {
  return <FeatureListPage title="Equipment Management" features={features} />;
}
