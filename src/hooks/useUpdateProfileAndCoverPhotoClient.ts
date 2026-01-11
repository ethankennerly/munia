'use client';

import { useSession } from 'next-auth/react';
import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useDialogs } from './useDialogs';
import { useToast } from './useToast';
import { useSessionUserDataMutation } from './mutations/useSessionUserDataMutation';

export function useUpdateProfileAndCoverPhotoClient(toUpdate: 'profile' | 'cover') {
  const t = useTranslations();
  const { data: session } = useSession();
  const userId = session?.user.id;
  const { updateSessionUserPhotosMutation } = useSessionUserDataMutation();
  const { alert } = useDialogs();
  const { showToast } = useToast();
  const inputFileRef = useRef<HTMLInputElement>(null);

  const openInput = () => {
    if (inputFileRef.current == null) return;
    inputFileRef.current.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const formData = new FormData();

    if (files === null) return;
    const file = files[0];

    formData.append(name, file, file.name);

    if (!userId) return;
    updateSessionUserPhotosMutation.mutate(
      {
        toUpdate,
        formData,
      },
      {
        onSuccess: () => {
          showToast({
            title: t('hooks_mutations_success'),
            message:
              toUpdate === 'profile'
                ? t('your_profile_photo_has_been_updated')
                : t('your_cover_photo_has_been_updated'),
            type: 'success',
          });
        },
        onError: () => {
          alert({
            title: t('components_something_went_wrong'),
            message: toUpdate === 'profile' ? t('error_updating_profile_photo') : t('error_updating_cover_photo'),
          });
        },
      },
    );

    if (inputFileRef.current === null) return;
    inputFileRef.current.value = '';
  };

  return {
    inputFileRef,
    openInput,
    handleChange,
    isPending: updateSessionUserPhotosMutation.isPending,
  };
}
