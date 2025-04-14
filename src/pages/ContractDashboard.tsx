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
import { supabase } from '../lib/supabase'; // Supabase client for database interaction
import { useAuthStore } from '../lib/store'; // Hook for accessing auth store
import type { Database } from '../lib/database.types'; // Type definitions for database schema
import { ContractStatusSelect } from '@/components/ContractStatusSelect'; // Component for contract status selection
import { Button } from '@mui/material'; // Material UI Button
import MapPinIcon from '@mui/icons-material/PinDrop'; // Icon for map pin
import MapModal from '@/components/MapModal'; // Component for displaying maps

// Define a type for Contract retrieved from the database
type Contract = Database['public']['Tables']['contracts']['Row'];

// Define the LineItem structure for the contract
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
  map_id: string; // Maps to identify the corresponding map location
}

// Define the structure for map locations associated with a WBS (Work Breakdown Structure)
interface MapLocation {
  id: string;
  map_number: string; // The specific map number
  location_description: string; // Description of the location
  coordinates?: { lat: number; lng: number } | null; // Coordinates for the map location
  line_items: LineItem[]; // Associated line items with this map
  contractTotal: number; // Total for related line items
  amountPaid: number; // Amount paid thus far
  progress: number; // Calculated progress based on financials
}

// Define the structure for WBS groups
interface WBSGroup {
  wbs: string; // WBS identifier
  description: string; // Description of the WBS
  maps: MapLocation[]; // List of maps linked to this WBS
  contractTotal: number; // Overall contract total from this group
  amountPaid: number; // Amount paid for this group
  progress: number; // Calculated progress for this WBS
}

// Define the structure for button tools which will appear on the dashboard
interface ToolButton {
  icon: React.ReactNode; // Icon to display
  label: string; // Text label for the button
  onClick: () => void; // Function to call on click
  color: string; // Tailwind CSS color classes for styling
}

// The ContractDashboard component orchestrates the display of contract details and actions.
export function ContractDashboard() {
  const { id } = useParams(); // Fetch contract ID from URL parameters
  const navigate = useNavigate(); // Setting up navigation
  const [contract, setContract] = useState<Contract | null>(null); // Track loaded contract
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState<string | null>(null); // Handle any errors
  const [expandedWBS, setExpandedWBS] = useState<string[]>([]); // Track expanded WBS sections
  const [expandedMaps, setExpandedMaps] = useState<string[]>([]); // Track expanded map sections
  const [wbsGroups, setWbsGroups] = useState<WBSGroup[]>([]); // Store processed WBS groups
  const user = useAuthStore((state) => state.user); // Fetch the user from auth store
  console.log(user); // Log the user (remove if not needed)

  // State for controlling Map Modal
  const [openMapModal, setOpenMapModal] = useState(false); // Modal visibility state
  const [modalPins, setModalPins] = useState<{ lat: number; lng: number; label?: string }[]>([]); // Map pins relevant to the modal

  // Tool buttons for actions on the dashboard
  const toolButtons: ToolButton[] = [
    {
      icon: <Clipboard className="w-5 h-5" />,
      label: "Daily Reports",
      onClick: () => navigate(`/contracts/${id}/daily-reports`), // Navigate to daily reports
      color: "bg-blue-500/30 text-blue-500 hover:bg-blue-500/40"
    },
    {
      icon: <Truck className="w-5 h-5" />,
      label: "Equipment Log",
      onClick: () => navigate(`/contracts/${id}/equipment`), // Navigate to equipment log
      color: "bg-green-500/30 text-green-500 hover:bg-green-500/40"
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Labor Records",
      onClick: () => navigate(`/contracts/${id}/labor`), // Navigate to labor records
      color: "bg-purple-500/30 text-purple-500 hover:bg-purple-500/40"
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Issues",
      onClick: () => navigate(`/contracts/${id}/issues`), // Navigate to issues section
      color: "bg-amber-500/30 text-amber-500 hover:bg-amber-500/40"
    },
    {
      icon: <FileWarning className="w-5 h-5" />,
      label: "Change Orders",
      onClick: () => navigate(`/contracts/${id}/change-orders`), // Navigate to change orders
      color: "bg-red-500/30 text-red-500 hover:bg-red-500/40"
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: "Inspections",
      onClick: () => navigate(`/contracts/${id}/inspections`), // Navigate to inspections
      color: "bg-cyan-500/30 text-cyan-500 hover:bg-cyan-500/40"
    },
    {
      icon: <Calculator className="w-5 h-5" />,
      label: "Calculators",
      onClick: () => navigate(`/contracts/${id}/calculators`), // Navigate to calculators
      color: "bg-indigo-500/30 text-indigo-500 hover:bg-indigo-500/40"
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      onClick: () => navigate(`/contracts/${id}/contractsettings`), // Navigate to settings
      color: "bg-gray-500/30 text-gray-500 hover:bg-gray-500/40"
    }
  ];

  // Use useCallback to optimize fetching contract data
  const fetchContract = useCallback(async () => {
    try {
      if (!id) {
        setError('Contract ID is required'); // Error handling if ID not found
        return;
      }
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single(); // Fetch the contract by ID
      if (contractError) throw contractError; // Handle errors
      if (!contractData) {
        setError('Contract not found');
        return; // Display error if contract is not found
      }
      setContract(contractData); // Set the fetched contract data

      // Fetch WBS sections associated with the contract
      const { data: wbsData, error: wbsError } = await supabase
        .from('wbs')
        .select(`id, wbs_number, description`)
        .eq('contract_id', id)
        .order('wbs_number'); // Fetch WBS data
      if (wbsError) throw wbsError; // Handle fetching errors

      // Process WBS -> Maps -> Line Items
      const processedGroups = await Promise.all(
        (wbsData || []).map(async (wbs) => {
          const { data: mapLocations, error: mapError } = await supabase
            .from('maps')
            .select('*')
            .eq('wbs_id', wbs.id)
            .order('map_number'); // Fetch maps associated with WBS
          if (mapError) throw mapError; // Handle fetching errors

          const processedMaps = await Promise.all(
            (mapLocations || []).map(async (map) => {
              const { data: lineItems, error: lineError } = await supabase
                .from('line_items')
                .select('*')
                .eq('map_id', map.id)
                .order('line_code'); // Fetch line items for the map
              if (lineError) throw lineError; // Handle line fetching errors

              // Process each line item
              const processedLineItems = (lineItems || []).map((item) => ({
                ...item,
                total_cost: (item.quantity ?? 0) * (item.unit_price ?? 0), // Calculate total cost
                amount_paid: (item.quantity_completed ?? 0) * (item.unit_price ?? 0) // Calculate amount paid
              }));

              const mapTotal = processedLineItems.reduce((sum, item) => sum + item.total_cost, 0); // Total cost for the map
              const mapPaid = processedLineItems.reduce((sum, item) => sum + item.amount_paid, 0); // Total paid for the map

              return {
                id: map.id,
                map_number: map.map_number, // Map number from the fetched data
                location_description: map.location_description,
                coordinates: map.coordinates,
                line_items: processedLineItems,
                contractTotal: mapTotal,
                amountPaid: mapPaid,
                progress: mapTotal > 0 ? Math.round((mapPaid / mapTotal) * 100) : 0 // Progress calculation
              };
            })
          );

          const wbsTotal = processedMaps.reduce((sum, m) => sum + m.contractTotal, 0); // Total cost for the WBS group
          const wbsPaid = processedMaps.reduce((sum, m) => sum + m.amountPaid, 0); // Total amount paid for the WBS group

          return {
            wbs: wbs.wbs_number,
            description: wbs.description ?? '',
            maps: processedMaps,
            contractTotal: wbsTotal,
            amountPaid: wbsPaid,
            progress: wbsTotal > 0 ? Math.round((wbsPaid / wbsTotal) * 100) : 0 // Overall progress for the WBS
          };
        })
      );

      setWbsGroups(processedGroups); // Store processed WBS groups in state
    } catch (err) {
      console.error('Error fetching contract:', err); // Log error
      setError('Error loading contract details'); // Set error message
    } finally {
      setLoading(false); // Set loading state to false
    }
  }, [id]);

  useEffect(() => {
    fetchContract(); // Fetch contract data when component mounts
  }, [fetchContract]);

  const toggleWBS = (wbs: string) => {
    setExpandedWBS((prev) =>
      prev.includes(wbs) ? prev.filter((item) => item !== wbs) : [...prev, wbs] // Toggles expanded WBS groups
    );
  };

  const toggleMap = (mapId: string) => {
    setExpandedMaps((prev) =>
      prev.includes(mapId) ? prev.filter((id) => id !== mapId) : [...prev, mapId] // Toggles expanded map sections
    );
  };

  // Handles map clicks for displaying modal pins
  const handleMapLevelClick = (map: MapLocation) => {
    if (map.coordinates?.lat !== undefined && map.coordinates?.lng !== undefined) {
      setModalPins([
        { lat: map.coordinates.lat, lng: map.coordinates.lng, label: map.location_description }
      ]);
      setOpenMapModal(true); // Open the map modal
    } else {
      alert('No coordinates for this map location.'); // Alert if no coordinates are found
    }
  };

  // Handles WBS group clicks for displaying relevant map pins
  const handleWbsLevelClick = (group: WBSGroup) => {
    const pins = group.maps
      .filter((map) => map.coordinates?.lat !== undefined && map.coordinates?.lng !== undefined)
      .map((map) => ({
        lat: map.coordinates!.lat,
        lng: map.coordinates!.lng,
        label: map.location_description // Prepare pins for map modal
      }));
    if (pins.length > 0) {
      setModalPins(pins);
      setOpenMapModal(true); // Open the map modal
    } else {
      alert('No coordinates found in this WBS group.'); // Alert if no coordinates found
    }
  };

  // Calculate overall contract totals
  const totals = React.useMemo(() => {
    return wbsGroups.reduce(
      (acc, group) => ({
        contractTotal: acc.contractTotal + group.contractTotal, // Sum total contract values
        amountPaid: acc.amountPaid + group.amountPaid, // Sum total amount paid
        progress: 0 // Placeholder for overall progress calculation
      }),
      { contractTotal: 0, amountPaid: 0, progress: 0 } // Initialize totals
    );
  }, [wbsGroups]);

  // Compute overall progress for the entire contract
  const overallProgress = totals.contractTotal
    ? Math.round((totals.amountPaid / totals.contractTotal) * 100) // Calculate progress percentage
    : 0;

  // Loading state display
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading contract details...</p> // Loading message
        </div>
      </div>
    );
  }

  // Error handling if no contract is present
  if (error || !contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">{error || 'Contract not found'}</p> // Error message
          <button
            onClick={() => navigate('/dashboard')} // Navigate back if error is encountered
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
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
                            prev ? { ...prev, status: newStatus } : null // Update contract status
                          );
                        }
                      }}
                    />
                  </div>
                  <h2 className="text-lg sm:text-xl text-gray-400">{contract.description}</h2> // Description display
                </div>
                <div className="w-full sm:w-auto text-left sm:text-right">
                  <p className="text-sm text-gray-500">Contract Period</p>
                  <p className="text-gray-300">
                    {contract.start_date && contract.end_date
                      ? `${new Date(contract.start_date).toLocaleDateString()} - ${new Date(contract.end_date).toLocaleDateString()}`
                      : 'N/A'} // Show contract periods; display N/A if not set
                  </p>
                </div>
              </div>
            </div>

            {/* Tool Buttons for navigation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {toolButtons.map((btn, index) => (
                <button // Rendering tool buttons for different functionalities
                  key={index}
                  onClick={btn.onClick}
                  className={`flex items-center justify-center gap-2 rounded-md transition-colors ${btn.color} p-2`}
                >
                  {btn.icon} // Display button icon
                  <span className="hidden sm:inline">{btn.label}</span> // Label for button
                </button>
              ))}
            </div>

            {/* Render WBS Groups for the contract */}
          <div className="space-y-4">
            {wbsGroups.map((group) => (
              <div
                key={group.wbs}
                className="border border-background-lighter rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleWBS(group.wbs)} // Toggle visibility of WBS group
                  className="w-full bg-background px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-background-light transition-colors gap-4"
                >
                  <div className="flex items-center space-x-4">
                    {expandedWBS.includes(group.wbs) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" /> // Down arrow if expanded
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" /> // Right arrow if collapsed
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">WBS {group.wbs}</h3>
                      <p className="text-sm text-gray-400">{group.description}</p> // Show description of WBS
                    </div>
                  </div>
                  <Button
                    variant="outlined"
                    startIcon={<MapPinIcon />}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click event from bubbling
                      handleWbsLevelClick(group); // Handle WBS group click to show map
                    }}
                    size="small"
                  >
                    View WBS Map // Button to view the WBS map
                  </Button>
                </button>
                {expandedWBS.includes(group.wbs) && (
                  <div className="bg-background-light border-t border-background-lighter">
                    {group.maps.map((map) => (
                      <div
                        key={map.id}
                        className="border-b border-background-lighter last:border-b-0"
                      >
                        <button
                          onClick={() => toggleMap(map.id)} // Toggle individual map visibility
                          className="w-full px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-background transition-colors gap-4"
                        >
                          <div className="flex items-center space-x-4">
                            {expandedMaps.includes(map.id) ? (
                              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" /> // Down arrow if expanded
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" /> // Right arrow if collapsed
                            )}
                            <div>
                              <h4 className="text-md font-medium text-white">Map {map.map_number}</h4> // Display map number
                              <p className="text-sm text-gray-400">{map.location_description}</p> // Show location description
                            </div>
                          </div>
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<MapPinIcon />}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent click event bubbling
                              handleMapLevelClick(map); // Handle map click event
                            }}
                          >
                            View // Button text to view the map
                          </Button>
                        </button>
                        {expandedMaps.includes(map.id) && (
                          <div className="overflow-x-auto">
                            {/* Table or details for line items, etc. */}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contract Totals Section */}
          <div className="bg-background-light p-4 sm:p-6 rounded-lg mt-6 border border-background-lighter">
            <h3 className="text-xl font-semibold text-white mb-4">Contract Totals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Contract Value</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  $
                  {totals.contractTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2 // Format total value correctly
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Amount Paid</p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  $
                  {totals.amountPaid.toLocaleString(undefined, {
                    minimumFractionDigits: 2 // Format amount paid correctly
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Overall Progress</p>
                <div className="flex items-center">
                  <div className="w-24 sm:w-32 bg-background-lighter rounded-full h-3 mr-3">
                    <div
                      className="bg-primary rounded-full h-3 progress-bar"
                      style={{ width: `${overallProgress}%` }} // Dynamic width based on progress
                    ></div>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-white">
                    {overallProgress}% // Display overall progress percentage
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Modal */}
          <MapModal
            isOpen={openMapModal} // Control modal visibility
            onClose={() => setOpenMapModal(false)} // Close modal handler
            mapLocations={modalPins} // Pass the pin locations for the modal
          />
        </div>
      </div>
    </>
  );
}