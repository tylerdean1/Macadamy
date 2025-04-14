import React from 'react'; // Import React
import { FaSave as Save } from 'react-icons/fa'; // Import Save icon

// Define the props type for the InspectionForm component
interface InspectionFormProps {
    inspection: {
        inspector: string; // ID of the inspector
        inspection_date: string; // Date of the inspection
        status: string; // Status of the inspection
        findings: string; // Findings from the inspection
        recommendations: string; // Recommendations based on the inspection
    };
    onSubmit: (e: React.FormEvent) => void; // Function to handle form submission
    onChange: (updatedInspection: Partial<InspectionFormProps['inspection']>) => void; // Function to handle updates to the inspection object
}

// InspectionForm component for managing inspection reports
const InspectionForm: React.FC<InspectionFormProps> = ({ inspection, onSubmit, onChange }) => {
    return (
        <form onSubmit={onSubmit} className="space-y-6"> {/* Form submission with spacing */}
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Inspector</label>
                <select
                    title="Inspector" // Accessible name for the select element
                    aria-label="Inspector" // Accessible name for the select element
                    value={inspection.inspector} // Bind inspector to current inspection state
                    onChange={(e) => onChange({ ...inspection, inspector: e.target.value })} // Handle changes
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                >
                    <option value="">Select Inspector</option>
                    {/* Map through available inspectors to populate options here */}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Inspection Date</label>
                <input
                    type="date" // Input type for date selection
                    value={inspection.inspection_date} // Bind to inspection date
                    onChange={(e) => onChange({ ...inspection, inspection_date: e.target.value })} // Handle change
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Select a date" // Add placeholder for accessibility
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select
                    title="Inspection Status" // Accessible name for the select element
                    aria-label="Inspection Status" // Accessible name for the select element
                    value={inspection.status} // Bind to inspection status
                    onChange={(e) => onChange({ ...inspection, status: e.target.value })} // Handle change
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                >
                    <option value="Pending">Pending</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                    <option value="Needs Review">Needs Review</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Findings</label>
                <textarea
                    title="Inspection Findings" // Accessible name for the textarea
                    placeholder="Enter findings from the inspection" // Placeholder for user guidance
                    value={inspection.findings} // Bind to inspection findings
                    onChange={(e) => onChange({ ...inspection, findings: e.target.value })} // Handle change
                    rows={3}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Recommendations</label>
                <textarea
                    title="Inspection Recommendations" // Accessible name for the textarea
                    placeholder="Enter recommendations based on the inspection" // Placeholder for user guidance
                    value={inspection.recommendations} // Bind to inspection recommendations
                    onChange={(e) => onChange({ ...inspection, recommendations: e.target.value })} // Handle change
                    rows={3}
                    className="w-full px-4 py-2 bg-background border border-background-lighter text-white rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
            </div>

            <div className="flex justify-end space-x-4"> {/* Button section */}
                <button
                    type="button"
                    onClick={() => onChange({})} // Trigger cancel behavior
                    className="px-4 py-2 bg-background border border-background-lighter text-white rounded-md hover:bg-background-lighter transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit" // Submit form to save the inspection
                    className="flex items-center px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
                >
                    <Save className="w-5 h-5 mr-2" /> {/* Save icon */}
                    Save
                </button>
            </div>
        </form>
    );
};

export default InspectionForm; // Export the component