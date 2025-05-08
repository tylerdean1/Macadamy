import { Button, Paper, TextField, Typography, Box, IconButton } from '@mui/material';
import { Trash2, Plus } from 'lucide-react';

export interface EditableMap {
  map_number: string;
  location_description: string;
}

export interface MapsFormProps {
  wbsId: string;
  maps: EditableMap[];
  onChange: (maps: EditableMap[]) => void;
}

export function MapsForm({ maps, onChange }: MapsFormProps) {
  const addMap = () => {
    const newMap: EditableMap = {
      map_number: '',
      location_description: '',
    };
    onChange([...maps, newMap]);
  };

  const deleteMap = (index: number) => {
    const updated = maps.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateMap = (
    index: number,
    field: keyof EditableMap,
    value: string
  ) => {
    const updated = [...maps];
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
        <Typography variant="h6">Maps</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus />}
          onClick={addMap}
        >
          Add Map
        </Button>
      </Box>

      {maps.map((map, index) => (
        <Paper
          key={`map-${index}`} // ✅ Fixed: removed unstable map_number from key
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
            label="Map Number"
            value={map.map_number}
            onChange={(e) => updateMap(index, 'map_number', e.target.value)}
            variant="outlined"
            size="small"
            sx={{ width: '20%' }}
          />
          <TextField
            label="Location Description"
            value={map.location_description}
            onChange={(e) => updateMap(index, 'location_description', e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          />
          <IconButton
            color="error"
            onClick={() => deleteMap(index)}
            disabled={maps.length <= 1}
            aria-label="Delete map"
          >
            <Trash2 />
          </IconButton>
        </Paper>
      ))}

      {maps.length === 0 && (
        <Typography sx={{ color: '#fff', my: 4 }} align="center">
          No maps added. Click "Add Map" to create one.
        </Typography>
      )}
    </Box>
  );
}