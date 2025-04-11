import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';


type ContractInfoFormProps = {
  data: {
    title: string;
    location: string;
    start_date: string;
    end_date: string;
    status: string;
    budget: number;
    description: string;
    created_by: string;
  };
  onChange: (updatedData: Partial<ContractInfoFormProps['data']>) => void;
};


const ContractInfoForm: React.FC<ContractInfoFormProps> = ({ data, onChange }) => {
  const [displayDates, setDisplayDates] = useState({
    start_date: formatDateForDisplay(data.start_date),
    end_date: formatDateForDisplay(data.end_date)
  });

  useEffect(() => {
    setDisplayDates({
      start_date: formatDateForDisplay(data.start_date),
      end_date: formatDateForDisplay(data.end_date)
    });
  }, [data.start_date, data.end_date]);

  function formatDateForDisplay(date: string | null | undefined): string {
    if (!date) return '';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = String(dateObj.getFullYear());
    return `${month}/${day}/${year}`;
  }

  const handleChange = (field: keyof ContractInfoFormProps['data']) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newDisplayValue = event.target.value;
      setDisplayDates((prev) => ({
        ...prev,
        [field]: newDisplayValue,
      }));
  
      const isoDate = new Date(newDisplayValue);
      const isValidDate = !isNaN(isoDate.getTime());
  
      onChange({
        ...data,
        [field]: isValidDate
          ? isoDate.toISOString().split('T')[0]
          : newDisplayValue,
      });
    };


  type DateField = keyof Pick<ContractInfoFormProps['data'], 'start_date' | 'end_date'>;

  const openDatePicker = (dateField: DateField): void => {
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    if (data[dateField]) {
      dateInput.value = new Date(data[dateField]).toISOString().split('T')[0];
    }
    dateInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const selectedDate = target.value;
      onChange({ ...data, [dateField]: selectedDate });
      setDisplayDates(prev => ({
        ...prev,
        [dateField]: formatDateForDisplay(selectedDate)
      }));
    });
    dateInput.style.position = 'fixed';
    dateInput.style.opacity = '0';
    document.body.appendChild(dateInput);
    dateInput.focus();
    dateInput.click();
    document.body.removeChild(dateInput);
  };

  return (
    <Box sx={{ width: '100%', px: 1 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Contract Information
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
        <TextField
          required
          id="title"
          name="title"
          label="Contract Title"
          fullWidth
          variant="outlined"
          value={data.title || ''}
          onChange={handleChange('title')}
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
        <TextField
          required
          id="location"
          name="location"
          label="Contract Location"
          fullWidth
          variant="outlined"
          value={data.location || ''}
          onChange={handleChange('location')}
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
      </Box>
        <TextField
          fullWidth
          label="Start Date"
          required
          value={displayDates.start_date}
          onChange={handleChange('start_date')}
          placeholder="mm/dd/yyyy"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => openDatePicker('start_date')} edge="end">
                  <CalendarTodayIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
        <TextField
          fullWidth
          label="End Date"
          required
          value={displayDates.end_date}
          onChange={handleChange('end_date')}
          placeholder="mm/dd/yyyy"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => openDatePicker('end_date')} edge="end">
                  <CalendarTodayIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
      </Box>
  );
};

export default ContractInfoForm;