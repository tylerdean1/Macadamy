import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  ClipboardList,
  AlertTriangle,
  Clipboard,
  Settings,
  Users,
  FileWarning,
  Calculator,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { ContractStatusSelect } from '@/components/ContractStatusSelect';
import { Button } from '@mui/material';
import MapPinIcon from '@mui/icons-material/PinDrop';
import MapModal from '@/components/MapModal';
import { parse as parseWKT } from '@terraformer/wkt';
import type { GeometryData, GeometryType } from '../lib/types';

function parseCoordinates(wkt: unknown): GeometryData | null {
  try {
    if (typeof wkt !== 'string') return null;
    const geoJSON = parseWKT(wkt) as GeoJSON.Geometry;
    if (
      (geoJSON.type === 'Point' || geoJSON.type === 'LineString' || geoJSON.type === 'Polygon') &&
      geoJSON.coordinates
    ) {
      return {
        type: geoJSON.type as GeometryType,
        coordinates: geoJSON.coordinates,
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing WKT:', error);
    return null;
  }
}

type Contract = Database['public']['Tables']['contracts']['Row'];

interface LineItem {
  id: string;
  line_code: string;
  description: string;
  unit_measure: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  reference_doc: string | null;
  map_id: string;
  line_item_entries?: { computed_output?: number | null }[];
}

interface MapLocation {
  id: string;
  map_number: string;
  location_description: string | null;
  coordinates?: GeometryData | null;
  line_items: LineItem[];
  contractTotal: number;
  amountPaid: number;
  progress: number;
}

interface WBSGroup {
  wbs: string;
  description: string;
  maps: MapLocation[];
  contractTotal: number;
  amountPaid: number;
  progress: number;
}

interface ToolButton {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}

export function ContractDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wbsGroups, setWbsGroups] = useState<WBSGroup[]>([]);
  const [openMapModal, setOpenMapModal] = useState(false);
  const [modalPins, setModalPins] = useState<{ lat: number; lng: number; label?: string }[]>([]);
  const [expandedWBS, setExpandedWBS] = useState<string[]>([]);
  const [expandedMaps, setExpandedMaps] = useState<string[]>([]);

  const toolButtons: ToolButton[] = [
    {
      icon: <Clipboard className="w-5 h-5" />,
      label: "Daily Reports",
      onClick: () => navigate(`/contracts/${id}/daily-reports`),
      color: "bg-blue-500/30 text-blue-500 hover:bg-blue-500/40"
    },
    {
      icon: <Truck className="w-5 h-5" />,
      label: "Equipment Log",
      onClick: () => navigate(`/contracts/${id}/equipment`),
      color: "bg-green-500/30 text-green-500 hover:bg-green-500/40"
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Labor Records",
      onClick: () => navigate(`/contracts/${id}/labor`),
      color: "bg-purple-500/30 text-purple-500 hover:bg-purple-500/40"
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Issues",
      onClick: () => navigate(`/contracts/${id}/issues`),
      color: "bg-amber-500/30 text-amber-500 hover:bg-amber-500/40"
    },
    {
      icon: <FileWarning className="w-5 h-5" />,
      label: "Change Orders",
      onClick: () => navigate(`/contracts/${id}/change-orders`),
      color: "bg-red-500/30 text-red-500 hover:bg-red-500/40"
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Inspections",
      onClick: () => navigate(`/contracts/${id}/inspections`),
      color: "bg-cyan-500/30 text-cyan-500 hover:bg-cyan-500/40"
    },
    {
      icon: <Calculator className="w-5 h-5" />,
      label: "Calculators",
      onClick: () => navigate(`/contracts/${id}/calculators`),
      color: "bg-indigo-500/30 text-indigo-500 hover:bg-indigo-500/40"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      onClick: () => navigate(`/contracts/${id}/contractsettings`),
      color: "bg-gray-500/30 text-gray-500 hover:bg-gray-500/40"
    }
  ];

  // Use useCallback to optimize fetching contract data
  const fetchContract = useCallback(async () => {
    try {
      if (!id) {
        setError('Contract ID is required');
        return;
      }

      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (contractError) throw contractError;
      if (!contractData) {
        setError('Contract not found');
        return;
      }

      setContract(contractData);

      const { data: wbsData, error: wbsError } = await supabase
        .from('wbs')
        .select('id, wbs_number, description')
        .eq('contract_id', id)
        .order('wbs_number');

      if (wbsError) throw wbsError;

      const processedGroups = await Promise.all(
        (wbsData || []).map(async (wbs) => {
          const { data: mapLocations, error: mapError } = await supabase
            .from('maps')
            .select('*')
            .eq('wbs_id', wbs.id)
            .order('map_number');

          if (mapError) throw mapError;

          const processedMaps = await Promise.all(
            (mapLocations || []).map(async (map) => {
              const { data: lineItems, error: lineError } = await supabase
                .from('line_items')
                .select(`
                  id,
                  line_code,
                  description,
                  unit_measure,
                  quantity,
                  unit_price,
                  reference_doc,
                  map_id,
                  line_item_entries (
                    id,
                    computed_output
                  )
                `)
                .eq('map_id', map.id)
                .order('line_code');

              if (lineError) throw lineError;

              const processedLineItems = (lineItems || []).map((item) => {
                if (!item.map_id) {
                  throw new Error(`Missing map_id for line_item ${item.id}`);
                }
              
                const totalComputedOutput = (item.line_item_entries || []).reduce(
                  (sum, entry) => sum + (entry.computed_output ?? 0),
                  0
                );
              
                return {
                  ...item,
                  map_id: item.map_id, // safe to use now
                  total_cost: (item.quantity ?? 0) * (item.unit_price ?? 0),
                  amount_paid: totalComputedOutput * (item.unit_price ?? 0),
                };
              });

              const mapTotal = processedLineItems.reduce(
                (sum, item) => sum + item.total_cost,
                0
              );

              const mapPaid = processedLineItems.reduce(
                (sum, item) => sum + item.amount_paid,
                0
              );

              return {
                id: map.id,
                map_number: map.map_number,
                location_description: map.location_description || null,
                coordinates: parseCoordinates(map.coordinates) || null,
                line_items: processedLineItems,
                contractTotal: mapTotal,
                amountPaid: mapPaid,
                progress: mapTotal > 0 ? Math.round((mapPaid / mapTotal) * 100) : 0,
              };
            })
          );

          const wbsTotal = processedMaps.reduce((sum, m) => sum + m.contractTotal, 0);
          const wbsPaid = processedMaps.reduce((sum, m) => sum + m.amountPaid, 0);

          return {
            wbs: wbs.wbs_number,
            description: wbs.description ?? '',
            maps: processedMaps,
            contractTotal: wbsTotal,
            amountPaid: wbsPaid,
            progress: wbsTotal > 0 ? Math.round((wbsPaid / wbsTotal) * 100) : 0,
          };
        })
      );

      setWbsGroups(processedGroups);
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Error loading contract details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const handleMapLevelClick = (map: MapLocation) => {
    const parsed = map.coordinates;
    if (!parsed) {
      alert('No valid coordinates for this map location.');
      return;
    }
  
    if (parsed.type === 'Point' && Array.isArray(parsed.coordinates)) {
      const coords = parsed.coordinates as [number, number];
      setModalPins([
        {
          lat: coords[1],
          lng: coords[0],
          label: map.location_description || undefined,
        },
      ]);
    } else if (parsed.type === 'LineString' && Array.isArray(parsed.coordinates)) {
      const coords = parsed.coordinates as [number, number][];
      setModalPins(
        coords.map(([lng, lat]) => ({
          lat,
          lng,
          label: map.location_description || undefined,
        }))
      );
    } else if (parsed.type === 'Polygon' && Array.isArray(parsed.coordinates)) {
      const coords = parsed.coordinates as [number, number][][];
      setModalPins(
        coords[0].map(([lng, lat]) => ({
          lat,
          lng,
          label: map.location_description || undefined,
        }))
      );
    } else {
      alert('Unsupported or malformed geometry type.');
      return;
    }
  
    setOpenMapModal(true);
  };

  const handleWbsLevelClick = (group: WBSGroup) => {
    const pins = group.maps.flatMap((map) => {
      const parsed = map.coordinates;
      if (!parsed) return [];
  
      if (parsed.type === 'Point' && Array.isArray(parsed.coordinates)) {
        const coords = parsed.coordinates as [number, number];
        return [
          {
            lat: coords[1],
            lng: coords[0],
            label: map.location_description || undefined,
          },
        ];
      }
  
      if (parsed.type === 'LineString' && Array.isArray(parsed.coordinates)) {
        const coords = parsed.coordinates as [number, number][];
        return coords.map(([lng, lat]) => ({
          lat,
          lng,
          label: map.location_description || undefined,
        }));
      }
  
      if (parsed.type === 'Polygon' && Array.isArray(parsed.coordinates)) {
        const coords = parsed.coordinates as [number, number][][];
        return coords[0].map(([lng, lat]) => ({
          lat,
          lng,
          label: map.location_description || undefined,
        }));
      }
  
      return [];
    });
  
    if (pins.length > 0) {
      setModalPins(pins);
      setOpenMapModal(true);
    } else {
      alert('No valid coordinates found in this WBS group.');
    }
  };


  // Calculate overall contract totals
  const totals = React.useMemo(() => {
    return wbsGroups.reduce(
      (acc, group) => ({
        contractTotal: acc.contractTotal + group.contractTotal,
        amountPaid: acc.amountPaid + group.amountPaid,
        progress: 0,
      }),
      { contractTotal: 0, amountPaid: 0, progress: 0 }
    );
  }, [wbsGroups]);

  const overallProgress = totals.contractTotal
    ? Math.round((totals.amountPaid / totals.contractTotal) * 100)
    : 0;

  const toggleWBS = (wbs: string) => {
    setExpandedWBS((prev) =>
      prev.includes(wbs) ? prev.filter((item) => item !== wbs) : [...prev, wbs]
    );
  };

  const toggleMap = (mapId: string) => {
    setExpandedMaps((prev) =>
      prev.includes(mapId) ? prev.filter((id) => id !== mapId) : [...prev, mapId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">{error || 'Contract not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-background-light rounded-lg shadow-lg border border-background-lighter p-6">
          <div className="border-b border-background-lighter pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">
                    {contract.title || 'N/A'}
                  </h1>
                  <ContractStatusSelect
                    value={contract.status as Contract['status']}
                    onChange={async (newStatus) => {
                      const { error } = await supabase
                        .from('contracts')
                        .update({ status: newStatus })
                        .eq('id', contract.id);
                      if (!error) {
                        setContract((prev) =>
                          prev ? { ...prev, status: newStatus } : null
                        );
                      }
                    }}
                  />
                </div>
                <h2 className="text-lg sm:text-xl text-gray-400">{contract.description}</h2>
              </div>
              <div className="w-full sm:w-auto text-left sm:text-right">
                <p className="text-sm text-gray-500">Contract Period</p>
                <p className="text-gray-300">
                  {contract.start_date && contract.end_date
                    ? `${new Date(contract.start_date).toLocaleDateString()} - ${new Date(contract.end_date).toLocaleDateString()}`
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {toolButtons.map((btn, index) => (
              <button
                key={index}
                onClick={btn.onClick}
                className={`flex items-center justify-center gap-2 rounded-md transition-colors ${btn.color} p-2`}
              >
                {btn.icon}
                <span className="hidden sm:inline">{btn.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {wbsGroups.map((group) => (
              <div
                key={group.wbs}
                className="border border-background-lighter rounded-lg overflow-hidden"
              >
                <div
                  onClick={() => toggleWBS(group.wbs)}
                  className="w-full bg-background px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-background-light transition-colors gap-4 cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    {expandedWBS.includes(group.wbs) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">WBS {group.wbs}</h3>
                      <p className="text-sm text-gray-400">{group.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outlined"
                    startIcon={<MapPinIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWbsLevelClick(group);
                    }}
                    size="small"
                  >
                    View WBS Map
                  </Button>
                </div>
                {expandedWBS.includes(group.wbs) && (
                  <div className="bg-background-light border-t border-background-lighter">
                    {group.maps.map((map) => (
                      <div
                        key={map.id}
                        className="border-b border-background-lighter last:border-b-0"
                      >
                        <button
                          onClick={() => toggleMap(map.id)}
                          className="w-full px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-background transition-colors gap-4"
                        >
                          <div className="flex items-center space-x-4">
                            {expandedMaps.includes(map.id) ? (
                              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                            <div>
                              <h4 className="text-md font-medium text-white">Map {map.map_number}</h4>
                              <p className="text-sm text-gray-400">{map.location_description}</p>
                            </div>
                          </div>
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<MapPinIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMapLevelClick(map);
                            }}
                          >
                            View
                          </Button>
                        </button>
                        {expandedMaps.includes(map.id) && (
                          <div className="overflow-x-auto">
                            {/* Optional: Add line item or detail view here */}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-background-light p-4 sm:p-6 rounded-lg mt-6 border border-background-lighter">
            <h3 className="text-xl font-semibold text-white mb-4">Contract Totals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Contract Value</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  ${totals.contractTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Amount Paid</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  ${totals.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Overall Progress</p>
                <div className="flex items-center">
                  <div className="w-24 sm:w-32 bg-background-lighter rounded-full h-3 mr-3">
                    <div
                      className="bg-primary rounded-full h-3 progress-bar"
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {overallProgress}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <MapModal
            isOpen={openMapModal}
            onClose={() => setOpenMapModal(false)}
            mapLocations={modalPins}
          />
        </div>
      </div>
    </div>
  );
}