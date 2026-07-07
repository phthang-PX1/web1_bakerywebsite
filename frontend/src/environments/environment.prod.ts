/**
 * Production environment configuration.
 * In production builds, angular.json replaces environment.ts with this file via fileReplacements.
 * Ensure apiUrl points to the production backend server (e.g., https://api.webee.vn/api or /api if reverse proxied).
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.webee.vn/api' // Replace with actual production API domain upon deployment
};
