import React from 'react';
import { Input } from '@/pages/StandardPages/StandardPageComponents/input';
import { Button } from '@/pages/StandardPages/StandardPageComponents/button';
import { ChevronDown, ChevronRight, Trash2, PlusCircle } from 'lucide-react';
import type { WbsClean as EditableWbsSection } from '@/lib/types';

interface EditableWbsSectionProps {
  section: EditableWbsSection;
  isExpanded: boolean;
  onToggle: (wbsId: string) => void;
  onChange: (updated: EditableWbsSection) => void;
  onDelete?: () => void;
  onAddMap?: () => void;
  children?: React.ReactNode;
}

export const EditableWbsSectionBlock: React.FC<EditableWbsSectionProps> = ({
  section,
  isExpanded,
  onToggle,
  onChange,
  onDelete,
  onAddMap,
  children,
}) => {
  return (
    <div className="border border-background-lighter rounded-lg overflow-hidden">
      <div
        className="w-full bg-background px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-background-light transition-colors gap-4 cursor-pointer"
        onClick={() => onToggle(section.id)}
      >
        <div className="flex items-center space-x-4 w-full">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          )}
          <div className="w-full space-y-1">
            <Input
              value={section.wbs_number}
              onChange={(e) => onChange({ ...section, wbs_number: e.target.value })}
              placeholder="WBS Number"
              className="text-lg font-semibold text-white"
              aria-label="WBS Number"
            />
            <Input
              value={section.description}
              onChange={(e) => onChange({ ...section, description: e.target.value })}
              placeholder="WBS Description"
              className="text-sm text-gray-400"
              aria-label="WBS Description"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onAddMap && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                onAddMap();
              }}
            >
              Add Map
            </Button>
          )}
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-background-light border-t border-background-lighter p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};