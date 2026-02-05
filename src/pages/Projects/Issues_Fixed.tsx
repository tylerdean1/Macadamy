import React, { useState, useEffect, useCallback } from 'react';
import { Save, Pencil, Download } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { rpcClient } from '@/lib/rpc.client';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import type { Issues } from '@/lib/types';

type Issue = Issues;
type IssueWithProfile = Issue & { profiles: { full_name: string | null; email: string } | null };

const toIssueList = (value: unknown): Array<Record<string, unknown>> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return [];
    }

    const issues = (value as { issues?: unknown }).issues;
    if (!Array.isArray(issues)) {
        return [];
    }

    return issues.filter(
        (item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item)
    );
};

const STATUSES = ['Open', 'In Progress', 'Resolved'] as const;

const getStatusColor = (status: string) =>
    status === 'Open' ? 'text-blue-500'
        : status === 'In Progress' ? 'text-yellow-500'
            : 'text-green-500';

export default function Issues() {
    const { id: project_id } = useParams();
    const { user, profile } = useAuthStore((state) => ({
        user: state.user,
        profile: state.profile,
    }));
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

    const normalizeIssue = (raw: Record<string, unknown>): IssueWithProfile => {
        const rawProfiles = raw.profiles && typeof raw.profiles === 'object'
            ? (raw.profiles as Record<string, unknown>)
            : null;

        return {
            id: typeof raw.id === 'string' ? raw.id : '',
            project_id: typeof raw.project_id === 'string' ? raw.project_id : null,
            name: typeof raw.name === 'string' ? raw.name : 'Untitled Issue',
            description: typeof raw.description === 'string' ? raw.description : null,
            type: typeof raw.type === 'string' ? raw.type : null,
            status: typeof raw.status === 'string' ? raw.status : null,
            resolved: typeof raw.resolved === 'boolean' ? raw.resolved : null,
            reported_by: typeof raw.reported_by === 'string' ? raw.reported_by : null,
            created_at: typeof raw.created_at === 'string' ? raw.created_at : null,
            updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : '',
            deleted_at: typeof raw.deleted_at === 'string' ? raw.deleted_at : null,
            profiles: rawProfiles
                ? {
                    full_name: typeof rawProfiles.full_name === 'string' ? rawProfiles.full_name : null,
                    email: typeof rawProfiles.email === 'string' ? rawProfiles.email : '',
                }
                : null,
        } as IssueWithProfile;
    };

    // Fetch issues via RPC payload
    const fetchIssues = useCallback(async () => {
        if (!project_id) return;

        try {
            const raw = await rpcClient.rpc_issues_payload({ p_project_id: project_id });
            const list = toIssueList(raw);
            setIssues(list.map((item) => normalizeIssue(item)));
        } catch (error) {
            console.error('Error fetching issues:', error);
        }
    }, [project_id]);

    // Fetch issues when component mounts
    useEffect(() => {
        void fetchIssues();
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

        try {
            const savedRows = editingId
                ? await rpcClient.update_issues({
                    _id: editingId,
                    _input: issueData
                })
                : await rpcClient.insert_issues({
                    _input: issueData
                });

            const saved = Array.isArray(savedRows) && savedRows.length > 0 ? savedRows[0] : null;
            if (saved) {
                const profileForIssue = profile && saved.reported_by === profile.id
                    ? { full_name: profile.full_name, email: profile.email }
                    : issues.find((item) => item.id === saved.id)?.profiles ?? null;

                const normalized: IssueWithProfile = {
                    id: saved.id,
                    project_id: saved.project_id ?? null,
                    name: saved.name,
                    description: saved.description ?? null,
                    type: saved.type ?? null,
                    status: saved.status ?? null,
                    resolved: saved.resolved ?? null,
                    reported_by: saved.reported_by ?? null,
                    created_at: saved.created_at ?? null,
                    updated_at: saved.updated_at ?? '',
                    deleted_at: saved.deleted_at ?? null,
                    profiles: profileForIssue,
                };

                setIssues((prev) => {
                    if (editingId) {
                        return prev.map((item) => (item.id === normalized.id ? normalized : item));
                    }
                    return [normalized, ...prev];
                });
            }
        } catch (error) {
            console.error('Error saving issue:', error);
            return;
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

        try {
            await rpcClient.delete_issues({ _id: id });
            setIssues((prev) => prev.filter((issue) => issue.id !== id));
        } catch (error) {
            console.error('Error deleting issue:', error);
        }
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
                                placeholder="Enter issue name"
                                title="Issue Name"
                                required
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
                                placeholder="Enter issue type"
                                title="Issue Type"
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
                                title="Issue Status"
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
                                title="Mark as resolved"
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
                            placeholder="Enter issue description"
                            title="Issue Description"
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
                                            title="Edit Issue"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(issue.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Delete Issue"
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
                                        {issue.profiles?.full_name || 'Unknown User'}
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
