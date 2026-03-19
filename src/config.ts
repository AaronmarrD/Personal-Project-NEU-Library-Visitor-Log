// =============================================================================
// GOOGLE OAUTH CLIENT ID
// =============================================================================
// To set up Google Sign-In:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project (or select an existing one)
// 3. Go to "APIs & Services" → "Credentials"
// 4. Click "Create Credentials" → "OAuth client ID"
// 5. Application type: "Web application"
// 6. Add your deployed URL to "Authorized JavaScript origins"
//    (e.g., https://your-app.vercel.app AND http://localhost:5173 for dev)
// 7. Copy the Client ID below
// =============================================================================
export const GOOGLE_CLIENT_ID = "329328638777-akbrs0ugkboi00bol7u1mndhu5ppleg7.apps.googleusercontent.com";

// =============================================================================
// ADMIN EMAILS — these users can switch between Regular User and Admin roles
// =============================================================================
export const ADMIN_EMAILS: string[] = [
  "jcesperanza@neu.edu.ph",
  "aaronmar.dionisio@neu.edu.ph",
];

// =============================================================================
// NEU COLLEGES
// =============================================================================
export const COLLEGES = [
  "College of Arts and Sciences",
  "College of Business and Accountancy",
  "College of Computer Studies",
  "College of Criminology",
  "College of Education",
  "College of Engineering",
  "College of Hospitality and Tourism Management",
  "College of Nursing",
  "College of Dentistry",
  "Graduate School",
  "Senior High School",
  "Administration",
] as const;

// =============================================================================
// VISIT REASONS
// =============================================================================
export const VISIT_REASONS = [
  "Reading",
  "Researching",
  "Use of Computer",
  "Meeting",
  "Studying",
  "Group Discussion",
  "Printing / Photocopying",
  "Other",
] as const;

// =============================================================================
// VISITOR ROLES
// =============================================================================
export const VISITOR_ROLES = ["Student", "Faculty", "Staff", "Employee"] as const;
