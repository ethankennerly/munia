'use client';

import { UserAboutSchema } from '@/lib/validations/userAbout';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { GetUser } from '@/types/definitions';
import { useTranslations } from 'next-intl';
import { useToast } from '../useToast';

/**
 * This hook is only used by the profile's profile/cover photo
 * and the profile's About page.
 */
export function useSessionUserDataMutation() {
  const t = useTranslations();
  const { data: session } = useSession();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const { showToast } = useToast();

  const updateSessionUserDataMutation = useMutation({
    mutationFn: async ({ data }: { data: UserAboutSchema }) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data }),
      });

      const response = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(response));
      return response as GetUser;
    },
    onSuccess: (updatedUser) => {
      // Update cache and invalidate to ensure fresh data everywhere
      qc.setQueryData<GetUser>(['users', userId], updatedUser);
      // Invalidate with refetch to ensure all components get fresh data
      qc.invalidateQueries({ queryKey: ['users', userId], refetchType: 'active' });

      showToast({
        type: 'success',
        title: t('hooks_mutations_success'),
        message: t('hooks_mutations_your_profile_information'),
      });
    },
  });

  const updateSessionUserPhotosMutation = useMutation({
    mutationFn: async ({ toUpdate, formData }: { toUpdate: 'profile' | 'cover'; formData: FormData }) => {
      const res = await fetch(`/api/users/${userId}/${toUpdate === 'profile' ? 'profile-photo' : 'cover-photo'}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const message = toUpdate === 'profile' ? t('error_updating_profile_photo') : t('error_updating_cover_photo');
        throw new Error(message);
      }

      const { uploadedTo } = (await res.json()) as { uploadedTo: string };
      return {
        // i18n-ally-ignore
        type: `${toUpdate}Photo`,
        uploadedTo,
      };
    },
    onSuccess: ({ type, uploadedTo }) => {
      qc.setQueryData<GetUser>(['users', userId], (oldUserData) => {
        if (!oldUserData) return oldUserData;
        return {
          ...oldUserData,
          [type]: uploadedTo,
        };
      });
    },
  });

  return { updateSessionUserDataMutation, updateSessionUserPhotosMutation };
}
