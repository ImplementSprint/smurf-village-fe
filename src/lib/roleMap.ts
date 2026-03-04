export function roleToPath(roleName?: string) {
  switch (roleName) {
    case "System Admin":
      return "/system-admin";
    case "Admin":
      return "/admin";
    case "HR Manager":
    case "HR Recruiter":
    case "HR Interviewer":
      return "/hr";
    case "Active Employee":
      return "/employee";
    case "Applicant":
      return "/applicant";
    default:
      return "/login";
  }
}