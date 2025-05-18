import { MapPin, GitBranch, Triangle } from 'lucide-react';

interface GeometryTypeButtonProps {
  type: 'Point' | 'LineString' | 'Polygon';
  isActive: boolean;
  onClick: () => void;
}

/**
 * A button for selecting geometry types in the MapModal
 */
export function GeometryTypeButton({
  type,
  isActive,
  onClick,
}: GeometryTypeButtonProps) {
  const getIcon = () => {
    switch (type) {
      case 'Point':
        return <MapPin size={18} />;
      case 'LineString':
        return <GitBranch size={18} />;
      case 'Polygon':
        return <Triangle size={18} />;
      default:
        return <MapPin size={18} />;
    }
  };
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
      }`}
      type="button"
    >
      {getIcon()}
      {type}
    </button>
  );
}
