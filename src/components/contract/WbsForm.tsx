import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const WbsForm = ({ sections, onChange }) => {
  // Add a new WBS section
  const addSection = () => {
    const newNumber = (sections.length + 1).toString();
    onChange([...sections, { wbs_number: newNumber, description: '' }]);
  };
  
  // Delete a WBS section
  const deleteSection = (index) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    
    // Re-number the remaining sections
    const updatedSections = newSections.map((section, idx) => ({
      ...section,
      wbs_number: (idx + 1).toString()
    }));
    
    onChange(updatedSections);
  };
  
  // Update a WBS section
  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      [field]: value
    };
    onChange(newSections);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Work Breakdown Structure (WBS) Sections
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={addSection}
        >
          Add Section
        </Button>
      </Box>
      
      {sections.map((section, index) => (
        <Paper 
          key={index} 
          elevation={1} 
          sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <TextField
                label="WBS Number"
                value={section.wbs_number}
                onChange={(e) => updateSection(index, 'wbs_number', e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={9}>
              <TextField
                label="Description"
                value={section.description}
                onChange={(e) => updateSection(index, 'description', e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton 
                color="error" 
                onClick={() => deleteSection(index)}
                disabled={sections.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}
      
      {sections.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
          No WBS sections added. Click "Add Section" to create one.
        </Typography>
      )}
    </Box>
  );
};

export default WbsForm;
