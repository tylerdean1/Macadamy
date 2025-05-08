import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Stack,
  Button,
} from '@mui/material';

import type { LineItems, LineItemTemplates } from '@/lib/types';
import type { UnitMeasureTypeValue } from '@/lib/enums';

interface LineCodeFormProps {
  initialData?: Partial<LineItems>;
  onSave: (item: LineItems) => void;
  onCancel: () => void;
  templates: LineItemTemplates[];
  unitOptions: { label: string; value: UnitMeasureTypeValue }[];
}

export function LineCodeForm({
  initialData,
  onSave,
  onCancel,
  templates,
  unitOptions,
}: LineCodeFormProps) {
  const [form, setForm] = useState<Partial<LineItems>>({
    line_code: '',
    description: '',
    quantity: 0,
    unit_price: 0,
    unit_measure: 'Lump Sum (LS)',
    reference_doc: '',
    template_id: null,
  });

  const [customUnit, setCustomUnit] = useState('');
  const [useCustomUnit, setUseCustomUnit] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      if (
        initialData.unit_measure &&
        !unitOptions.some((u) => u.value === initialData.unit_measure)
      ) {
        setUseCustomUnit(true);
        setCustomUnit(initialData.unit_measure);
      }
    }
  }, [initialData, unitOptions]);

  const handleChange = (
    field: keyof LineItems,
    value: string | number | null
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    const unit_measure = useCustomUnit
      ? (customUnit as UnitMeasureTypeValue)
      : (form.unit_measure as UnitMeasureTypeValue);

    onSave({
      ...form,
      unit_measure,
      reference_doc: form.reference_doc || '',
      template_id: form.template_id || null,
    } as LineItems);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        label="Line Code"
        value={form.line_code || ''}
        onChange={(e) => handleChange('line_code', e.target.value)}
        fullWidth
      />
      <TextField
        label="Description"
        value={form.description || ''}
        onChange={(e) => handleChange('description', e.target.value)}
        fullWidth
      />
      <TextField
        label="Quantity"
        type="number"
        value={form.quantity ?? 0}
        onChange={(e) => handleChange('quantity', parseFloat(e.target.value))}
        fullWidth
      />
      <TextField
        label="Unit Price"
        type="number"
        value={form.unit_price ?? 0}
        onChange={(e) => handleChange('unit_price', parseFloat(e.target.value))}
        fullWidth
      />

      {!useCustomUnit && (
        <TextField
          label="Unit Measure"
          select
          value={form.unit_measure || ''}
          onChange={(e) => {
            if (e.target.value === '__custom__') {
              setUseCustomUnit(true);
              handleChange('unit_measure', '');
            } else {
              handleChange('unit_measure', e.target.value);
            }
          }}
          fullWidth
        >
          {unitOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
          <MenuItem value="__custom__">Other (custom)</MenuItem>
        </TextField>
      )}

      {useCustomUnit && (
        <TextField
          label="Custom Unit Measure"
          value={customUnit}
          onChange={(e) => setCustomUnit(e.target.value)}
          fullWidth
        />
      )}

      <TextField
        label="Reference Document"
        value={form.reference_doc || ''}
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
        {templates.map((template) => (
          <MenuItem key={template.id} value={template.id}>
            {template.name}
          </MenuItem>
        ))}
      </TextField>

      <Stack direction="row" justifyContent="flex-end" gap={2}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </Stack>
    </Box>
  );
}
