import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material'; // Importing necessary components from Material-UI
import AddIcon from '@mui/icons-material/Add'; // Importing add icon
import DeleteIcon from '@mui/icons-material/Delete'; // Importing delete icon

// Define the type for a Work Breakdown Structure (WBS) section
interface WbsSection {
  wbs_number: string; // The WBS number
  description: string; // Description of the WBS section
}

// Props for WbsForm component
interface WbsFormProps {
  sections: WbsSection[]; // Array of WBS sections
  onChange: (sections: WbsSection[]) => void; // Callback to update sections
}

// WbsForm component for managing Work Breakdown Structure (WBS) sections
const WbsForm: React.FC<WbsFormProps> = ({ sections, onChange }) => {
  // Function to add a new WBS section
  const addSection = () => {
    const newNumber = (sections.length + 1).toString(); // Calculate new WBS number
    onChange([...sections, { wbs_number: newNumber, description: '' }]); // Add new section with empty description
  };
  
  // Function to delete a WBS section by its index
  const deleteSection = (index: number) => {
    const newSections = [...sections]; // Create a copy of current sections
    newSections.splice(index, 1); // Remove section at specified index
    
    // Re-number the remaining sections after deletion
    const updatedSections = newSections.map((section, idx) => ({
      ...section,
      wbs_number: (idx + 1).toString() // Update WBS number
    }));
    
    onChange(updatedSections); // Call onChange with updated sections
  };
  
  // Function to update a specific field of a WBS section
  const updateSection = (index: number, field: keyof WbsSection, value: string) => {
    const newSections = [...sections]; // Copy current sections
    newSections[index] = {
      ...newSections[index],
      [field]: value // Update specified field with new value
    };
    onChange(newSections); // Call onChange with updated sections
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Work Breakdown Structure (WBS) Sections</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />} // Add icon for the button
          onClick={addSection} // Add section when clicked
        >
          Add Section
        </Button>
      </Box>
      
      {/* Map over sections and render each with input fields */}
      {sections.map((section, index) => (
        <Paper 
          key={index} 
          elevation={1} 
          sx={{ p: 2, mb: 2, bgcolor: 'background.default' }} // Styling for each section paper
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <TextField
                label="WBS Number" // Label for input
                value={section.wbs_number} // WBS number value
                onChange={(e) => updateSection(index, 'wbs_number', e.target.value)} // Update value on change
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={9}>
              <TextField
                label="Description" // Label for input
                value={section.description} // Description value
                onChange={(e) => updateSection(index, 'description', e.target.value)} // Update value on change
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton 
                color="error" 
                onClick={() => deleteSection(index)} // Delete section on click
                disabled={sections.length <= 1} // Disable if only one section remains
              >
                <DeleteIcon /> {/* Delete icon*/}
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}
      
      {/* Message if there are no sections present */}
      {sections.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
          No WBS sections added. Click "Add Section" to create one.
        </Typography>
      )}
    </Box>
  );
};

export default WbsForm; // Export the WbsForm component