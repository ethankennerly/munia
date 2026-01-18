'use client';

import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Item } from 'react-stately';
import { AtSign, BuildingBusinessOffice, Bullhorn, Heart, Other, Phone, Profile, WorldNet } from '@/svg_components';
import { UserAboutSchema, userAboutSchema } from '@/lib/validations/userAbout';
import { parseDate } from '@internationalized/date';
import { extractDateOnly } from '@/lib/utils/dateOnly';
import { useSessionUserData } from '@/hooks/useSessionUserData';
import { useSessionUserDataMutation } from '@/hooks/mutations/useSessionUserDataMutation';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { logger } from '@/lib/logging';
import { useTranslations } from 'next-intl';
import { GenericLoading } from './GenericLoading';
import { DatePicker } from './ui/DatePicker';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import Button from './ui/Button';
import { TextInput } from './ui/TextInput';
import { DeleteAccountButton } from './DeleteAccountButton';

export function EditProfileForm({ redirectTo }: { redirectTo?: string }) {
  const t = useTranslations();
  const [userData] = useSessionUserData();

  const defaultValues = useMemo(() => {
    const values = {
      // `undefined` is not allowed as a `defaultValue` https://www.react-hook-form.com/api/usecontroller/controller/
      username: userData?.username || userData?.id || '',
      // email: userData?.email || '',
      name: userData?.name || '',
      phoneNumber: userData?.phoneNumber || null,
      bio: userData?.bio || null,
      website: userData?.website || null,
      address: userData?.address || null,
      gender: userData?.gender || null,
      relationshipStatus: userData?.relationshipStatus || null,
      birthDate: userData?.birthDate?.toString() || null,
    };

    return values;
  }, [userData]);

  const { control, handleSubmit, reset, setError, setFocus } = useForm<UserAboutSchema>({
    resolver: zodResolver(userAboutSchema),
    defaultValues,
  });
  const { updateSessionUserDataMutation } = useSessionUserDataMutation();
  const router = useRouter();

  // Reset form when userData loads or changes
  useEffect(() => {
    if (userData) {
      reset(defaultValues);
    }
  }, [userData, defaultValues, reset]);

  const onValid: SubmitHandler<UserAboutSchema> = (data) => {
    updateSessionUserDataMutation.mutate(
      { data },
      {
        onError: (error) => {
          const { field, message } = JSON.parse(error.message) as {
            field: keyof UserAboutSchema;
            message: string;
          };
          setError(field, { message });
          setFocus(field);
        },
        onSuccess: () => {
          // Force server-side re-render to get fresh data for Server Components
          router.refresh();
          // Navigate after refresh
          setTimeout(() => {
            router.push(redirectTo || `/${data.username}/about`);
          }, 100);
        },
      },
    );
  };
  const onInvalid: SubmitErrorHandler<UserAboutSchema> = (errors) => logger.error(errors);
  const resetForm = useCallback(() => {
    reset(defaultValues);
    router.push(redirectTo || `/${defaultValues.username}/about`);
  }, [reset, defaultValues, router, redirectTo]);

  if (!userData) return <GenericLoading>{t('components_loading_form')}</GenericLoading>;
  return (
    <div>
      <form onSubmit={handleSubmit(onValid, onInvalid)} className="flex flex-col gap-4">
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, ref, value }, fieldState: { error } }) => (
            <div>
              <TextInput
                label={t('username_0')}
                value={value}
                onChange={(v) => onChange(v)}
                errorMessage={error?.message}
                ref={ref}
                Icon={AtSign}
              />
            </div>
          )}
        />

        {/* <Controller
          control={control}
          name="email"
          render={({
            field: { onChange, ref, value },
            fieldState: { error },
          }) => (
            <div>
              <TextInput
                label="Email *"
                value={value}
                onChange={(value) => onChange(value)}
                errorMessage={error?.message}
                ref={ref}
                Icon={Mail}
              />
            </div>
          )}
        /> */}

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, ref, value }, fieldState: { error } }) => (
            <div>
              <TextInput
                label={t('name_0')}
                value={value}
                onChange={(v) => onChange(v)}
                errorMessage={error?.message}
                ref={ref}
                Icon={Profile}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, ref, value }, fieldState: { error } }) => (
            <div>
              <TextInput
                label={t('protected_username_tabs_phone_number')}
                value={value || ''}
                onChange={(v) => onChange(v || null)}
                errorMessage={error?.message}
                ref={ref}
                Icon={Phone}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, ref, value }, fieldState: { error } }) => (
            <div>
              <Textarea
                label={t('bio')}
                value={value || ''}
                onChange={(v) => onChange(v || null)}
                errorMessage={error?.message}
                ref={ref}
                Icon={Bullhorn}
              />
            </div>
          )}
        />
        <Controller
          control={control}
          name="website"
          render={({ field: { onChange, ref, value }, fieldState: { error } }) => (
            <div>
              <TextInput
                label={t('protected_username_tabs_website')}
                value={value || ''}
                onChange={(v) => onChange(v || null)}
                errorMessage={error?.message}
                ref={ref}
                Icon={WorldNet}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, ref, value }, fieldState: { error } }) => (
            <div>
              <TextInput
                label={t('protected_username_tabs_address')}
                value={value || ''}
                onChange={(v) => onChange(v || null)}
                errorMessage={error?.message}
                ref={ref}
                Icon={BuildingBusinessOffice}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, ref, value }, fieldState: { error } }) => (
            <div>
              <Select
                label={t('protected_username_tabs_gender')}
                name="gender"
                selectedKey={value || null}
                onSelectionChange={(key) => onChange(key || null)}
                errorMessage={error?.message}
                ref={ref}
                Icon={Other}>
                <Item key="MALE">{t('components_male')}</Item>
                <Item key="FEMALE">{t('components_female')}</Item>
                <Item key="NONBINARY">{t('components_nonbinary')}</Item>
              </Select>
            </div>
          )}
        />

        <Controller
          control={control}
          name="relationshipStatus"
          render={({ field: { onChange, ref, value }, fieldState: { error } }) => (
            <div>
              <Select
                label={t('protected_username_tabs_relationship_status')}
                name="relationshipStatus"
                selectedKey={value || null}
                onSelectionChange={(key) => onChange(key || null)}
                errorMessage={error?.message}
                Icon={Heart}
                ref={ref}>
                <Item key="SINGLE">{t('components_single')}</Item>
                <Item key="IN_A_RELATIONSHIP">{t('components_relationship')}</Item>
                <Item key="ENGAGED">{t('components_engaged')}</Item>
                <Item key="MARRIED">{t('components_married')}</Item>
              </Select>
            </div>
          )}
        />

        {/* This DatePicker is not controlled */}
        <Controller
          control={control}
          name="birthDate"
          render={({ field: { onChange, ref }, fieldState: { error } }) => {
            // Extract date part to avoid timezone conversion issues
            const getDateValue = () => {
              if (!userData.birthDate) return undefined;
              const dateOnly = extractDateOnly(userData.birthDate);
              return dateOnly ? parseDate(dateOnly) : undefined;
            };

            return (
              <div>
                <DatePicker
                  label={t('protected_username_tabs_birth_date')}
                  defaultValue={getDateValue()}
                  onChange={(value) => {
                    onChange(value?.toString() ?? null);
                  }}
                  errorMessage={error?.message}
                  triggerRef={ref}
                />
              </div>
            );
          }}
        />

        <div className="flex justify-end gap-4">
          <Button
            mode="secondary"
            type="button"
            loading={updateSessionUserDataMutation.isPending === true}
            onPress={resetForm}
            data-activate-id="reset-profile">
            {t('reset')}
          </Button>
          <Button
            type="submit"
            loading={updateSessionUserDataMutation.isPending === true}
            data-activate-id="submit-profile">
            {t('contexts_dialogscontext_submit')}
          </Button>
        </div>
        {userData?.id &&
          updateSessionUserDataMutation.isPending === false &&
          !updateSessionUserDataMutation.isSuccess && <DeleteAccountButton />}
      </form>
    </div>
  );
}
