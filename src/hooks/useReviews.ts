import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '@/lib/api'

export function useReviews(params?: { archived?: number }) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => reviewsApi.list(params),
  })
}

export function useItemReviews(itemId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', 'item', itemId],
    queryFn: () => reviewsApi.forItem(itemId!),
    enabled: !!itemId,
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, ...data }: any) => reviewsApi.create(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) => reviewsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export function useToggleArchive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reviewsApi.toggleArchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export function useBatchArchive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => reviewsApi.batchArchive(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export function useBatchRestore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => reviewsApi.batchRestore(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
