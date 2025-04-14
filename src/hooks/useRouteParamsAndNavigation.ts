import { useParams, useNavigate } from 'react-router-dom'; // Import hooks from React Router for routing functionality

// Custom hook to access route parameters and navigation functions
const useRouteParamsAndNavigation = () => {
    const params = useParams(); // Get route parameters from the current URL
    const navigate = useNavigate(); // Get the navigate function for programmatic navigation

    return { params, navigate }; // Return parameters and navigate function
};

export default useRouteParamsAndNavigation; // Export the custom hook