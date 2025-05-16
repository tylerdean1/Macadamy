import React, { useState } from 'react';
import { MapPin, Save, X, Edit } from 'lucide-react';
import { Input } from '@/pages/StandardPages/StandardPageComponents/input';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import type { MapsUpdate } from '@/lib/types';

interface EditableMapItemProps {
  mapId: string;
  mapNumber: string;
  locationDescription: string;
  onUpdate: (mapId: string, updates: MapsUpdate) => void;
  onViewMap: () => void;
  onDelete: (mapId: string) => void;
}

export const EditableMapItem: React.FC<EditableMapItemProps> = ({
  mapId,
  mapNumber,
  locationDescription,
  onUpdate,
  onViewMap,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftMapNumber, setDraftMapNumber] = useState(mapNumber);
  const [draftLocationDescription, setDraftLocationDescription] = useState(locationDescription);

  const handleSave = () => {
    onUpdate(mapId, {
      map_number: draftMapNumber,
      location_description: draftLocationDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftMapNumber(mapNumber);
    setDraftLocationDescription(locationDescription);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-background p-3 rounded-md border border-background-lighter ml-4">
        <div className="flex flex-col space-y-2">
          <Input
            value={draftMapNumber}
            onChange={(e) => setDraftMapNumber(e.target.value)}
            placeholder="Map Number"
            aria-label="Map Number"
          />
          <Input
            value={draftLocationDescription}
            onChange={(e) => setDraftLocationDescription(e.target.value)}
            placeholder="Location Description"
            aria-label="Location Description"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleCancel}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSave}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center ml-4 py-1">
      <div>
        <h4 className="text-base font-medium">{mapNumber}</h4>
        <p className="text-xs text-gray-400">{locationDescription}</p>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onViewMap}
          leftIcon={<MapPin className="w-3 h-3" />}
          title="View map"
        />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)}
          leftIcon={<Edit className="w-3 h-3" />}
          title="Edit map"
        />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(mapId)}
          leftIcon={<X className="w-3 h-3" />}
          className="text-red-500 hover:text-red-700"
          title="Delete map"
        />
      </div>
    </div>
  );
};
