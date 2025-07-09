import { Component } from 'react';
import { DollarSign, AlertTriangle } from 'lucide-react';
import { Card } from '@/pages/StandardPages/StandardPageComponents/card';

// Define props for the BudgetTracker component
interface BudgetTrackerProps {
  contractId: string; // Contract ID to fetch data for
  className?: string; // Optional additional classes
}

// Direct RPC interface for budget tracking
interface BudgetData {
  contractBudget: number;
  lineItemTotal: number;
  difference: number;
  percentageUsed: number;
}

interface State {
  budgetData: BudgetData;
  loading: boolean;
  error: string | null;
}

// BudgetTracker component to monitor the budget of a contract
export class BudgetTracker extends Component<BudgetTrackerProps, State> {
  constructor(props: BudgetTrackerProps) {
    super(props);
    this.state = {
      budgetData: {
        contractBudget: 0,
        lineItemTotal: 0,
        difference: 0,
        percentageUsed: 0
      },
      loading: true,
      error: null
    };
  }

  componentDidMount() {
    void this.fetchBudgetData();
  }

  componentDidUpdate(prevProps: BudgetTrackerProps) {
    if (prevProps.contractId !== this.props.contractId) {
      void this.fetchBudgetData();
    }
  }

  fetchBudgetData = async () => {
    const { contractId } = this.props;
    if (!contractId) return;

    try {
      this.setState({ loading: true, error: null });

      // Inline RPC call to get contract budget data
      const budgetResponse = await fetch(`/api/contracts/${contractId}/budget`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!budgetResponse.ok) {
        throw new Error(`Failed to fetch budget data: ${budgetResponse.statusText}`);
      }

      const budgetData = (await budgetResponse.json()) as { contractBudget?: number; lineItemTotal?: number };

      // Calculate derived values (these could also be returned by the API)
      const contractBudget = typeof budgetData.contractBudget === 'number' ? budgetData.contractBudget : 0;
      const lineItemTotal = typeof budgetData.lineItemTotal === 'number' ? budgetData.lineItemTotal : 0;
      const difference = contractBudget - lineItemTotal;
      const percentageUsed = contractBudget > 0 ? (lineItemTotal / contractBudget) * 100 : 0;

      this.setState({
        budgetData: {
          contractBudget,
          lineItemTotal,
          difference,
          percentageUsed
        },
        loading: false
      });
    } catch (err) {
      console.error('Error fetching budget data:', err);
      this.setState({
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false
      });
    }
  }

  // Determine the status color based on budget utilization
  getStatusColor = () => {
    const { percentageUsed } = this.state.budgetData;
    if (percentageUsed > 100) return 'bg-red-500'; // Over budget
    if (percentageUsed > 90) return 'bg-yellow-500'; // Nearing budget
    return 'bg-green-500'; // Under budget
  };

  render() {
    const { className = '' } = this.props;
    const { budgetData, loading, error } = this.state;

    return (
      <Card
        title="Budget Tracker" // Title for the card
        icon={<DollarSign className="w-5 h-5 text-primary" />} // Icon displayed in the card
        className={className} // Additional classes for styling
      >
        {loading ? (
          <div className="py-4 text-center text-gray-500">Loading budget data...</div>
        ) : typeof error === 'string' && error.length > 0 ? (
          <div className="py-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            <div>
              {/* Display contract budget and line item total */}
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Contract Budget</span>
                <span>${budgetData.contractBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Line Items Total</span>
                <span>${budgetData.lineItemTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className={budgetData.difference < 0 ? 'text-red-500' : 'text-green-500'}>
                  {budgetData.difference < 0 ? 'Over Budget' : 'Remaining'} {/* Indicate if over budget */}
                </span>
                <span className={budgetData.difference < 0 ? 'text-red-500' : 'text-green-500'}>
                  ${Math.abs(budgetData.difference).toLocaleString()} {/* Display remaining or exceeded amount */}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Budget Utilization</span>
                <span className="text-sm font-medium text-white">{budgetData.percentageUsed.toFixed(1)}%</span> {/* Show utilization percentage */}
              </div>
              <div
                className={`budgetBar ${this.getStatusColor()}`} // Dynamic CSS class based on status
                style={{ width: `${Math.min(budgetData.percentageUsed, 100)}%` }} // Set width of the progress bar
                data-width={Math.min(budgetData.percentageUsed, 100)} // Data attribute for potential styling or scripts
              />
            </div>

            {budgetData.percentageUsed > 100 && ( // Display alert if budget is exceeded
              <div className="flex items-center gap-2 text-sm text-red-500 mt-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Budget exceeded by {(budgetData.percentageUsed - 100).toFixed(1)}%</span> {/* Alert message */}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }
}