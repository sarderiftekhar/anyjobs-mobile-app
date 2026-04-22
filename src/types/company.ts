export interface CompanyGalleryImage {
  id: number | string;
  url: string;
  caption?: string;
  order?: number;
}

export interface CompanyAddress {
  street?: string;
  address_line_1?: string;
  address_line_2?: string;
  postal_code?: string;
  city?: string;
  city_id?: number;
  state?: string;
  state_id?: number;
  country?: string;
  country_id?: number;
}

export interface CompanyPrivacySettings {
  hide_from_public?: boolean;
  show_salary?: boolean;
  show_employee_count?: boolean;
  allow_reviews?: boolean;
  allow_follows?: boolean;
}

export interface Company {
  id: number;
  name: string;
  tagline?: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  founded_year?: number;

  logo_url?: string;
  banner_url?: string;
  gallery?: CompanyGalleryImage[];

  location?: string;
  address?: CompanyAddress;

  values?: string[];
  benefits?: string[];
  privacy?: CompanyPrivacySettings;
}

export interface UpdateCompanyPayload {
  name?: string;
  tagline?: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  founded_year?: number;
}
