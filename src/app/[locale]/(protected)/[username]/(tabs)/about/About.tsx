'use client';

import {
  AtSign,
  BuildingBusinessOffice,
  Bullhorn,
  Calendar,
  Heart,
  Mail,
  Other,
  Phone,
  Profile,
  WorldNet,
} from '@/svg_components';
import { format } from 'date-fns';
import { GetUser } from '@/types/definitions';
import { parseDateOnly } from '@/lib/utils/dateOnly';
import { useTranslations } from 'next-intl';
import { useLocalizedEnums } from '@/hooks/useLocalizedEnums';
import { AboutItem } from './AboutItem';

export function About({ profile }: { profile: GetUser }) {
  const t = useTranslations();
  const { username, email, name, birthDate, gender, relationshipStatus, phoneNumber, bio, website, address } = profile;

  const { getGenderLabel, getRelationshipLabel } = useLocalizedEnums();
  const genderText = getGenderLabel(gender);
  const relationshipStatusText = getRelationshipLabel(relationshipStatus);

  return (
    <div className="flex flex-col gap-4">
      <AboutItem field={t('username')} value={username} Icon={AtSign} />
      <AboutItem field={t('email_0')} value={email} Icon={Mail} />
      <AboutItem field={t('name')} value={name} Icon={Profile} />
      <AboutItem
        field={t('birth_date')}
        value={
          birthDate !== null
            ? (() => {
                const localDate = parseDateOnly(birthDate);
                return localDate ? format(localDate, t('mmmm_d_yyyy')) : null;
              })()
            : null
        }
        Icon={Calendar}
      />
      <AboutItem field={t('gender')} value={genderText} Icon={Other} />
      <AboutItem field={t('relationship_status')} value={relationshipStatusText} Icon={Heart} />
      <AboutItem field={t('bio')} value={bio} Icon={Bullhorn} />
      <AboutItem field={t('phone_number')} value={phoneNumber} Icon={Phone} />
      <AboutItem field={t('website')} value={website} Icon={WorldNet} />
      <AboutItem field={t('address')} value={address} Icon={BuildingBusinessOffice} />
    </div>
  );
}
