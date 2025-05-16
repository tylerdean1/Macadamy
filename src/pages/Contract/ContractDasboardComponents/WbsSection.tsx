import { ChevronDown, ChevronRight } from 'lucide-react';
import { LineItemsTable } from '@/pages/Contract/ContractDasboardComponents/LineItemsTable';
import { GeometryButton } from '@/pages/Contract/SharedComponents/GoogleMaps/GeometryButton';
import type { GeometryData } from '@/lib/types';
import type { WBSGroup, ProcessedMap } from '@/lib/types';
import type { LineItem } from '@/hooks/contractHooks';

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
  onToggleMap,
  expandedMaps = [], // Add default empty array to prevent undefined errors
}: WbsSectionProps) {
  // Safety check for missing group properties
  const maps = group.maps || [];
  
  return (
    <div className="bg-gray-700 p-4 rounded-lg mb-6 shadow-md">
      <div className="flex justify-between items-start">
        <button
          onClick={() => onToggle(group.wbs_number)}
          className="flex flex-col text-white text-left"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            <span className="font-medium text-lg">
              WBS Number: {group.wbs_number}
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
            targetId={group.wbs_number}
            label="View WBS Map"
            onSaveSuccess={() => onWbsClick(group.wbs_number, group.coordinates ?? null)}
          />
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {maps.length > 0 ? (
            maps.map((map) => (
              <div key={map.id || `map-${map.map_number}`} className="border border-gray-600 rounded-md">
                <div className="flex justify-between items-start px-3 py-2 bg-gray-600 rounded-t-md">
                  <div
                    className="flex items-start gap-2 cursor-pointer"
                    onClick={() => onToggleMap(map.id)}
                  >
                    {(expandedMaps || []).includes(map.id) ? (
                      <ChevronDown size={16} className="mt-1" />
                    ) : (
                      <ChevronRight size={16} className="mt-1" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">
                        Map Number: {map.map_number}
                        {map.location_description && (
                          <span className="text-sm text-gray-300 ml-2 italic">
                            • {map.location_description}
                          </span>
                        )}
                      </div>
                      {typeof map.contractTotal === 'number' && (
                        <div className="text-xs text-gray-300 mt-1">
                          <span>Budget: ${map.contractTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                    </div>
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

                {(expandedMaps || []).includes(map.id) && (
                  <div className="px-3 py-2 bg-gray-700 rounded-b-md">
                    <LineItemsTable
                    items={
                      Array.isArray(map.line_items)
                        ? map.line_items.map((item) => ({
                            ...item,
                            total_cost:
                              typeof item.quantity === 'number' && typeof item.unit_price === 'number'
                                ? item.quantity * item.unit_price
                                : 0,
                            amount_paid:
                              typeof item.amount_paid === 'number'
                                ? item.amount_paid
                                : 0,
                          }))
                        : []
                    }
                    onLineItemClick={onLineItemClick}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-4">No maps available for this WBS</div>
          )}
        </div>
      )}
    </div>
  );
}
