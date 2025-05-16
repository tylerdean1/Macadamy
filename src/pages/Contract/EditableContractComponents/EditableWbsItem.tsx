import React, { useState } from 'react';
import { MapPin, Save, X, Edit } from 'lucide-react';
import { Input } from '@/pages/StandardPages/StandardPageComponents/input';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import type { WBSUpdate } from '@/lib/types';

interface EditableWbsItemProps {
  wbsId: string;
  wbsNumber: string;
  description: string;
  onUpdate: (wbsId: string, updates: WBSUpdate) => void;
  onViewMap: () => void;
  onDelete: (wbsId: string) => void;
}

export const EditableWbsItem: React.FC<EditableWbsItemProps> = ({
  wbsId,
  wbsNumber,
  description,
  onUpdate,
  onViewMap,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftWbsNumber, setDraftWbsNumber] = useState(wbsNumber);
  const [draftDescription, setDraftDescription] = useState(description);

  const handleSave = () => {
    onUpdate(wbsId, {
      wbs_number: draftWbsNumber,
      location: draftDescription,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftWbsNumber(wbsNumber);
    setDraftDescription(description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-background-light p-3 rounded-md border border-background-lighter">
        <div className="flex flex-col space-y-2">
          <Input
            value={draftWbsNumber}
            onChange={(e) => setDraftWbsNumber(e.target.value)}
            placeholder="WBS Number"
            aria-label="WBS Number"
          />
          <Input
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            placeholder="Description"
            aria-label="WBS Description"
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
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-medium">{wbsNumber}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onViewMap}
          leftIcon={<MapPin className="w-4 h-4" />}
          title="View map"
        />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)}
          leftIcon={<Edit className="w-4 h-4" />}
          title="Edit WBS"
        />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(wbsId)}
          leftIcon={<X className="w-4 h-4" />}
          className="text-red-500 hover:text-red-700"
          title="Delete WBS"
        />
      </div>
    </div>
  );
};
