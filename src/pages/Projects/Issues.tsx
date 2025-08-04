import React, { useState, useEffect, useCallback } from 'react';
import { Save, Pencil, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import type { Issues } from '@/lib/types';

type Issue = Issues;
type IssueWithProfile = Issue & {
  profiles: {
    full_name: string | null;
    email: string;
  } | null
};

const STATUSES = ['Open', 'In Progress', 'Resolved'] as const;

const getStatusColor = (status: string) =>
  status === 'Open' ? 'text-blue-500'
    : status === 'In Progress' ? 'text-yellow-500'
      : 'text-green-500';

export default function Issues() {
  const { id: project_id } = useParams();
  const user = useAuthStore((state) => state.user);
  const canEdit = typeof user?.role === 'string' && ['admin', 'engineer', 'inspector'].includes(user.role);

  const [issues, setIssues] = useState<IssueWithProfile[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<IssueWithProfile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Issue>>({
    project_id,
    name: '',
    description: '',
    type: '',
    status: 'Open',
    resolved: false,
    reported_by: user?.id,
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch issues from Supabase
  const fetchIssues = useCallback(async () => {
    if (!project_id) return;

    const { data: issuesData, error } = await supabase
      .from('issues')
      .select(`
        *,
        profiles:reported_by(full_name, email)
      `)
      .eq('project_id', project_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching issues:', error);
      return;
    }

    setIssues(issuesData || []);
  }, [project_id]);

  // Fetch assignees from profiles table (simplified - not needed for basic functionality)
  const fetchAssignees = async () => {
    // Removed for simplicity since assignees field not in current form
  };

  // Fetch issues when component mounts
  useEffect(() => {
    void fetchIssues();
    void fetchAssignees();
  }, [fetchIssues]);

  // Handle save action for form submission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const issueData = {
      project_id: form.project_id || project_id,
      name: form.name || '',
      description: form.description || '',
      type: form.type || '',
      status: form.status || 'Open',
      resolved: form.resolved || false,
      reported_by: form.reported_by || user.id,
    };

    if (editingId) {
      // Update existing issue
      const { error } = await supabase
        .from('issues')
        .update(issueData)
        .eq('id', editingId);

      if (error) {
        console.error('Error updating issue:', error);
        return;
      }
    } else {
      // Create new issue
      const { error } = await supabase
        .from('issues')
        .insert([issueData]);

      if (error) {
        console.error('Error creating issue:', error);
        return;
      }
    }

    // Reset form and refresh data
    setForm({
      project_id,
      name: '',
      description: '',
      type: '',
      status: 'Open',
      resolved: false,
      reported_by: user?.id,
    });
    setEditingId(null);
    void fetchIssues();
  };

  // Handle edit action
  const handleEdit = (issue: Issue) => {
    setForm(issue);
    setEditingId(issue.id);
  };

  // Handle cancel action
  const handleCancel = () => {
    setForm({
      project_id,
      name: '',
      description: '',
      type: '',
      status: 'Open',
      resolved: false,
      reported_by: user?.id,
    });
    setEditingId(null);
  };

  // Handle delete action
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;

    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting issue:', error);
      return;
    }

    void fetchIssues();
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Issues Report', 20, 20);

    let yPosition = 40;
    filteredIssues.forEach((issue, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.text(`${index + 1}. ${issue.name || 'Untitled'}`, 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      doc.text(`Status: ${issue.status || 'Unknown'}`, 30, yPosition);
      yPosition += 8;
      doc.text(`Type: ${issue.type || 'Unknown'}`, 30, yPosition);
      yPosition += 8;
      if (issue.description) {
        doc.text(`Description: ${issue.description.substring(0, 100)}...`, 30, yPosition);
        yPosition += 8;
      }
      yPosition += 5;
    });

    doc.save('issues-report.pdf');
  };

  // Filter issues based on search term
  useEffect(() => {
    const filtered = issues.filter(issue =>
      (issue.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (issue.status?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredIssues(filtered);
  }, [issues, searchTerm]);

  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Form */}
      {canEdit && (
        <form onSubmit={handleSave} className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Name
              </label>
              <input
                type="text"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                aria-label="Issue Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                value={form.type || ''}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Issue Type"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={form.status || 'Open'}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Issue Status"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolved
              </label>
              <input
                type="checkbox"
                checked={form.resolved || false}
                onChange={(e) => setForm({ ...form, resolved: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                aria-label="Mark as resolved"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              aria-label="Issue Description"
            />
          </div>

          <div className="flex justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingId ? 'Update' : 'Create'} Issue
            </button>
          </div>
        </form>
      )}

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No issues found.
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <div key={issue.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {issue.name || 'Untitled Issue'}
                </h3>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(issue)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit issue"
                      aria-label="Edit issue"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(issue.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete issue"
                      aria-label="Delete issue"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-1 ${getStatusColor(issue.status || '')}`}>
                    {issue.status || 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <span className="ml-1 text-gray-600">{issue.type || 'Unknown'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Resolved:</span>
                  <span className="ml-1 text-gray-600">{issue.resolved ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Reported by:</span>
                  <span className="ml-1 text-gray-600">
                    {issue.profiles?.full_name || 'Unknown'}
                  </span>
                </div>
              </div>

              {issue.description && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {issue.description}
                </div>
              )}

              {issue.created_at && (
                <div className="text-xs text-gray-400 mt-2">
                  Created: {new Date(issue.created_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
