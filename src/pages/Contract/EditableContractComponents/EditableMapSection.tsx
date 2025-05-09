import React from 'react';
import { Input } from '@/pages/StandardPages/StandardPageComponents/input';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { MapPin, Trash2 } from 'lucide-react';
import type { MapsClean as EditableMap } from '@/lib/types';


interface EditableMapSectionProps {
  map: EditableMap;
  onChange: (updated: EditableMap) => void;
  onViewGeometry?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}

export const EditableMapSectionBlock: React.FC<EditableMapSectionProps> = ({
  map,
  onChange,
  onViewGeometry,
  onDelete,
  children,
}) => {
  return (
    <div className="border-l-2 border-background-lighter pl-4 mb-4 space-y-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <Input
            value={map.map_number}
            onChange={(e) => onChange({ ...map, map_number: e.target.value })}
            placeholder="Map Number"
            className="text-md font-semibold text-white"
            aria-label="Map Number"
          />
          <Input
            value={map.location_description}
            onChange={(e) =>
              onChange({ ...map, location_description: e.target.value })
            }
            placeholder="Location Description"
            className="text-sm text-gray-400"
            aria-label="Map Location Description"
          />
        </div>

        <div className="flex items-center gap-2">
          {onViewGeometry && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MapPin className="w-4 h-4" />}
              onClick={onViewGeometry}
            >
              Geometry
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};