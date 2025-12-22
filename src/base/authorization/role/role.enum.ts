export enum Role {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Manager = 'Manager',
  Teacher = 'Teacher',
  Student = 'Student',
}

export const RoleGroup = {
  ...Role,
  Admins: [Role.SuperAdmin, Role.Admin],
  Teacher: [Role.Teacher],
  Student: [Role.Student],
};