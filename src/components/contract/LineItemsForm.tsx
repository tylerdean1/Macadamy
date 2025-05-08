import {
  Paper,
  Stack,
  Typography,
  IconButton,
  Box,
  Button,
} from '@mui/material';
import { Plus, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';

import { LineItemModal } from '@/components/contract/LineItemModal';
import type { LineItems, LineItemTemplates } from '@/lib/types';
import type { UnitMeasureTypeValue } from '@/lib/enums';

interface LineItemsFormProps {
  mapId: string;
  lineItems: LineItems[];
  onChange: (items: LineItems[]) => void;
  templates: LineItemTemplates[];
  unitOptions: { label: string; value: UnitMeasureTypeValue }[];
}

export function LineItemsForm({
  mapId,
  lineItems,
  onChange,
  templates,
  unitOptions,
}: LineItemsFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSave = (item: Partial<LineItems>) => {
    const newItem = {
      ...item,
      id: item.id || crypto.randomUUID(),
      map_id: mapId,
    } as LineItems;

    const updated = [...lineItems];
    if (editingIndex !== null) {
      updated[editingIndex] = newItem;
    } else {
      updated.push(newItem);
    }

    onChange(updated);
    setShowModal(false);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const updated = [...lineItems];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <>
      <Stack spacing={2}>
        {lineItems.map((item, index) => (
          <Paper
            key={item.id}
            sx={{ p: 2, backgroundColor: 'background.default' }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle2">{item.line_code}</Typography>
                <Typography variant="body2">{item.description}</Typography>
                <Typography variant="caption">
                  Qty: {item.quantity} × ${item.unit_price?.toFixed(2)} ({item.unit_measure})
                </Typography>
              </Box>
              <Box>
                <IconButton
                  onClick={() => {
                    setEditingIndex(index);
                    setShowModal(true);
                  }}
                >
                  <Pencil size={16} />
                </IconButton>
                <IconButton onClick={() => handleDelete(index)}>
                  <Trash size={16} />
                </IconButton>
              </Box>
            </Stack>
          </Paper>
        ))}

        <Button
          variant="outlined"
          startIcon={<Plus />}
          onClick={() => {
            setEditingIndex(null);
            setShowModal(true);
          }}
        >
          Add Line Item
        </Button>
      </Stack>

      {showModal && (
        <LineItemModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingIndex(null);
          }}
          onSave={handleSave}
          templates={templates}
          unitOptions={unitOptions}
        />
      )}
    </>
  );
}