Macadamy.io Construction Project Tracker
Macadamy.io is a real-time construction progress tracking platform tailored for transportation infrastructure projects. It enables contractors and engineers to manage quantities, track daily progress, and ensure compliance with government contracts by organizing data by contract, WBS, map, and line code.

Table of Contents
Pages and Components Overview
Installation
Usage
License
Pages and Components Overview:

1. CalculatorCreation.tsx
Functionality: Enables users to create calculator templates by defining variables and formulas related to project calculations.

Usage: Used whenever customized calculators for line items are needed.

Conclusion: Critical Part for specific calculations and estimations in projects.


2. Calculators.tsx

Functionality: Displays a list of calculator templates associated with a contract. Users can create new calculators and view existing ones.

Usage: Provides an overview of calculator templates for easy management.

Conclusion: Critical Part for user interactions with project calculators.


3. ContractCreation.tsx

Functionality: Facilitates the creation of new contracts, allowing users to input necessary information such as title, description, and budget.

Usage: Used when establishing new contracts within the system.

Conclusion: Critical Part for contract management.


4. ContractSettings.tsx

Functionality: Manages and allows for the editing of details for existing contracts, including WBS sections and line items.

Usage: Provides an interface for users to view and adjust contract-specific data.

Conclusion: Critical Part for maintaining contract details.


5. DailyReports.tsx

Functionality: Allows users to create and manage daily work logs, documenting work performed, weather conditions, and incidents.

Usage: Essential for tracking daily activities and reporting relevant project information.

Conclusion: Critical Part for real-time tracking of project status.


6. Dashboard.tsx

Functionality: Displays key metrics and an overview of active contracts and issues.

Usage: Serves as the main landing page for users to access project summaries.

Conclusion: Critical Part for providing an immediate overview of project health.


7. EquipmentLog.tsx

Functionality: Manages and tracks the usage of equipment related to line items, logging details about type and usage time.

Usage: Important for accountability in equipment usage on-site.

Conclusion: Critical Part for tracking resources efficiently on projects.


8. Inspections.tsx

Functionality: Manages inspection reports for contracts, enabling users to create and view findings during inspections.

Usage: Ensures compliance with safety and quality standards.

Conclusion: Critical Part for maintaining project safety and regulations.


9. Issues.tsx

Functionality: Tracks project issues, allowing users to record and manage the status of various problems.

Usage: Offers a systematic approach to issue management.

Conclusion: Critical Part for proactive project problem resolution.


10. LaborRecords.tsx

Functionality: Tracks labor-related records including types of work performed, hours worked, and number of workers.

Usage: Used for managing labor resources and efficiency tracking.

Conclusion: Critical Part for labor cost management.


11. LandingPage.tsx

Functionality: Acts as the entry point for users, providing an overview of the platform's capabilities and login options.

Usage: Provides access to user authentication features.

Conclusion: Critical Part for user engagement at the start.


12. ResetPassword.tsx

Functionality: Allows users to reset their password, with validation for matching and length requirements.

Usage: Facilitates the user access recovery process.

Conclusion: Important but could be integrated into modal functionalities elsewhere in the application.


13. ProfileImageUpload.tsx

Functionality: Handles the upload and cropping of the user's profile image.

Usage: Allows profile picture management.

Conclusion: Redundant if similar functionality exists in modals.


14. ProtectedRoute.tsx

Functionality: Guards access to specific routes, ensuring only authenticated users can view them.

Usage: Used in route configurations to protect sensitive pages.

Conclusion: Critical Part to enforce user authentication.


15. OrganizationSelect.tsx

Functionality: Facilitates a dropdown list for selecting organizations from a pre-set list.

Usage: Important for forms related to user onboarding and profile management.

Conclusion: Critical Part for managing organizational data.


16. Navbar.tsx

Functionality: Provides navigation links and a sign-out button for authenticated users.

Usage: Essential for navigating between core areas of the application.

Conclusion: Critical Part for user navigation and orientation within the app.


17. Modal.tsx

Functionality: A reusable modal component for displaying content, alerts, forms, etc.

Usage: Used across various pages for interactions, including profile updates and confirmations.

Conclusion: Critical Part for enhancing user interactions.


18. Select.tsx

Functionality: Custom select input for choosing options from a dropdown menu.

Usage: Used in forms where users need to select predefined options.

Conclusion: Useful but can be redundant if other select components fulfill similar roles.


19. UserOnboarding.tsx

Functionality: Facilitates the onboarding process for new users, collecting their information and preferences.

Usage: Essential for setting up new user accounts properly.

Conclusion: Critical Part to ensure a smooth onboarding experience.