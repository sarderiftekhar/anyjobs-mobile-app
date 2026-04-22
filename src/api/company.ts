import apiClient from "./client";
import type { ApiResponse } from "../types/api";
import type {
  Company,
  CompanyAddress,
  CompanyGalleryImage,
  CompanyPrivacySettings,
  UpdateCompanyPayload,
} from "../types/company";

// NOTE on backend coverage (as of this writing):
// - GET/PUT /v1/mobile/employer/company — confirmed in routes/api.php
// - POST /v1/mobile/employer/company/logo — confirmed (multipart)
// All other endpoints below mirror the web-only routes defined in
// routes/employer.php under `employer.profile.*`. Until mobile-specific
// endpoints are added, the mobile app assumes the backend will expose
// equivalents under /v1/mobile/employer/company/* with the same payloads.
// If those don't exist yet, calls will 404 and should be wired up backend-side.

export const companyApi = {
  get: () => apiClient.get<ApiResponse<Company>>("/employer/company"),

  // Overall profile update (name, tagline, description, size, industry, website, founded_year)
  update: (data: UpdateCompanyPayload) =>
    apiClient.put<ApiResponse<Company>>("/employer/company", data),

  // Logo & banner (multipart/form-data)
  uploadLogo: (formData: FormData) =>
    apiClient.post<ApiResponse<{ logo_url: string }>>(
      "/employer/company/logo",
      formData,
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 60_000 }
    ),

  uploadBanner: (formData: FormData) =>
    apiClient.post<ApiResponse<{ banner_url: string }>>(
      "/employer/company/banner",
      formData,
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 60_000 }
    ),

  // Gallery
  getGallery: () =>
    apiClient.get<ApiResponse<CompanyGalleryImage[]>>(
      "/employer/company/gallery"
    ),

  uploadGalleryImage: (formData: FormData) =>
    apiClient.post<ApiResponse<CompanyGalleryImage>>(
      "/employer/company/gallery",
      formData,
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 60_000 }
    ),

  deleteGalleryImage: (id: number | string) =>
    apiClient.delete<ApiResponse>(`/employer/company/gallery/${id}`),

  reorderGallery: (orderedIds: (number | string)[]) =>
    apiClient.put<ApiResponse>("/employer/company/gallery/reorder", {
      order: orderedIds,
    }),

  // Address
  updateAddress: (data: CompanyAddress) =>
    apiClient.post<ApiResponse<Company>>(
      "/employer/company/update-address",
      data
    ),

  // Values & benefits
  updateValues: (values: string[]) =>
    apiClient.put<ApiResponse<Company>>("/employer/company/values", { values }),

  updateBenefits: (benefits: string[]) =>
    apiClient.put<ApiResponse<Company>>("/employer/company/benefits", {
      benefits,
    }),

  // Privacy toggles
  updatePrivacy: (data: CompanyPrivacySettings) =>
    apiClient.put<ApiResponse<CompanyPrivacySettings>>(
      "/employer/company/privacy",
      data
    ),
};
