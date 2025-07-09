// filepath: src\pages\Contract\ContractDasboardComponents\ProjectInfoForm.tsx
import { useState, useEffect } from 'react';
import { GeometryButton } from '@/pages/Contract/SharedComponents/GoogleMaps/GeometryButton';
import type { ContractWithWktRow } from '@/lib/rpc.types';
import {
  Share2, ChevronUp, ChevronDown, MapPin, Calendar,
  Tag, FileText, ArrowUpRight, Download,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface ProjectInfoFormProps {
  contractData: ContractWithWktRow;
}

/**
 * ProjectInfoForm Component
 * 
 * Displays contract information with compact/detailed view toggle.
 * Enhanced with map integration, document viewer, and real-time updates.
 * This is a view-only component.
 */
export function ProjectInfoForm({ contractData }: ProjectInfoFormProps) {
  const [isDetailedView, setIsDetailedView] = useState(false);
  const [attachments, setAttachments] = useState<Array<{ name: string, url: string, type: string, size: number }>>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!contractData?.id) return;

    const subscription = supabase
      .channel(`contract-${contractData.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'contracts',
        filter: `id=eq.${contractData.id}`
      }, (payload) => {
        if (typeof payload.new !== 'undefined' && payload.new !== null) {
          // This component is view-only. Parent should handle contractData prop updates.
          console.log('Real-time update received for contract, parent should update prop:', payload.new);
        }
      })
      .subscribe();

    return () => {
      void subscription.unsubscribe();
    };
  }, [contractData?.id]);

  // Fetch attachments
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!contractData?.id) return;

      setIsLoadingAttachments(true);
      try {
        const { data, error } = await supabase
          .storage
          .from('contract-attachments')
          .list(`${contractData.id}`);

        if (error) throw error;

        if (Array.isArray(data) && data.length > 0) {
          const attachmentsWithUrls = await Promise.all(data.map(async (file) => {
            const { data: urlData } = await supabase
              .storage
              .from('contract-attachments')
              .createSignedUrl(`${contractData.id}/${file.name}`, 3600 * 24 * 7); // Create a 7-day signed URL
            return {
              name: file.name,
              url: typeof urlData?.signedUrl === 'string' ? urlData.signedUrl : '',
              type: typeof file.metadata?.mimetype === 'string' ? file.metadata.mimetype : 'application/octet-stream',
              size: typeof file.metadata?.size === 'number' ? file.metadata.size : 0,
            };
          }));

          setAttachments(attachmentsWithUrls);
        }
      } catch (error) {
        console.error('Error fetching attachments:', error);
        // Consider setting an error state for attachments if needed
      } finally {
        setIsLoadingAttachments(false);
      }
    };

    void fetchAttachments();
  }, [contractData?.id]);

  // Handle view toggle
  const toggleView = () => setIsDetailedView(!isDetailedView);

  // Format date string to display format
  const formatDate = (dateString: string | null | undefined) => {
    if (dateString == null || dateString === '') return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Calculate contract duration in days
  const calculateDuration = (startDate: string | null | undefined, endDate: string | null | undefined) => {
    if (startDate == null || startDate === '' || endDate == null || endDate === '') return 'N/A';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    } catch {
      return 'N/A';
    }
  };

  // Share contract info
  const shareContract = () => {
    void (async () => {
      try {
        const shareData = {
          title: `Contract: ${contractData.title ?? ''}`,
          text: `Contract details for: ${contractData.title ?? ''}`,
          url: window.location.href,
        };
        if (typeof navigator !== 'undefined' && 'share' in navigator && typeof navigator.share === 'function') {
          await navigator.share(shareData);
        } else if (typeof navigator !== 'undefined' && typeof navigator.clipboard !== 'undefined' && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Contract URL copied to clipboard');
        }
      } catch (error) {
        console.error('Error sharing contract:', error);
      }
    })();
  };

  // Export contract data to CSV
  const exportContractData = () => {
    try {
      const header = "Property,Value\n";
      const rows = [
        `Title,${contractData.title ?? ''}`,
        `Location,${contractData.location ?? ''}`,
        `Start Date,${formatDate(contractData.start_date)}`,
        `End Date,${formatDate(contractData.end_date)}`,
        `Duration,${calculateDuration(contractData.start_date, contractData.end_date)}`,
        `Status,${contractData.status ?? ''}`,
        `Budget,${contractData.budget != null && !isNaN(contractData.budget) ? contractData.budget : 0}`,
        `Description,${(contractData.description ?? '').replace(/\n/g, ' ')}`,
      ].join('\n');

      const content = header + rows;
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `contract-${contractData.id}-info.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Contract information exported successfully');
    } catch (error) {
      console.error('Error exporting contract data:', error);
      toast.error('Failed to export contract data');
    }
  };

  // Get file type icon
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <img src="/icons/image-file.svg" alt="Image" className="h-5 w-5" />;
    if (fileType.includes('pdf')) return <img src="/icons/pdf-file.svg" alt="PDF" className="h-5 w-5" />;
    if (fileType.includes('word') || fileType.includes('document')) return <img src="/icons/doc-file.svg" alt="Document" className="h-5 w-5" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <img src="/icons/xls-file.svg" alt="Spreadsheet" className="h-5 w-5" />;
    return <FileText size={18} />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle empty states
  const getDisplayValue = (value: string | null | undefined, fallback = 'Not specified') => {
    if (value == null || value.trim() === '') return fallback;
    return value;
  };

  // Decide if we should show empty state
  const hasMinimalInfo = (typeof contractData.description !== 'string' || contractData.description.trim() === '') && (typeof contractData.coordinates_wkt !== 'string' || contractData.coordinates_wkt.trim() === '');

  return (
    <div className="space-y-4 p-4 relative bg-gray-850 rounded-lg shadow-md">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Contract Information</h2>
        <div className="flex gap-2">
          <button
            onClick={shareContract}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Share contract"
            title="Share contract"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={exportContractData}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Export contract data"
            title="Export contract data"
          >
            <Download size={16} />
          </button>
          <button
            onClick={toggleView}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label={isDetailedView ? "Show less details" : "Show more details"}
            title={isDetailedView ? "Show less details" : "Show more details"}
          >
            {isDetailedView ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {hasMinimalInfo && (
        <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400 border border-dashed border-gray-700 rounded-lg">
          <FileText size={40} className="mb-2 opacity-50" />
          <p className="mb-2">Limited contract information available</p>
        </div>
      )}

      {/* View mode content - Form and edit-related logic removed */}
      <div className="space-y-4">
        {/* Basic info section - always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Tag className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <h3 className="text-sm text-gray-400">Title</h3>
              <p className="text-white">{getDisplayValue(contractData.title)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <h3 className="text-sm text-gray-400">Location</h3>
              <p className="text-white">{getDisplayValue(contractData.location)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Calendar className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <h3 className="text-sm text-gray-400">Duration</h3>
              <p className="text-white">
                {formatDate(contractData.start_date)} - {formatDate(contractData.end_date)}
                <span className="text-xs text-gray-500 block">
                  {calculateDuration(contractData.start_date, contractData.end_date)}
                </span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-gray-400">Status</h3>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                ${contractData.status === 'Active' ? 'bg-green-100 text-green-800' :
                  contractData.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    contractData.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                      contractData.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'}`}
              >
                {contractData.status ? contractData.status.replace('_', ' ') : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-gray-400">Budget</h3>
            <p className="text-white">
              {contractData.budget != null && !isNaN(contractData.budget)
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(contractData.budget)
                : 'Not specified'
              }
            </p>
          </div>
        </div>

        <AnimatePresence>
          {isDetailedView && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {/* Description */}
              {getDisplayValue(contractData.description) && (
                <div className="mb-4">
                  <h3 className="text-sm text-gray-400 mb-1">Description</h3>
                  <div className="bg-gray-800 p-3 rounded-md">
                    <p className="text-white whitespace-pre-line">{contractData.description}</p>
                  </div>
                </div>
              )}

              {/* Map Location Display */}
              {getDisplayValue(contractData.coordinates_wkt) && (
                <div className="mb-4">
                  <h3 className="text-sm text-gray-400 mb-2">Location Map</h3>
                  <div className="bg-gray-800 p-3 rounded-md">
                    <div className="mb-3">
                      <GeometryButton
                        geometry={null}
                        wkt={contractData.coordinates_wkt}
                        table="contracts"
                        targetId={contractData.id}
                        label="View Contract Location"
                      />
                    </div>
                    <div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contractData.location ?? '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 flex items-center gap-1 text-sm"
                        aria-label="Open in Google Maps"
                      >
                        Open in Google Maps <ArrowUpRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Attachments section */}
              <div className="mb-4">
                <h3 className="text-sm text-gray-400 mb-2">Attachments</h3>

                {isLoadingAttachments ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : attachments.length > 0 ? (
                  <div className="bg-gray-800 rounded-md divide-y divide-gray-700">
                    {attachments.map((file) => ( // index removed as it's not used for key and refs are gone
                      <div key={file.name} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-400">
                            {getFileIcon(file.type)}
                          </div>
                          <div>
                            <p className="text-sm text-white">{file.name}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={file.url}
                            download={file.name}
                            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                            title="Download"
                            aria-label={`Download ${file.name}`}
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 p-4 rounded-md text-center text-gray-400">
                    <p>No attachments available</p>
                  </div>
                )}
              </div>

              {/* Activity Log Placeholder */}
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Recent Activity</h3>
                <div className="bg-gray-800 p-3 rounded-md">
                  <div className="space-y-3">
                    {/* This is placeholder content, actual activity log would need data */}
                    <div className="flex items-start gap-2">
                      <Clock size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-white">Contract viewed</p>
                        <p className="text-xs text-gray-400">Moments ago</p>
                      </div>
                    </div>
                    {/* Add more placeholder or actual activity items if data is available */}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}