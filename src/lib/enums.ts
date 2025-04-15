// Enum for Asphalt Type
export enum AsphaltType {
    SA1 = "SA-1",
    S475A = "S4.75A",
    SF95A = "SF9.5A",
    S95B = "S9.5B",
    S95C = "S9.5C",
    S95D = "S9.5D",
    S125C = "S12.5C",
    S125D = "S12.5D",
    I190B = "I19.0B",
    I190C = "I19.0C",
    I190D = "I19.0D",
    B250B = "B25.0B",
    B250C = "B25.0C"
  }
  
  // Enum for Change Order Status
  export enum ChangeOrderStatus {
    Draft = "draft",
    Pending = "pending",
    Approved = "approved",
    Rejected = "rejected"
  }
  
  // Enum for Contract Status
  export enum ContractStatus {
    Draft = "Draft",
    AwaitingAssignment = "Awaiting Assignment",
    Active = "Active",
    OnHold = "On Hold",
    FinalReview = "Final Review",
    Closed = "Closed"
  }
  
  // Enum for Existing Surface
  export enum ExistingSurface {
    NewAsphalt = "New Asphalt",
    OxidizedAsphalt = "Oxidized Asphalt",
    MilledAsphalt = "Milled Asphalt",
    Concrete = "Concrete",
    DirtSoil = "Dirt/Soil",
    Gravel = "Gravel"
  }
  
  // Enum for Organization Role
  export enum OrganizationRole {
    PrimeContractor = "Prime Contractor",
    Subcontractor = "Subcontractor"
  }
  
  // Enum for Patch Status
  export enum PatchStatus {
    Proposed = "Proposed",
    Marked = "Marked",
    Milled = "Milled",
    Patched = "Patched",
    Deleted = "Deleted"
  }
  
  // Enum for Road Side
  export enum RoadSide {
    Left = "Left",
    Right = "Right"
  }
  
  // Enum for Unit Measure Type
  export enum UnitMeasureType {
    Feet = "Feet (FT)",
    Inches = "Inches (IN)",
    LinearFeet = "Linear Feet (LF)",
    Mile = "Mile (MI)",
    ShoulderMile = "Shoulder Mile (SMI)",
    SquareFeet = "Square Feet (SF)",
    SquareYard = "Square Yard (SY)",
    Acre = "Acre (AC)",
    CubicFoot = "Cubic Foot (CF)",
    CubicYard = "Cubic Yard (CY)",
    Gallon = "Gallon (GAL)",
    Pounds = "Pounds (LBS)",
    Ton = "TON",
    Each = "Each (EA)",
    LumpSum = "Lump Sum (LS)",
    Hour = "Hour (HR)",
    Day = "DAY",
    Station = "Station (STA)",
    MSF = "MSF (1000SF)",
    MLF = "MLF (1000LF)",
    CubicFeetPerSecond = "Cubic Feet per Second (CFS)",
    PoundsPerSquareInch = "Pounds per Square Inch (PSI)",
    Percent = "Percent (%)",
    Degrees = "Degrees (*)"
  }
  
  // Enum for User Role
  export enum UserRole {
    Admin = "Admin",
    Contractor = "Contractor",
    Engineer = "Engineer",
    ProjectManager = "Project Manager",
    Inspector = "Inspector"
  }