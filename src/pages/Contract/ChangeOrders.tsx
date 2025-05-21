import { useState, useEffect } from 'react'; // Import React hooks
import { useParams, useNavigate } from 'react-router-dom'; // Import hooks for routing
import { ArrowLeft } from 'lucide-react'; // Import arrow icon for navigation
import { supabase } from '@/lib/supabase'; // Import Supabase client
import { useAuthStore } from '@/lib/store'; // Import auth store to get user
import { getDemoSession } from '@/lib/utils/cloneDemoData'; // Import demo session utility

/** 
 * Change Order interface representing a change order record.
 */
interface ChangeOrder {
  id?: string; // Optional ID of the change order
  contract_id: string; // ID of the associated contract
  line_item_id: string; // ID of the associated line item
  title: string; // Title of the change order
  description?: string; // Optional description
  new_quantity: number; // New quantity for the line item
  new_unit_price?: number; // Optional new unit price
  status: string; // Status of the change order
  submitted_date?: string; // Optional submission date
  approved_date?: string; // Optional approval date
  approved_by?: string; // Optional ID of the user who approved the change
  attachments?: string[]; // Optional array of attachment URLs
}

/** 
 * LineItem interface representing a line item record.
 */
interface LineItem {
  id: string; // ID of the line item
  description: string; // Description of the line item
}

/** 
 * Get the CSS color class for the change order status.
 * 
 * @param status - The status of the change order.
 */
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800'; // Color for approved status
    case 'rejected':
      return 'bg-red-100 text-red-800'; // Color for rejected status
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'; // Color for pending status
    case 'draft':
      return 'bg-gray-200 text-gray-800'; // Color for draft status
    default:
      return 'bg-gray-100 text-gray-800'; // Default color for unrecognized status
  }
};

// ChangeOrders component for displaying and managing change orders
export default function ChangeOrders() {
  const { id: contract_id } = useParams(); // Extract contract ID from route parameters
  const navigate = useNavigate(); // Use the navigate hook for route navigation
  const user = useAuthStore(state => state.user); // Get current user from auth store

  const [orders, setOrders] = useState<ChangeOrder[]>([]); // State for the list of change orders
  const [lineItems, setLineItems] = useState<LineItem[]>([]); // State for the list of line items
  const [loading, setLoading] = useState(true); // State for loading status
  const [newOrder, setNewOrder] = useState<Partial<ChangeOrder>>({ // State for new change order form data
    title: '',
    line_item_id: '',
    new_quantity: 0,
    new_unit_price: undefined,
    status: 'draft', // Default status
  });

  useEffect(() => {
    // Fetch change orders and line items on component mount
    async function fetchData() {
      try {
        // Use contract_id_param for get_line_items_with_wkt and contract_id for get_change_orders
        const safeContractId = typeof contract_id === 'string' && contract_id.length > 0 ? contract_id : '';
        const lineItemRes = await supabase
          .rpc('get_line_items_with_wkt', { contract_id_param: safeContractId });
        const orderRes = await supabase
          .rpc('get_change_orders', { contract_id: safeContractId });

        if (orderRes.error) throw orderRes.error;
        if (lineItemRes.error) throw lineItemRes.error;

        // Ensure the data conforms to the ChangeOrder interface
        const typedOrders = Array.isArray(orderRes.data)
          ? orderRes.data.map(order => ({
            id: order.id,
            contract_id: safeContractId,
            line_item_id: order.line_item_id ?? '',
            title: order.title ?? '',
            description: order.description ?? undefined,
            new_quantity: order.new_quantity ?? 0,
            new_unit_price: order.new_unit_price ?? undefined,
            status: order.status ?? 'draft',
            submitted_date: order.submitted_date ?? undefined,
            approved_date: order.approved_date ?? undefined,
            approved_by: order.approved_by ?? undefined,
            attachments: Array.isArray(order.attachments) ? order.attachments : undefined,
          }))
          : [];
        setOrders(typedOrders);

        const lineItemData = Array.isArray(lineItemRes.data)
          ? lineItemRes.data.map(item => ({
            id: item.id,
            description: item.description ?? ''
          }))
          : [];
        setLineItems(lineItemData);
      } catch (err) {
        console.error('Error fetching change orders or line items:', err);
      } finally {
        setLoading(false);
      }
    }
    void fetchData(); // Call data fetching function
  }, [contract_id]); // Dependency to refetch on contract ID change

  // Handle creating a new change order
  const handleCreateOrder = async () => {
    if (typeof newOrder.title !== 'string' || newOrder.title.length === 0 || typeof newOrder.line_item_id !== 'string' || newOrder.line_item_id.length === 0) return; // Ensure necessary fields are filled

    const demoSession = getDemoSession();
    // Use the insert_change_orders RPC function instead of direct table access
    const { error } = await supabase.rpc('insert_change_orders', {
      _data: {
        contract_id,
        title: newOrder.title,
        description: newOrder.description,
        line_item_id: newOrder.line_item_id,
        new_quantity: newOrder.new_quantity,
        new_unit_price: newOrder.new_unit_price,
        status: typeof newOrder.status === 'string' && newOrder.status.length > 0 ? newOrder.status : 'draft',
        created_by: user?.id,
        ...(demoSession ? { session_id: demoSession.sessionId } : {}),
      }
    });

    if (error) {
      console.error('Error creating change order:', error);
      return;
    }

    // Refresh orders after creating a new one using the get_change_orders RPC
    try {
      const orderRes = await supabase
        .rpc('get_change_orders', {
          contract_id: typeof contract_id === 'string' && contract_id.length > 0 ? contract_id : ''
        });
      if (orderRes.error) throw orderRes.error;
      const typedOrders = Array.isArray(orderRes.data)
        ? orderRes.data.map(order => ({
          id: order.id,
          contract_id: typeof contract_id === 'string' && contract_id.length > 0 ? contract_id : '',
          line_item_id: order.line_item_id ?? '',
          title: order.title ?? '',
          description: order.description ?? undefined,
          new_quantity: order.new_quantity ?? 0,
          new_unit_price: order.new_unit_price ?? undefined,
          status: order.status ?? 'draft',
          submitted_date: order.submitted_date ?? undefined,
          approved_date: order.approved_date ?? undefined,
          approved_by: order.approved_by ?? undefined,
          attachments: Array.isArray(order.attachments) ? order.attachments : undefined,
        }))
        : [];
      setOrders(typedOrders);
      setNewOrder({
        title: '',
        line_item_id: '',
        new_quantity: 0,
        new_unit_price: undefined,
        status: 'draft',
      });
    } catch (err) {
      console.error('Error refreshing change orders:', err);
    }
  };

  // Render loading indicator
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div> {/* Loading spinner */}
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Navigation back to contract dashboard */}
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => navigate(`/contracts/${contract_id}`)} // Navigate back to contract
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Go back to contract"
        >
          <ArrowLeft className="w-6 h-6" /> {/* Back arrow icon */}
        </button>
        <h1 className="text-2xl font-bold text-white">Change Orders</h1> {/* Page title */}
      </div>

      {/* New Change Order Form */}
      <div className="bg-white shadow p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">New Change Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={newOrder.title}
            onChange={(e) => setNewOrder({ ...newOrder, title: e.target.value })} // Update title
            className="border rounded p-2"
          />
          <label htmlFor="line-item-select" className="sr-only">Select Line Item</label>
          <select
            id="line-item-select"
            value={newOrder.line_item_id}
            onChange={(e) => setNewOrder({ ...newOrder, line_item_id: e.target.value })} // Update line item
            className="border rounded p-2"
          >
            <option value="">Select Line Item</option> {/* Prompt for selection */}
            {lineItems.map((li) => (
              <option key={li.id} value={li.id}>
                {li.description} {/* Display line item code and description */}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="New Quantity"
            value={newOrder.new_quantity ?? ''}
            onChange={(e) => setNewOrder({ ...newOrder, new_quantity: parseFloat(e.target.value) })} // Update new quantity
            className="border rounded p-2"
          />
          <input
            type="number"
            placeholder="New Unit Price"
            value={newOrder.new_unit_price ?? ''}
            onChange={(e) => setNewOrder({ ...newOrder, new_unit_price: parseFloat(e.target.value) })} // Update new unit price
            className="border rounded p-2"
          />
          <textarea
            placeholder="Description"
            value={typeof newOrder.description === 'string' ? newOrder.description : ''}
            onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })} // Update description
            className="border rounded p-2 col-span-full"
          />
        </div>
        <button
          onClick={() => { void handleCreateOrder(); }} // Call create order function on click
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Submit Change Order
        </button> {/* Button to submit change order */}
      </div>

      {/* List of existing change orders */}
      {orders.length === 0 ? (
        <p className="text-gray-300">No change orders found.</p> // Message if no change orders exist
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
                  onClick={() => navigate(`/contracts/${contract_id}/change-orders/${order.id}`)} // Navigate to order details
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.title}</td> {/* Render order title */}
                  <td className="px-6 py-4 text-sm text-gray-700">{(() => { const found = lineItems.find(li => li.id === order.line_item_id); return (found && typeof found.description === 'string' && found.description.length > 0) ? found.description : 'Unknown'; })()}</td> {/* Render line item description */}
                  <td className="px-6 py-4 text-sm text-gray-900">{order.new_quantity}</td> {/* Render new quantity */}
                  <td className="px-6 py-4 text-sm text-gray-900">{order.new_unit_price ?? '—'}</td> {/* Render new unit price */}
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status} {/* Render order status */}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{typeof order.submitted_date === 'string' && order.submitted_date.length > 0 ? new Date(order.submitted_date).toLocaleDateString() : '—'}</td> {/* Render submission date */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}