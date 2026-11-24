/** API calls for the overview, official statistics, community reports and admin moderation. */
import { request, toQuery } from './apiClient';

export const getOverview = (opts) => request('/overview', opts);
export const getOfficialSummary = (filters, opts) => request(`/official/summary${toQuery(filters)}`, opts);

export const listCommunityReports = (filters, opts) => request(`/community-reports${toQuery(filters)}`, opts);
export const submitCommunityReport = (body) => request('/community-reports', { method: 'POST', body });

export const authSignup = (body) => request('/auth/signup', { method: 'POST', body });
export const authLogin = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } });
export const authMe = (token, opts) => request('/auth/me', { token, ...opts });

export const adminListReports = (status, token, opts) => request(`/admin/reports${toQuery({ status })}`, { token, ...opts });
export const adminModerate = (id, status, note, token) => request(`/admin/reports/${id}`, { method: 'PATCH', body: { status, note }, token });
export const adminListUsers = (token, opts) => request('/admin/users', { token, ...opts });
export const adminSetRole = (id, role, token) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: { role }, token });
