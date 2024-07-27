import bcrypt from 'bcryptjs';



export const hasPassword = (body: any): body is { password: string } => {
  return 'password' in body;
};

// export function excludePassword(rows: T[]) {
export function excludePassword(rows: any[]) {
  return rows.map(({ password, ...rest }) => rest);
}
