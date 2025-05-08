import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Divider,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import { useEffect, useState } from 'react';
import RoomIcon from '@mui/icons-material/Room';
import { MapModal } from '@/components/contract/MapModal';
import { GoogleMap, Marker, Polyline, Polygon, useJsApiLoader } from '@react-google-maps/api';

import type { UnitMeasureTypeValue } from '@/lib/enums';
import type { LineItemTemplates } from '@/lib/types';

interface LineItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: {
    line_code: string;
    description: string;
    quantity: number;
    unit_price: number;
    unit_measure: UnitMeasureTypeValue;
    reference_doc?: string | null;
    template_id: string | null;
    coordinates: string | null;
  }) => void;
  templates: LineItemTemplates[];
  unitOptions: { label: string; value: UnitMeasureTypeValue }[];
}

function GoogleMapPreview({ coordinates }: { coordinates: string | null }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
  });

  if (!coordinates || !isLoaded) return null;

  const parseWKT = (wkt: string): { type: string; points: google.maps.LatLngLiteral[] } => {
    if (wkt.startsWith('POINT')) {
      const [lng, lat] = wkt.replace('POINT(', '').replace(')', '').split(' ').map(Number);
      return { type: 'point', points: [{ lat, lng }] };
    }
    if (wkt.startsWith('LINESTRING')) {
      const coords = wkt.replace('LINESTRING(', '').replace(')', '').split(',').map(pair => {
        const [lng, lat] = pair.trim().split(' ').map(Number);
        return { lat, lng };
      });
      return { type: 'line', points: coords };
    }
    if (wkt.startsWith('POLYGON')) {
      const cleaned = wkt.replace('POLYGON((', '').replace('))', '');
      const coords = cleaned.split(',').map(pair => {
        const [lng, lat] = pair.trim().split(' ').map(Number);
        return { lat, lng };
      });
      return { type: 'polygon', points: coords };
    }
    return { type: 'unknown', points: [] };
  };

  const { type, points } = parseWKT(coordinates);
  if (!points.length) return null;

  const center = points[Math.floor(points.length / 2)];

  return (
    <Box sx={{ my: 2, width: '100%', height: 300 }}>
      <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={center} zoom={16}>
        {type === 'point' && <Marker position={points[0]} />}
        {type === 'line' && <Polyline path={points} options={{ strokeColor: '#00bfff', strokeWeight: 4 }} />}
        {type === 'polygon' && (
          <Polygon path={points} options={{ strokeColor: '#00FF00', fillColor: '#00FF0080', strokeWeight: 2 }} />
        )}
      </GoogleMap>
    </Box>
  );
}

export function LineItemModal({
  open,
  onClose,
  onSave,
  templates,
  unitOptions,
}: LineItemModalProps) {
  const [form, setForm] = useState({
    line_code: '',
    description: '',
    quantity: 0,
    unit_price: 0,
    unit_measure: 'Lump Sum (LS)' as UnitMeasureTypeValue,
    reference_doc: '',
    template_id: null as string | null,
  });

  const [coordinates, setCoordinates] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  const [variables, setVariables] = useState<
    {
      key: string;
      name: string;
      type: string;
      label: string;
      source?: string;
      enum_name?: string;
      required?: boolean;
      default?: string | number;
    }[]
  >([]);

  useEffect(() => {
    if (!form.template_id) {
      setVariables([]);
      return;
    }
    const selected = templates.find(t => t.id === form.template_id);
    if (!selected || !selected.formula) {
      setVariables([]);
      return;
    }

    const raw = typeof selected.formula === 'string'
      ? JSON.parse(selected.formula)
      : selected.formula;

    const fields = raw.fields ?? {};
    const parsed = Object.entries(fields).map(([key, field]) => {
      const typedField = field as {
        name: string;
        type: string;
        label?: string;
        source?: string;
        enum_name?: string;
        required?: boolean;
        default?: string | number;
      };
      return {
        key,
        name: typedField.name,
        type: typedField.type,
        label: typedField.label ?? key,
        source: typedField.source,
        enum_name: typedField.enum_name,
        required: typedField.required ?? false,
        default: typedField.default,
      };
    });
    setVariables(parsed);
  }, [form.template_id, templates]);

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave({
      ...form,
      reference_doc: form.reference_doc || null,
      coordinates,
    });
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Line Item</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Line Code"
            value={form.line_code}
            onChange={(e) => handleChange('line_code', e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
          />
          <TextField
            label="Quantity"
            type="number"
            value={form.quantity}
            onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
            fullWidth
          />
          <TextField
            label="Unit Price"
            type="number"
            value={form.unit_price}
            onChange={(e) => handleChange('unit_price', parseFloat(e.target.value))}
            fullWidth
          />
          <TextField
            label="Unit Measure"
            select
            value={form.unit_measure}
            onChange={(e) => handleChange('unit_measure', e.target.value as UnitMeasureTypeValue)}
            fullWidth
          >
            {unitOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Reference Document (optional)"
            value={form.reference_doc}
            onChange={(e) => handleChange('reference_doc', e.target.value)}
            fullWidth
          />
          <TextField
            label="Template"
            select
            value={form.template_id || ''}
            onChange={(e) => handleChange('template_id', e.target.value)}
            fullWidth
          >
            <MenuItem value="">None</MenuItem>
            {templates.map(t => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>

          {variables.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">Template Variables</Typography>
              {variables.map(variable => (
                <TextField
                  key={variable.key}
                  label={variable.label}
                  defaultValue={variable.default}
                  type={variable.type === 'numeric' ? 'number' : 'text'}
                  fullWidth
                />
              ))}
            </>
          )}

          <Divider sx={{ my: 2 }} />
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2">Location</Typography>
            <IconButton onClick={() => setShowMapModal(true)}>
              <RoomIcon />
            </IconButton>
          </Box>
          <GoogleMapPreview coordinates={coordinates} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {showMapModal && (
        <MapModal
          open={showMapModal}
          onClose={() => setShowMapModal(false)}
          targetId="new"
          level="line"
          onConfirm={(wkt) => {
            setCoordinates(wkt);
            setShowMapModal(false);
          }}
        />
      )}
    </>
  );
}
