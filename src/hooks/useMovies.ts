import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemsApi } from '@/lib/api'

export function useMovies(params?: { type?: string; status?: string; q?: string }) {
  return useQuery({
    queryKey: ['items', params],
    queryFn: () => itemsApi.list(params),
  })
}

export function useMovie(id: string | undefined) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => itemsApi.get(id!),
    enabled: !!id,
  })
}

export function useCreateMovie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => itemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useUpdateMovie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) => itemsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useDeleteMovie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => itemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useUpdateStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => itemsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}
