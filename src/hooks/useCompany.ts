import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyApi } from "../api/company";
import type {
  CompanyAddress,
  CompanyPrivacySettings,
  UpdateCompanyPayload,
} from "../types/company";

const KEY = ["employer", "company"] as const;
const GALLERY_KEY = ["employer", "company", "gallery"] as const;

export function useCompany() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => companyApi.get().then((r) => r.data.data!),
  });
}

function useInvalidateCompany() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: GALLERY_KEY });
  };
}

export function useUpdateCompany() {
  const invalidate = useInvalidateCompany();
  return useMutation({
    mutationFn: (data: UpdateCompanyPayload) => companyApi.update(data),
    onSuccess: invalidate,
  });
}

export function useUploadLogo() {
  const invalidate = useInvalidateCompany();
  return useMutation({
    mutationFn: (formData: FormData) => companyApi.uploadLogo(formData),
    onSuccess: invalidate,
  });
}

export function useUploadBanner() {
  const invalidate = useInvalidateCompany();
  return useMutation({
    mutationFn: (formData: FormData) => companyApi.uploadBanner(formData),
    onSuccess: invalidate,
  });
}

export function useCompanyGallery() {
  return useQuery({
    queryKey: GALLERY_KEY,
    queryFn: () => companyApi.getGallery().then((r) => r.data.data ?? []),
  });
}

export function useUploadGalleryImage() {
  const invalidate = useInvalidateCompany();
  return useMutation({
    mutationFn: (formData: FormData) => companyApi.uploadGalleryImage(formData),
    onSuccess: invalidate,
  });
}

export function useDeleteGalleryImage() {
  const invalidate = useInvalidateCompany();
  return useMutation({
    mutationFn: (id: number | string) => companyApi.deleteGalleryImage(id),
    onSuccess: invalidate,
  });
}

export function useReorderGallery() {
  const invalidate = useInvalidateCompany();
  return useMutation({
    mutationFn: (orderedIds: (number | string)[]) =>
      companyApi.reorderGallery(orderedIds),
    onSuccess: invalidate,
  });
}

export function useUpdateAddress() {
  const invalidate = useInvalidateCompany();
  return useMutation({
    mutationFn: (data: CompanyAddress) => companyApi.updateAddress(data),
    onSuccess: invalidate,
  });
}

export function useUpdateValues() {
  const invalidate = useInvalidateCompany();
  return useMutation({
    mutationFn: (values: string[]) => companyApi.updateValues(values),
    onSuccess: invalidate,
  });
}

export function useUpdateBenefits() {
  const invalidate = useInvalidateCompany();
  return useMutation({
    mutationFn: (benefits: string[]) => companyApi.updateBenefits(benefits),
    onSuccess: invalidate,
  });
}

export function useUpdatePrivacy() {
  const invalidate = useInvalidateCompany();
  return useMutation({
    mutationFn: (data: CompanyPrivacySettings) => companyApi.updatePrivacy(data),
    onSuccess: invalidate,
  });
}
