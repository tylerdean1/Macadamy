import { ChevronDown, ChevronRight } from 'lucide-react';
import { LineItemsTable } from '@/pages/Contract/ContractDasboardComponents/LineItemsTable';
import { GeometryButton } from '@/pages/Contract/SharedComponents/GoogleMaps/GeometryButton';
import type { GeometryData } from '@/lib/types';
import type { WBSGroup, ProcessedMap, LineItem } from '@/hooks/useContractData';

interface WbsSectionProps {
  group: WBSGroup;
  isExpanded: boolean;
  onToggle: (wbsId: string) => void;
  onMapClick: (map: ProcessedMap) => void;
  onWbsClick?: (wbsId: string, coordinates: GeometryData | null) => void;
  onLineItemClick?: (item: LineItem) => void;
  onToggleMap: (mapId: string) => void;
  expandedMaps: string[];
}

export function WbsSection({
  group,
  isExpanded,
  onToggle,
  onMapClick,
  onWbsClick,
  onLineItemClick,
}: WbsSectionProps) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-6 shadow-md">
      <div className="flex justify-between items-start">
        <button
          onClick={() => onToggle(group.wbs)}
          className="flex flex-col text-white text-left"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            <span className="font-medium text-lg">
              WBS Number: {group.wbs}
              {group.location && (
                <span className="text-sm text-gray-300 ml-2 italic">
                  • {group.location}
                </span>
              )}
            </span>
          </div>

          {(group.scope || typeof group.budget === 'number') && (
            <div className="text-sm text-gray-300 mt-1 ml-6">
              {group.scope && <span>Scope: {group.scope}</span>}
              {group.scope && typeof group.budget === 'number' && <span className="mx-2">|</span>}
              {typeof group.budget === 'number' && (
                <span>Budget: ${group.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              )}
            </div>
          )}
        </button>

        {onWbsClick && (
          <GeometryButton
            geometry={group.coordinates}
            wkt={null}
            table="wbs"
            targetId={group.id}
            label="View WBS Map"
            onSaveSuccess={() => onWbsClick(group.wbs, group.coordinates ?? null)}
          />
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {group.maps.map((map) => (
            <div key={map.id} className="border border-gray-600 rounded-md">
              <div className="flex justify-between items-start px-3 py-2 bg-gray-600 rounded-t-md">
                <div>
                  <div className="text-sm font-medium text-white">
                    Map Number: {map.map_number}
                    {map.location_description && (
                      <span className="text-sm text-gray-300 ml-2 italic">
                        • {map.location_description}
                      </span>
                    )}
                  </div>
                  {(map.scope || typeof map.contractTotal === 'number') && (
                    <div className="text-xs text-gray-300 mt-1">
                      {map.scope && <span>Scope: {map.scope}</span>}
                      {map.scope && typeof map.contractTotal === 'number' && <span className="mx-2">|</span>}
                      {typeof map.contractTotal === 'number' && (
                        <span>Budget: ${map.contractTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      )}
                    </div>
                  )}
                </div>

                <GeometryButton
                  geometry={map.coordinates}
                  wkt={null}
                  table="maps"
                  targetId={map.id}
                  label="View Map"
                  onSaveSuccess={() => onMapClick(map)}
                />
              </div>

              <div className="px-3 py-2 bg-gray-700 rounded-b-md">
                <LineItemsTable items={map.line_items} onLineItemClick={onLineItemClick} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
