import { UserProfile, VisitLog } from "./types";
import { VISIT_REASONS } from "./config";

const SAMPLE_VISITORS: Omit<UserProfile, "id" | "isBlocked" | "blockReason" | "createdAt">[] = [
  { name: "Maria Santos", email: "msantos@neu.edu.ph", college: "College of Computer Studies", program: "BS Computer Science", role: "Student", picture: "" },
  { name: "Juan dela Cruz", email: "jdelacruz@neu.edu.ph", college: "College of Engineering", program: "BS Civil Engineering", role: "Student", picture: "" },
  { name: "Ana Reyes", email: "areyes@neu.edu.ph", college: "College of Business and Accountancy", program: "BS Accountancy", role: "Student", picture: "" },
  { name: "Carlos Garcia", email: "cgarcia@neu.edu.ph", college: "College of Computer Studies", program: "BS Information Technology", role: "Student", picture: "" },
  { name: "Patricia Lim", email: "plim@neu.edu.ph", college: "College of Nursing", program: "BS Nursing", role: "Student", picture: "" },
  { name: "Roberto Aquino", email: "raquino@neu.edu.ph", college: "College of Education", program: "Bachelor of Elementary Education", role: "Student", picture: "" },
  { name: "Sofia Mendoza", email: "smendoza@neu.edu.ph", college: "College of Arts and Sciences", program: "AB Communication", role: "Student", picture: "" },
  { name: "Miguel Torres", email: "mtorres@neu.edu.ph", college: "College of Engineering", program: "BS Electrical Engineering", role: "Student", picture: "" },
  { name: "Isabella Cruz", email: "icruz@neu.edu.ph", college: "College of Hospitality and Tourism Management", program: "BS Tourism Management", role: "Student", picture: "" },
  { name: "Gabriel Flores", email: "gflores@neu.edu.ph", college: "College of Computer Studies", program: "BS Computer Science", role: "Student", picture: "" },
  { name: "Andrea Villanueva", email: "avillanueva@neu.edu.ph", college: "College of Business and Accountancy", program: "BS Business Administration", role: "Student", picture: "" },
  { name: "Marco Ramos", email: "mramos@neu.edu.ph", college: "College of Criminology", program: "BS Criminology", role: "Student", picture: "" },
  { name: "Camille Bautista", email: "cbautista@neu.edu.ph", college: "College of Dentistry", program: "Doctor of Dental Medicine", role: "Student", picture: "" },
  { name: "Daniel Pascual", email: "dpascual@neu.edu.ph", college: "Senior High School", program: "STEM Strand", role: "Student", picture: "" },
  { name: "Rachel Navarro", email: "rnavarro@neu.edu.ph", college: "Graduate School", program: "Master in Business Administration", role: "Student", picture: "" },

  { name: "Dr. Pedro Gonzales", email: "pgonzales@neu.edu.ph", college: "College of Computer Studies", program: "Professor - Computer Science", role: "Faculty", picture: "" },
  { name: "Prof. Elena Dimaculangan", email: "edimaculangan@neu.edu.ph", college: "College of Education", program: "Professor - Education", role: "Faculty", picture: "" },
  { name: "Dr. Ricardo Manalo", email: "rmanalo@neu.edu.ph", college: "College of Engineering", program: "Professor - Engineering", role: "Faculty", picture: "" },
  { name: "Prof. Carmen Soriano", email: "csoriano@neu.edu.ph", college: "College of Business and Accountancy", program: "Professor - Accountancy", role: "Faculty", picture: "" },

  { name: "Rosa Martinez", email: "rmartinez@neu.edu.ph", college: "Administration", program: "Library Staff", role: "Staff", picture: "" },
  { name: "Eduardo Tan", email: "etan@neu.edu.ph", college: "Administration", program: "IT Department", role: "Employee", picture: "" },
  { name: "Lourdes Fernandez", email: "lfernandez@neu.edu.ph", college: "Administration", program: "Registrar Office", role: "Employee", picture: "" },
];

function randomItem<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function randomDate(daysBack: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const timestamp = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  const d = new Date(timestamp);

  d.setHours(7 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

export function seedDataIfNeeded(): void {
  if (localStorage.getItem("neu_data_seeded")) return;

  const profiles: Record<string, UserProfile> = {};
  SAMPLE_VISITORS.forEach((v) => {
    profiles[v.email] = {
      ...v,
      id: randomId(),
      isBlocked: false,
      blockReason: "",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
  localStorage.setItem("neu_profiles", JSON.stringify(profiles));

  const logs: VisitLog[] = [];
  const usableReasons = VISIT_REASONS.filter((r) => r !== "Other");

  for (let i = 0; i < 150; i++) {
    const visitor = randomItem(SAMPLE_VISITORS);
    const date = randomDate(30);
    logs.push({
      id: randomId(),
      visitorId: profiles[visitor.email].id,
      visitorName: visitor.name,
      visitorEmail: visitor.email,
      college: visitor.college,
      program: visitor.program,
      visitorRole: visitor.role,
      reason: randomItem(usableReasons),
      timestamp: date.toISOString(),
    });
  }

  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  localStorage.setItem("neu_visit_logs", JSON.stringify(logs));
  localStorage.setItem("neu_data_seeded", "true");
}
