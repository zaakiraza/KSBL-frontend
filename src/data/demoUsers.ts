export type DemoRole = 'teacher' | 'student';

export interface DemoUser {
  role: DemoRole;
  username: string;
  password: string;
}

export const demoUsers: DemoUser[] = [
  {
    role: 'teacher',
    username: 'teacher@lms.com',
    password: 'teacher123',
  },
  {
    role: 'student',
    username: 'student@lms.com',
    password: 'student123',
  },
];
