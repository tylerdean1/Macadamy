import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, AlertTriangle, Calendar, User, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface Issue {
  id?: string;
  contract_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assigned_to?: string;
  due_date?: string;
  resolution?: string;
}

const PRIORITIES = ['Low', 'Medium', 'High'] as const;
const STATUSES = ['Open', 'In Progress', 'Resolved'] as const;

export function Issues() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [newIssue, setNewIssue] = useState<Issue>({
    contract_id: id || '',
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    due_date: new Date().toISOString().split('T')[0]
  });
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchIssues();
    fetchAssignees();
  }, [id]);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          assigned_to:profiles!assigned_to (
            full_name,
            email
          )
        `)
        .eq('contract_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setAssignees(data || []);
    } catch (error) {
      console.error('Error fetching assignees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('issues')
        .insert({
          ...newIssue,
          created_by: user.id
        });

      if (error) throw error;

      setIsCreating(false);
      fetchIssues();
      setNewIssue({
        contract_id: id || '',
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Open',
        due_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error creating issue:', error);
      alert('Error creating issue');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'low':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-500/10 text-blue-500';
      case 'in progress':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'resolved':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/contracts/${id}`)}
              className="p-2 text-gray-400 hover:text-white hover:bg-background-lighter rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Issues</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Issue
          </button>
        </div>

        {isCreating && (
          <div className="mb-8 bg-background-light rounded-lg border border-background-lighter p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={newIssue.status}
                    onChange={(e) => setNewIssue({ ...newIssue, status: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  >
                    {STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Assigned To
                  </label>
                  <select
                    value={newIssue.assigned_to || ''}
                    onChange={(e) => setNewIssue({ ...newIssue, assigned_to: e.target.value || undefined })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  >
                    <option value="">Unassigned</option>
                    {assignees.map(assignee => (
                      <option key={assignee.id} value={assignee.id}>{assignee.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newIssue.due_date}
                    onChange={(e) => setNewIssue({ ...newIssue, due_date: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-background border border-background-lighter text-white rounded-md hover:bg-background-lighter transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Issue
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {issues.length === 0 && !isCreating ? (
            <div className="bg-background-light rounded-lg border border-background-lighter p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Issues</h3>
              <p className="text-gray-400 mb-6">Track project issues by creating a new issue.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Issue
              </button>
            </div>
          ) : (
            issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-background-light rounded-lg border border-background-lighter p-6 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/contracts/${id}/issues/${issue.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{issue.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        Due: {issue.due_date ? new Date(issue.due_date).toLocaleDateString() : 'No due date'}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <User className="w-4 h-4 mr-2" />
                        {issue.assigned_to?.full_name || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300">{issue.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}