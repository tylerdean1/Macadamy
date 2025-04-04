import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileWarning, Calendar, DollarSign, User, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface ChangeOrder {
  id?: string;
  contract_id: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  submitted_date: string;
  approved_date?: string;
  approved_by?: string;
}

const STATUSES = ['Pending', 'Approved', 'Rejected'] as const;

export function ChangeOrders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ChangeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [approvers, setApprovers] = useState<any[]>([]);
  const [newOrder, setNewOrder] = useState<ChangeOrder>({
    contract_id: id || '',
    title: '',
    description: '',
    amount: 0,
    status: 'Pending',
    submitted_date: new Date().toISOString().split('T')[0]
  });
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchOrders();
    fetchApprovers();
  }, [id]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('change_orders')
        .select(`
          *,
          approved_by:profiles!approved_by (
            full_name,
            email
          )
        `)
        .eq('contract_id', id)
        .order('submitted_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching change orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'engineer')
        .order('full_name');

      if (error) throw error;
      setApprovers(data || []);
    } catch (error) {
      console.error('Error fetching approvers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('change_orders')
        .insert({
          ...newOrder,
          created_by: user.id
        });

      if (error) throw error;

      setIsCreating(false);
      fetchOrders();
      setNewOrder({
        contract_id: id || '',
        title: '',
        description: '',
        amount: 0,
        status: 'Pending',
        submitted_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error creating change order:', error);
      alert('Error creating change order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
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
            <h1 className="text-2xl font-bold text-white">Change Orders</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Change Order
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
                  value={newOrder.title}
                  onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={newOrder.amount}
                      onChange={(e) => setNewOrder({ ...newOrder, amount: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Submitted Date
                  </label>
                  <input
                    type="date"
                    value={newOrder.submitted_date}
                    onChange={(e) => setNewOrder({ ...newOrder, submitted_date: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
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
                  Submit Change Order
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {orders.length === 0 && !isCreating ? (
            <div className="bg-background-light rounded-lg border border-background-lighter p-8 text-center">
              <FileWarning className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Change Orders</h3>
              <p className="text-gray-400 mb-6">Start tracking changes by creating a new change order.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Change Order
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-background-light rounded-lg border border-background-lighter p-6 hover:border-primary transition-colors cursor-pointer"
                onClick={() => navigate(`/contracts/${id}/change-orders/${order.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-white">{order.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        Submitted: {new Date(order.submitted_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <DollarSign className="w-4 h-4 mr-2" />
                        ${order.amount.toLocaleString()}
                      </div>
                      {order.approved_by && (
                        <div className="flex items-center text-gray-400">
                          <User className="w-4 h-4 mr-2" />
                          Approved by: {order.approved_by.full_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300">{order.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}