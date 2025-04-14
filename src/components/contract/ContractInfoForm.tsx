import React, { useState, useEffect } from 'react'; // Import React and hooks
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  IconButton
} from '@mui/material'; // Importing necessary components from Material-UI
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Import calendar icon

/**
 * ContractInfoForm component for managing contract-related information.
 * 
 * This component allows users to enter and manage details related to a 
 * contract, including the title, location, start date, end date, budget, 
 * and description. It provides input fields for each attribute and 
 * triggers an onChange callback to update the parent component when any 
 * changes are made. The start and end date fields allow users to select 
 * dates through an integrated date picker.
 */
type ContractInfoFormProps = {
  data: {
    title: string; // Title of the contract
    location: string; // Location of the contract
    start_date: string; // Start date of the contract
    end_date: string; // End date of the contract
    status: string; // Status of the contract
    budget: number; // Budget of the contract
    description: string; // Description of the contract
    created_by: string; // User who created the contract
  };
  onChange: (updatedData: Partial<ContractInfoFormProps['data']>) => void; // Callback to handle changes
};

// ContractInfoForm component for managing contract information
const ContractInfoForm: React.FC<ContractInfoFormProps> = ({ data, onChange }) => {
  // State to manage formatted display of dates
  const [displayDates, setDisplayDates] = useState({
    start_date: formatDateForDisplay(data.start_date), // Format start date for display
    end_date: formatDateForDisplay(data.end_date) // Format end date for display
  });

  // Effect to update displayed dates when data changes
  useEffect(() => {
    setDisplayDates({
      start_date: formatDateForDisplay(data.start_date),
      end_date: formatDateForDisplay(data.end_date)
    });
  }, [data.start_date, data.end_date]);

  // Function to format date for user-friendly display
  function formatDateForDisplay(date: string | null | undefined): string {
    if (!date) return ''; // Return empty string if date is not provided
    const dateObj = new Date(date); // Create a Date object from the string
    if (isNaN(dateObj.getTime())) return ''; // Return empty if date is invalid
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Get month
    const day = String(dateObj.getDate()).padStart(2, '0'); // Get day
    const year = String(dateObj.getFullYear()); // Get year
    return `${month}/${day}/${year}`; // Format date as mm/dd/yyyy
  }

  // Handle changes in input fields
  const handleChange = (field: keyof ContractInfoFormProps['data']) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newDisplayValue = event.target.value; // Capture new value from input
      setDisplayDates((prev) => ({
        ...prev,
        [field]: newDisplayValue, // Update displayed date
      }));
  
      const isoDate = new Date(newDisplayValue); // Create Date object for ISO compliance
      const isValidDate = !isNaN(isoDate.getTime()); // Check if date is valid
  
      onChange({
        ...data,
        [field]: isValidDate // Update field value only if date is valid
          ? isoDate.toISOString().split('T')[0]
          : newDisplayValue,
      });
    };

  // Function to open date picker
  const openDatePicker = (dateField: keyof ContractInfoFormProps['data']): void => {
    const dateInput = document.createElement('input'); // Create a temporary input element
    dateInput.type = 'date'; // Set input type to date
    if (data[dateField]) {
      dateInput.value = new Date(data[dateField]).toISOString().split('T')[0]; // Populate with current date value
    }
    dateInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const selectedDate = target.value; // Grab the selected date
      onChange({ ...data, [dateField]: selectedDate }); // Call onChange with updated data
      setDisplayDates(prev => ({
        ...prev,
        [dateField]: formatDateForDisplay(selectedDate) // Update displayed date
      }));
    });
    dateInput.style.position = 'fixed'; // Set input style to fixed
    dateInput.style.opacity = '0'; // Make input invisible
    document.body.appendChild(dateInput); // Append input to the body
    dateInput.focus(); // Focus the input
    dateInput.click(); // Trigger click to open date picker
    document.body.removeChild(dateInput); // Remove input from DOM after use
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
          label="Contract Title" // Title field for the contract
          fullWidth
          variant="outlined"
          value={data.title || ''} // Display current title
          onChange={handleChange('title')} // Update title on change
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
        <TextField
          required
          id="location"
          name="location"
          label="Contract Location" // Location field for the contract
          fullWidth
          variant="outlined"
          value={data.location || ''} // Display current location
          onChange={handleChange('location')} // Update location on change
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
      </Box>
      {/* Start Date Input */}
      <TextField
        fullWidth
        label="Start Date" // Start date field
        required
        value={displayDates.start_date} // Display formatted start date
        onChange={handleChange('start_date')} // Update start date on change
        placeholder="mm/dd/yyyy" // Placeholder for date input
        InputProps={{
          endAdornment: (
            <InputAdornment position="end"> // Icon Button to open date picker
              <IconButton onClick={() => openDatePicker('start_date')} edge="end">
                <CalendarTodayIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
      />
      {/* End Date Input */}
      <TextField
        fullWidth
        label="End Date" // End date field
        required
        value={displayDates.end_date} // Display formatted end date
        onChange={handleChange('end_date')} // Update end date on change
        placeholder="mm/dd/yyyy" // Placeholder for date input
        InputProps={{
          endAdornment: (
            <InputAdornment position="end"> // Icon Button to open date picker
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

export default ContractInfoForm; // Exporting ContractInfoForm component