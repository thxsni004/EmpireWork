// Sidebar menus for each role. Icons are Bootstrap Icons class names.

export const adminLinks = [
  { label: 'Dashboard', to: '/staff/admin', icon: 'bi-speedometer2', end: true },
  { label: 'Enquiries', to: '/staff/admin/enquiries', icon: 'bi-inbox' },
  { label: 'Events', to: '/staff/admin/events', icon: 'bi-calendar-event' },
  { label: 'Gallery', to: '/staff/admin/gallery', icon: 'bi-images' },
  { label: 'Staff', to: '/staff/admin/staff', icon: 'bi-people' },
];

export const accountantLinks = [
  { label: 'Dashboard', to: '/staff/accountant', icon: 'bi-speedometer2', end: true },
  { label: 'Payments', to: '/staff/accountant/payments', icon: 'bi-cash-coin' },
  { label: 'Expenses', to: '/staff/accountant/expenses', icon: 'bi-receipt' },
  { label: 'Reports', to: '/staff/accountant/reports', icon: 'bi-bar-chart' },
];

// Where each role lands after logging in
export const roleHome = {
  admin: '/staff/admin',
  accountant: '/staff/accountant',
};
