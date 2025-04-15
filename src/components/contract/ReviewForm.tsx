import {
  Box,
  Stack,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material'; // Importing necessary components from Material-UI
import { format } from 'date-fns'; // Import date formatting function

// Define the type for contract data
interface ContractData {
  title?: string; // Optional title of the contract
  location?: string; // Optional location of the contract
  status?: string; // Optional status of the contract
  budget?: number; // Optional budget of the contract
  start_date?: string; // Optional start date of the contract
  end_date?: string; // Optional end date of the contract
  description?: string; // Optional description of the contract
}

// Define the type for a Work Breakdown Structure (WBS) section
interface WbsSection {
  wbs_number: string; // The WBS number
  description: string; // Description of the WBS section
}

// Define the type for map locations
interface MapLocation {
  map_number: string; // Map number
  wbs_number?: string; // Optional WBS number associated with this location
  location_description: string; // Description of the location
}

// Define the type for line items
interface LineItem {
  line_code: string; // Line code for the item
  description: string; // Description of the line item
  quantity: number; // Quantity of the item
  unit_measure: string; // Unit of measure
  unit_price: number; // Price per unit
  wbs_number: string; // WBS number associated with this item
  map_number?: string; // Optional map number associated with this item
}

// Props for ReviewForm component
interface ReviewFormProps {
  contractData: ContractData; // Contract data to be reviewed
  wbsSections: WbsSection[]; // Array of WBS sections
  mapLocations: MapLocation[]; // Array of map locations
  lineItems: LineItem[]; // Array of line items
}

// ReviewForm component for displaying contract review information
const ReviewForm: React.FC<ReviewFormProps> = ({ contractData, wbsSections, mapLocations, lineItems }) => {
  // Calculate the total budget from line items
  const calculateLineItemsTotal = () => {
    return lineItems.reduce((total, item) => {
      return total + ((item.quantity || 0) * (item.unit_price || 0)); // Total of quantity * unit price
    }, 0);
  };
  
  // Format a date for display
  const formatDate = (date: string | undefined): string => {
    try {
      return date ? format(new Date(date), 'MMM dd, yyyy') : 'Not set'; // Format date or set to 'Not set'
    } catch {
      return 'Invalid date'; // Handle invalid date
    }
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Contract Details
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          Contract Information
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2">Title</Typography>
            <Typography variant="body1" gutterBottom>
              {contractData.title || 'Not provided'} {/* Show title or default message */}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Location</Typography>
            <Typography variant="body1" gutterBottom>
              {contractData.location || 'Not provided'} {/* Show location or default message */}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Status</Typography>
            <Typography variant="body1" gutterBottom>
              {contractData.status || 'Not provided'} {/* Show status or default message */}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Budget</Typography>
            <Typography variant="body1" gutterBottom>
              ${(contractData.budget || 0).toLocaleString('en-US', {minimumFractionDigits: 2})} {/* Format budget */}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Start Date</Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(contractData.start_date)} {/* Show formatted start date */}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">End Date</Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(contractData.end_date)} {/* Show formatted end date */}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Description</Typography>
            <Typography variant="body1" gutterBottom>
              {contractData.description || 'No description provided'} {/* Show description or default message */}
            </Typography>
          </Box>
        </Stack>
      </Paper>
      
      {/* WBS Sections */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Work Breakdown Structure
        </Typography>
        
        <List dense>
          {wbsSections.map((section, index) => (
            <ListItem key={index} divider={index < wbsSections.length - 1}>
              <ListItemText
                primary={`WBS ${section.wbs_number}`} // Display WBS number
                secondary={section.description} // Display WBS description
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      
      {/* Map Locations */}
      {mapLocations.length > 0 && (
        <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Map Locations
          </Typography>
          
          <List dense>
            {mapLocations.map((map, index) => (
              <ListItem key={index} divider={index < mapLocations.length - 1}>
                <ListItemText
                  primary={`Map ${map.map_number} (WBS ${map.wbs_number || 'unknown'})`} // Display map number and WBS
                  secondary={map.location_description} // Display location description
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      
      {/* Line Items */}
      {lineItems.length > 0 && (
        <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Line Items
          </Typography>
          
          <List dense>
            {lineItems.map((item, index) => (
              <ListItem key={index} divider={index < lineItems.length - 1}>
                <ListItemText
                  primary={`${item.line_code} - ${item.description}`} // Display line code and description
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        {`${item.quantity} ${item.unit_measure} at $${item.unit_price.toFixed(2)} each = $${(item.quantity * item.unit_price).toFixed(2)}`} {/* Display item details */}
                      </Typography>
                      <br />
                      <Chip 
                        size="small" 
                        label={`WBS ${item.wbs_number}`} 
                        sx={{ mr: 1, mt: 1 }} // Chip for WBS number
                      />
                      {item.map_number && (
                        <Chip 
                          size="small" 
                          label={`Map ${item.map_number}`} 
                          sx={{ mt: 1 }} // Chip for map number if exists
                        />
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Box display="flex" justifyContent="space-between">
            <Typography variant="subtitle1">Total From Line Items:</Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              ${calculateLineItemsTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })} {/* Display total line items cost */}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ReviewForm; // Export the ReviewForm component