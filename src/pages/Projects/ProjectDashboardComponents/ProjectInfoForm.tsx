import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  MapPin,
  Share2,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { listStorageFilesWithSignedUrls } from '@/lib/storageClient';
import { supabase } from '@/lib/supabase';
import { GeometryButton } from '@/pages/Projects/SharedComponents/GoogleMaps/GeometryButton';

export type ProjectInfoVM = {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  budget: number | null;
  coordinates_wkt: string | null;
  created_at: string | null;
  updated_at: string | null;
};

interface ProjectInfoFormProps {
  contractData: ProjectInfoVM;
}

interface ProjectAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

function getText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getDisplayValue(value: string | null | undefined, fallback = 'Not specified'): string {
  return getText(value) ?? fallback;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Not specified';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Invalid date';
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function calculateDuration(startDate: string | null | undefined, endDate: string | null | undefined): string {
  if (!startDate || !endDate) return 'N/A';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'N/A';
  const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return `${diffDays} days`;
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, unitIndex);
  return `${parseFloat(value.toFixed(2))} ${units[unitIndex]}`;
}

export function ProjectInfoForm({ contractData }: ProjectInfoFormProps): JSX.Element {
  const [isDetailedView, setIsDetailedView] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState<boolean>(false);
  const statusValue = typeof contractData.status === 'string' ? contractData.status.toLowerCase() : '';
  const description = getText(contractData.description);
  const hasGeometry = getText(contractData.coordinates_wkt) !== null;
  const hasMinimalInfo = description === null && !hasGeometry;

  useEffect(() => {
    if (!contractData.id) return;

    const subscription = supabase
      .channel(`project-${contractData.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${contractData.id}`,
      }, (payload) => {
        if (payload.new != null) {
          console.log('[ProjectInfoForm] project update received', payload.new);
        }
      })
      .subscribe();

    return () => {
      void subscription.unsubscribe();
    };
  }, [contractData.id]);

  useEffect(() => {
    const fetchAttachments = async (): Promise<void> => {
      if (!contractData.id) return;

      setIsLoadingAttachments(true);
      setAttachmentsError(null);

      try {
        const files = await listStorageFilesWithSignedUrls(
          'contract-attachments',
          contractData.id,
          3600 * 24 * 7,
          {
            module: 'ProjectInfoForm',
            operation: 'fetch project attachments',
            trigger: 'background',
            ids: { projectId: contractData.id },
          },
        );

        setAttachments(files.map((file) => ({
          name: file.name,
          url: file.signedUrl,
          type: file.type,
          size: file.size,
        })));
      } catch (error) {
        setAttachments([]);
        setAttachmentsError(error instanceof Error ? error.message : 'Failed to load project attachments.');
      } finally {
        setIsLoadingAttachments(false);
      }
    };

    void fetchAttachments();
  }, [contractData.id]);

  const shareProject = (): void => {
    void (async () => {
      try {
        if (typeof navigator !== 'undefined' && 'share' in navigator && typeof navigator.share === 'function') {
          await navigator.share({ title: `Project: ${contractData.title}`, text: `Project details for ${contractData.title}`, url: window.location.href });
          return;
        }

        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Project URL copied to clipboard');
        }
      } catch (error) {
        console.error('[ProjectInfoForm] shareProject failed', {
          error,
          identifiers: { projectId: contractData.id },
          trigger: 'user',
        });
      }
    })();
  };

  return (
    <div className="space-y-4 p-4 relative bg-gray-850 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Project Information</h2>
        <div className="flex gap-2">
          <button
            onClick={shareProject}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Share project"
            title="Share project"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() => setIsDetailedView((current) => !current)}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label={isDetailedView ? 'Show less details' : 'Show more details'}
            title={isDetailedView ? 'Show less details' : 'Show more details'}
          >
            {isDetailedView ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {hasMinimalInfo && (
        <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400 border border-dashed border-gray-700 rounded-lg">
          <FileText size={40} className="mb-2 opacity-50" />
          <p className="mb-2">Limited project information available</p>
        </div>
      )}

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
            <h3 className="text-sm text-gray-400">Location / Description</h3>
            <p className="text-white">{getDisplayValue(contractData.description)}</p>
          </div>
        </div>
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusValue === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {contractData.status ? contractData.status.replace('_', ' ') : 'Unknown'}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-sm text-gray-400">Budget</h3>
          <p className="text-white">
            {contractData.budget != null && !Number.isNaN(contractData.budget)
              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(contractData.budget)
              : 'Not specified'}
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
            className="overflow-hidden space-y-4"
          >
            {description && (
              <div>
                <h3 className="text-sm text-gray-400 mb-1">Description</h3>
                <div className="bg-gray-800 p-3 rounded-md">
                  <p className="text-white whitespace-pre-line">{description}</p>
                </div>
              </div>
            )}

            {hasGeometry && (
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Location Map</h3>
                <div className="bg-gray-800 p-3 rounded-md space-y-3">
                  <GeometryButton
                    geometry={null}
                    wkt={contractData.coordinates_wkt}
                    table="projects"
                    targetId={contractData.id}
                    label="View Project Location"
                  />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contractData.description ?? '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-400 flex items-center gap-1 text-sm"
                    aria-label="Open in Google Maps"
                  >
                    Open in Google Maps <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm text-gray-400 mb-2">Attachments</h3>
              {isLoadingAttachments ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : attachmentsError ? (
                <div className="bg-red-950/30 p-4 rounded-md text-sm text-red-200">
                  Failed to load project attachments: {attachmentsError}
                </div>
              ) : attachments.length > 0 ? (
                <div className="bg-gray-800 rounded-md divide-y divide-gray-700">
                  {attachments.map((file) => (
                    <div key={file.name} className="p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-white">{file.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(file.size)} · {file.type}</p>
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300">
                        Open
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 p-4 rounded-md text-center text-gray-400">
                  <p>No attachments available</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm text-gray-400 mb-2">Recent Activity</h3>
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="flex items-start gap-2">
                  <Clock size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white">Project viewed</p>
                    <p className="text-xs text-gray-400">Moments ago</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
