import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { rpcClient } from '@/lib/rpc.client';
import { logBackendError, toBackendErrorToastMessage } from '@/lib/backendErrors';

interface ChangeOrder {
  id?: string;
  contract_id: string;
  line_item_id: string;
  title: string;
  description?: string;
  new_quantity: number;
  new_unit_price?: number;
  status: string;
  submitted_date?: string;
  approved_date?: string;
  approved_by?: string;
  attachments?: string[];
}

interface LineItem {
  id: string;
  description: string;
}

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'draft':
      return 'bg-gray-200 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function createEmptyChangeOrder(): Partial<ChangeOrder> {
  return {
    title: '',
    line_item_id: '',
    new_quantity: 0,
    new_unit_price: undefined,
    status: 'draft',
  };
}

function reportChangeOrdersError(
  operation: string,
  error: unknown,
  projectId: string | null,
): string {
  const context = {
    module: 'ChangeOrders',
    operation,
    trigger: 'user' as const,
    error,
    ids: {
      projectId,
    },
  };

  logBackendError(context);
  const message = toBackendErrorToastMessage(context);
  toast.error(message);
  return message;
}

export default function ChangeOrders() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = typeof id === 'string' && id.trim() !== '' ? id : null;

  const [orders, setOrders] = useState<ChangeOrder[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<ChangeOrder>>(() => createEmptyChangeOrder());

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setOrders([]);
      setLineItems([]);
      setErrorMessage('Project context is missing. Return to the project and try again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const [lineItemRes, orderRes] = await Promise.all([
        rpcClient.filter_line_items({ _filters: { project_id: projectId } }),
        rpcClient.filter_change_orders({ _filters: { project_id: projectId } })
      ]);

      const typedOrders = Array.isArray(orderRes)
        ? orderRes.map(order => ({
          id: order.id,
          contract_id: projectId,
          line_item_id: '',
          title: order.number || '',
          description: order.description ?? undefined,
          new_quantity: 0,
          new_unit_price: undefined,
          status: order.status ?? 'draft',
          submitted_date: order.created_at ?? undefined,
          approved_date: order.updated_at || undefined,
          approved_by: undefined,
          attachments: undefined,
        }))
        : [];
      setOrders(typedOrders);

      const lineItemData = Array.isArray(lineItemRes)
        ? lineItemRes.map(item => ({
          id: item.id,
          description: item.description ?? ''
        }))
        : [];
      setLineItems(lineItemData);
    } catch (err) {
      setOrders([]);
      setLineItems([]);
      setErrorMessage(reportChangeOrdersError('load change orders', err, projectId));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleCreateOrder = async () => {
    const title = typeof newOrder.title === 'string' ? newOrder.title.trim() : '';
    if (title.length === 0) return;

    if (!projectId) {
      setErrorMessage('Project context is missing. Return to the project and try again.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const createdRows = await rpcClient.insert_change_orders({
        _input: {
          project_id: projectId,
          number: title,
          description: newOrder.description || null,
          amount: (newOrder.new_quantity || 0) * (newOrder.new_unit_price || 0) || null,
          status: newOrder.status || 'draft',
        }
      });

      const created = Array.isArray(createdRows) && createdRows.length > 0 ? createdRows[0] : null;
      if (created) {
        const mapped: ChangeOrder = {
          id: created.id,
          contract_id: created.project_id || projectId,
          line_item_id: '',
          title: created.number || '',
          description: created.description ?? undefined,
          new_quantity: 0,
          new_unit_price: undefined,
          status: created.status ?? 'draft',
          submitted_date: created.created_at || undefined,
          approved_date: created.updated_at || undefined,
          approved_by: undefined,
          attachments: undefined,
        };
        setOrders((prev) => [mapped, ...prev]);
      } else {
        await fetchData();
      }

      setNewOrder(createEmptyChangeOrder());
    } catch (err) {
      setErrorMessage(reportChangeOrdersError('create change order', err, projectId));
    } finally {
      setIsSubmitting(false);
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
    <div className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => navigate(`/projects/${id}`)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Go back to project"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Change Orders</h1>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => { void fetchData(); }}
              className="rounded-md border border-red-400/40 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/20"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">New Change Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={newOrder.title}
            onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })}
            className="border rounded p-2"
          />
          <label htmlFor="line-item-select" className="sr-only">Select Line Item</label>
          <select
            id="line-item-select"
            value={newOrder.line_item_id}
            onChange={(e) => setNewOrder({ ...newOrder, line_item_id: e.target.value })}
            className="border rounded p-2"
          >
            <option value="">Select Line Item</option>
            {lineItems.map((li) => (
              <option key={li.id} value={li.id}>
                {li.description}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="New Quantity"
            value={newOrder.new_quantity ?? ''}
            onChange={(e) => setNewOrder({ ...newOrder, new_quantity: parseFloat(e.target.value) })}
            className="border rounded p-2"
          />
          <input
            type="number"
            placeholder="New Unit Price"
            value={newOrder.new_unit_price ?? ''}
            onChange={(e) => setNewOrder({ ...newOrder, new_unit_price: parseFloat(e.target.value) })}
            className="border rounded p-2"
          />
          <textarea
            placeholder="Description"
            value={typeof newOrder.description === 'string' ? newOrder.description : ''}
            onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
            className="border rounded p-2 col-span-full"
          />
        </div>
        <button
          type="button"
          onClick={() => { void handleCreateOrder(); }}
          disabled={isSubmitting}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Change Order'}
        </button>
      </div>

      {orders.length === 0 ? (
        !errorMessage ? <p className="text-gray-300">No change orders found.</p> : null
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white shadow rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/projects/${id}/change-orders/${order.id}`)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{(() => {
                    const found = lineItems.find(li => li.id === order.line_item_id);
                    return (found && typeof found.description === 'string' && found.description.length > 0) ? found.description : 'Unknown';
                  })()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.new_quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.new_unit_price ?? '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{typeof order.submitted_date === 'string' && order.submitted_date.length > 0 ? new Date(order.submitted_date).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
