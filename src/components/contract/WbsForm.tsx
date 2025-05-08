import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export interface EditableWbsSection {
  wbs_number: string;
  description: string;
}

export interface WbsFormProps {
  sections: EditableWbsSection[];
  onChange: (sections: EditableWbsSection[]) => void;
}

const WbsForm: React.FC<WbsFormProps> = ({ sections, onChange }) => {
  const addSection = () => {
    const newSection: EditableWbsSection = {
      wbs_number: '',
      description: '',
    };
    onChange([...sections, newSection]);
  };

  const deleteSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateSection = (
    index: number,
    field: keyof EditableWbsSection,
    value: string
  ) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6">WBS Sections</Typography>
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
          key={`wbs-${index}`} // ✅ Fixed: removed unstable wbs_number from key
          elevation={1}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'background.default',
            display: 'flex',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <TextField
            label="WBS Number"
            value={section.wbs_number}
            onChange={(e) => updateSection(index, 'wbs_number', e.target.value)}
            variant="outlined"
            size="small"
            sx={{ width: '15%' }}
          />
          <TextField
            label="Description"
            value={section.description}
            onChange={(e) => updateSection(index, 'description', e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          />
          <IconButton
            color="error"
            onClick={() => deleteSection(index)}
            disabled={sections.length <= 1}
            aria-label={`Delete WBS section ${section.wbs_number}`}
          >
            <DeleteIcon />
          </IconButton>
        </Paper>
      ))}

      {sections.length === 0 && (
        <Typography sx={{ color: '#fff', my: 4 }} align="center">
          No WBS sections added. Click "Add Section" to create one.
        </Typography>
      )}
    </Box>
  );
};

export default WbsForm;
