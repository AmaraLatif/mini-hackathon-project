/** API calls for the overview, official statistics, community reports and admin moderation. */
import { request, toQuery } from './apiClient';

export const getOverview = (opts) => request('/overview', opts);
export const getOfficialSummary = (filters, opts) => request(`/official/summary${toQuery(filters)}`, opts);

export const listCommunityReports = (filters, opts) => request(`/community-reports${toQuery(filters)}`, opts);
export const submitCommunityReport = (body) => request('/community-reports', { method: 'POST', body });

export const adminLogin = (password) => request('/admin/login', { method: 'POST', body: { password } });
export const adminListReports = (status, token, opts) => request(`/admin/reports${toQuery({ status })}`, { token, ...opts });
export const adminModerate = (id, status, note, token) => request(`/admin/reports/${id}`, { method: 'PATCH', body: { status, note }, token });
