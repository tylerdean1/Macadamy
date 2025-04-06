import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Edit2, 
  Truck,
  ClipboardList,
  AlertTriangle,
  Clipboard,
  Settings,
  Users,
  FileWarning,
  Calculator,
  Bug
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import type { Database } from '../lib/database.types';

type Contract = Database['public']['Tables']['contracts']['Row'];

interface LineItem {
  id?: string;
  line_code: string;
  description: string;
  unit_measure: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  reference_doc: string | null;
  quantity_completed: number;
  amount_paid: number;
  map_id: string;
}

interface MapLocation {
  id: string;
  map_number: string;
  location_description: string;
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
  const [expandedWBS, setExpandedWBS] = useState<string[]>([]);
  const [expandedMaps, setExpandedMaps] = useState<string[]>([]);
  const [wbsGroups, setWbsGroups] = useState<WBSGroup[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const user = useAuthStore(state => state.user);
  console.log(user) //delete this later when we do set up a call for the user function
  const toolButtons: ToolButton[] = [
    {
      icon: <Clipboard className="w-5 h-5" />,
      label: "Daily Reports",
      onClick: () => navigate(`/contracts/${id}/daily-reports`),
      color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
    },
    {
      icon: <Truck className="w-5 h-5" />,
      label: "Equipment Log",
      onClick: () => navigate(`/contracts/${id}/equipment`),
      color: "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Labor Records",
      onClick: () => navigate(`/contracts/${id}/labor`),
      color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Issues",
      onClick: () => navigate(`/contracts/${id}/issues`),
      color: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
    },
    {
      icon: <FileWarning className="w-5 h-5" />,
      label: "Change Orders",
      onClick: () => navigate(`/contracts/${id}/change-orders`),
      color: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Inspections",
      onClick: () => navigate(`/contracts/${id}/inspections`),
      color: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20"
    },
    {
      icon: <Calculator className="w-5 h-5" />,
      label: "Calculators",
      onClick: () => navigate(`/contracts/${id}/calculators`),
      color: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      onClick: () => navigate(`/contracts/${id}/settings`),
      color: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  ];

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      if (!id) {
        setError('Contract ID is required');
        return;
      }

      if (debugMode) {
        console.group('Fetching Contract Data');
        console.time('Contract Fetch Duration');
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

      if (debugMode) {
        console.log('Contract Data:', contractData);
      }

      setContract(contractData);

      // First fetch WBS sections
      const { data: wbsData, error: wbsError } = await supabase
        .from('wbs')
        .select(`
          id,
          wbs_number,
          description
        `)
        .eq('contract_id', id)
        .order('wbs_number');

      if (wbsError) throw wbsError;

      if (debugMode) {
        console.log('WBS Data:', wbsData);
      }

      // Process each WBS section
      const processedGroups = await Promise.all(wbsData.map(async (wbs) => {
        // Fetch map locations for this WBS
        const { data: mapLocations, error: mapError } = await supabase
          .from('maps') // Updated from 'map_locations' to 'maps'
          .select('*')
          .eq('wbs_id', wbs.id)
          .order('map_number');

        if (mapError) throw mapError;

        if (debugMode) {
          console.log(`Map Locations for WBS ${wbs.wbs_number}:`, mapLocations);
        }

        // Process each map location
        const processedMaps = await Promise.all((mapLocations || []).map(async (map) => {
          // Fetch line items specifically for this map
          const { data: lineItems, error: lineError } = await supabase
            .from('line_items')
            .select('*')
            .eq('map_id', map.id)
            .order('line_code');

          if (lineError) throw lineError;

          if (debugMode) {
            console.log(`Line Items for Map ${map.map_number}:`, lineItems);
          }

          // Process line items
          const processedLineItems = (lineItems || []).map(item => ({
            ...item,
            total_cost: (item.quantity ?? 0) * (item.unit_price ?? 0),
            amount_paid: (item.quantity_completed ?? 0) * (item.unit_price ?? 0)
          }));

          const mapTotal = processedLineItems.reduce((sum, item) => sum + item.total_cost, 0);
          const mapPaid = processedLineItems.reduce((sum, item) => sum + item.amount_paid, 0);

          return {
            id: map.id,
            map_number: map.map_number,
            location_description: map.location_description,
            line_items: processedLineItems,
            contractTotal: mapTotal,
            amountPaid: mapPaid,
            progress: mapTotal > 0 ? Math.round((mapPaid / mapTotal) * 100) : 0
          };
        }));

        const wbsTotal = processedMaps.reduce((sum, map) => sum + map.contractTotal, 0);
        const wbsPaid = processedMaps.reduce((sum, map) => sum + map.amountPaid, 0);

        return {
          wbs: wbs.wbs_number,
          description: wbs.description || '',
          maps: processedMaps,
          contractTotal: wbsTotal,
          amountPaid: wbsPaid,
          progress: wbsTotal > 0 ? Math.round((wbsPaid / wbsTotal) * 100) : 0
        };
      }));

      if (debugMode) {
        console.log('Processed WBS Groups:', processedGroups);
        console.timeEnd('Contract Fetch Duration');
        console.groupEnd();
      }

      setWbsGroups(processedGroups);
    } catch (error) {
      console.error('Error fetching contract:', error);
      setError('Error loading contract details');
    } finally {
      setLoading(false);
    }
  };

  const toggleWBS = (wbs: string) => {
    setExpandedWBS(prev => 
      prev.includes(wbs) 
        ? prev.filter(w => w !== wbs)
        : [...prev, wbs]
    );
  };

  const toggleMap = (mapId: string) => {
    setExpandedMaps(prev => 
      prev.includes(mapId) 
        ? prev.filter(m => m !== mapId)
        : [...prev, mapId]
    );
  };

  const totals = React.useMemo(() => {
    return wbsGroups.reduce((acc, group) => ({
      contractTotal: acc.contractTotal + group.contractTotal,
      amountPaid: acc.amountPaid + group.amountPaid,
      progress: Math.round((acc.amountPaid + group.amountPaid) / (acc.contractTotal + group.contractTotal) * 100)
    }), { contractTotal: 0, amountPaid: 0, progress: 0 });
  }, [wbsGroups]);

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-background-light rounded-lg shadow-lg border border-background-lighter p-6">
          <div className="border-b border-background-lighter pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">
                    {contract.title}
                  </h1>
                  <button
                    onClick={() => navigate(`/demo/create?edit=${contract.id}`)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Contract Details
                  </button>
                  <button
                    onClick={() => setDebugMode(!debugMode)}
                    className={`p-2 rounded-md transition-colors ${
                      debugMode 
                        ? 'bg-warning text-white' 
                        : 'bg-background-lighter text-gray-400 hover:text-white'
                    }`}
                    title={debugMode ? 'Disable Debug Mode' : 'Enable Debug Mode'}
                  >
                    <Bug className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-lg sm:text-xl text-gray-400">{contract.description}</h2>
                {debugMode && (
                  <div className="mt-2 p-2 bg-background rounded border border-warning/20 text-warning text-sm">
                    <p>Contract ID: {contract.id}</p>
                    <p>Created: {new Date(contract.created_at).toLocaleString()}</p>
                    <p>Last Updated: {new Date(contract.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div className="w-full sm:w-auto text-left sm:text-right">
                <p className="text-sm text-gray-500">Contract Period</p>
                <p className="text-gray-300">
                  {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-2 text-primary flex-shrink-0" />
                <span className="truncate">{contract.location}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <DollarSign className="w-5 h-5 mr-2 text-accent flex-shrink-0" />
                <span className="truncate">${contract.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Calendar className="w-5 h-5 mr-2 text-warning flex-shrink-0" />
                <span className="truncate">Overall Progress: {totals.progress}%</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {toolButtons.map((tool, index) => (
                <button
                  key={index}
                  onClick={tool.onClick}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${tool.color}`}
                >
                  {tool.icon}
                  <span className="mt-2 text-sm font-medium">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {wbsGroups.map((group) => (
              <div key={group.wbs} className="border border-background-lighter rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleWBS(group.wbs)}
                  className="w-full bg-background px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-background-light transition-colors gap-4"
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
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 w-full sm:w-auto">
                    <div className="text-sm text-gray-400 w-full sm:w-auto">
                      Contract Total: ${group.contractTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-400 w-full sm:w-auto">
                      Amount Paid: ${group.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center w-full sm:w-auto">
                      <div className="w-full sm:w-24 bg-background-lighter rounded-full h-2 mr-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{ width: `${group.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 whitespace-nowrap">
                        {group.progress}%
                      </span>
                    </div>
                  </div>
                </button>

                {expandedWBS.includes(group.wbs) && (
                  <div className="bg-background-light border-t border-background-lighter">
                    {group.maps.map((map) => (
                      <div key={map.id} className="border-b border-background-lighter last:border-b-0">
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
                              {debugMode && (
                                <p className="text-xs text-warning">Map ID: {map.id}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 w-full sm:w-auto">
                            <div className="text-sm text-gray-400 w-full sm:w-auto">
                              Map Total: ${map.contractTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-gray-400 w-full sm:w-auto">
                              Paid: ${map.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="flex items-center w-full sm:w-auto">
                              <div className="w-full sm:w-24 bg-background rounded-full h-2 mr-2">
                                <div
                                  className="bg-primary rounded-full h-2"
                                  style={{ width: `${map.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-400 whitespace-nowrap">
                                {map.progress}%
                              </span>
                            </div>
                          </div>
                        </button>

                        {expandedMaps.includes(map.id) && (
                          <div className="overflow-x-auto">
                            <div className="min-w-[1000px]">
                              <table className="w-full divide-y divide-background-lighter">
                                <thead className="bg-background">
                                  <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Line Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Unit</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Budgeted Qty</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Unit Price</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Budgeted $</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Used Qty</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Used $</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Progress</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-background-light divide-y divide-background-lighter">
                                  {map.line_items.map((item, index) => {
                                    const progress = item.total_cost > 0 
                                      ? Math.round((item.amount_paid / item.total_cost) * 100)
                                      : 0;
                                    
                                    return (
                                      <tr key={index} className="hover:bg-background transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                          {item.line_code}
                                          {debugMode && (
                                            <div className="text-xs text-warning">ID: {item.id}</div>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300 max-w-[200px] truncate">{item.description}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{item.unit_measure}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">{(item.quantity ?? 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">${(item.unit_price ?? 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">${(item.total_cost ?? 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">{(item.quantity_completed ?? 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-right">${(item.amount_paid ?? 0).toLocaleString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                          <div className="flex items-center justify-end">
                                            <div className="w-16 bg-background rounded-full h-1.5 mr-2">
                                              <div
                                                className="bg-primary rounded-full h-1.5"
                                                style={{ width: `${progress}%` }}
                                              />
                                            </div>
                                            <span className="text-sm text-gray-300 w-8">
                                              {progress}%
                                            </span>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

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
                        className="bg-primary rounded-full h-3"
                        style={{ width: `${totals.progress}%` }}
                      />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {totals.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}