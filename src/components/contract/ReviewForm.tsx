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
} from '@mui/material';
import { format } from 'date-fns';

interface ContractData {
  title?: string;
  location?: string;
  status?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
}

interface WbsSection {
  wbs_number: string;
  description: string;
}

interface MapLocation {
  map_number: string;
  wbs_number?: string;
  location_description: string;
}

interface LineItem {
  line_code: string;
  description: string;
  quantity: number;
  unit_measure: string;
  unit_price: number;
  wbs_number: string;
  map_number?: string;
}

interface ReviewFormProps {
  contractData: ContractData;
  wbsSections: WbsSection[];
  mapLocations: MapLocation[];
  lineItems: LineItem[];
}

const ReviewForm: React.FC<ReviewFormProps> = ({ contractData, wbsSections, mapLocations, lineItems }) => {
  // Calculate the total budget from line items
  const calculateLineItemsTotal = () => {
    return lineItems.reduce((total, item) => {
      return total + ((item.quantity || 0) * (item.unit_price || 0));
    }, 0);
  };
  
  // Format a date for display
  const formatDate = (date: string | undefined): string => {
    try {
      return date ? format(new Date(date), 'MMM dd, yyyy') : 'Not set';
    } catch {
      return 'Invalid date';
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
              {contractData.title || 'Not provided'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Location</Typography>
            <Typography variant="body1" gutterBottom>
              {contractData.location || 'Not provided'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Status</Typography>
            <Typography variant="body1" gutterBottom>
              {contractData.status || 'Not provided'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Budget</Typography>
            <Typography variant="body1" gutterBottom>
              ${(contractData.budget || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Start Date</Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(contractData.start_date)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">End Date</Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(contractData.end_date)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2">Description</Typography>
            <Typography variant="body1" gutterBottom>
              {contractData.description || 'No description provided'}
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
                primary={`WBS ${section.wbs_number}`}
                secondary={section.description}
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
                  primary={`Map ${map.map_number} (WBS ${map.wbs_number || 'unknown'})`}
                  secondary={map.location_description}
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
                  primary={`${item.line_code} - ${item.description}`}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                      {`${item.quantity} ${item.unit_measure} at $${item.unit_price.toFixed(2)} each = $${(item.quantity * item.unit_price).toFixed(2)}`}
                      </Typography>
                      <br />
                      <Chip 
                        size="small" 
                        label={`WBS ${item.wbs_number}`} 
                        sx={{ mr: 1, mt: 1 }} 
                      />
                      {item.map_number && (
                        <Chip 
                          size="small" 
                          label={`Map ${item.map_number}`} 
                          sx={{ mt: 1 }} 
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
              ${calculateLineItemsTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ReviewForm;