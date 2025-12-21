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
import { capitalize, lowerCase } from 'lodash';
import { GetUser } from '@/types/definitions';
import { AboutItem } from './AboutItem';

export function About({ profile }: { profile: GetUser }) {
  const { username, email, name, birthDate, gender, relationshipStatus, phoneNumber, bio, website, address } = profile;

  // eslint-disable-next-line no-console
  console.log('[About] rendering', {
    username,
    birthDate,
    birthDateType: typeof birthDate,
    birthDateValue: birthDate,
    formatted:
      birthDate !== null
        ? (() => {
            const dateStr = typeof birthDate === 'string' ? birthDate : birthDate.toISOString();
            const dateOnly = dateStr.split('T')[0];
            const [year, month, day] = dateOnly.split('-').map(Number);
            const localDate = new Date(year, month - 1, day);
            return format(localDate, 'MMMM d, yyyy');
          })()
        : null,
  });

  return (
    <div className="flex flex-col gap-4">
      <AboutItem field="Username" value={username} Icon={AtSign} />
      <AboutItem field="Email" value={email} Icon={Mail} />
      <AboutItem field="Name" value={name} Icon={Profile} />
      <AboutItem
        field="Birth Date"
        value={
          birthDate !== null
            ? (() => {
                // Parse date string to avoid timezone conversion issues
                // If it's an ISO string like "1976-04-05T00:00:00.000Z", extract just the date part
                const dateStr = typeof birthDate === 'string' ? birthDate : birthDate.toISOString();
                const dateOnly = dateStr.split('T')[0]; // Extract "1976-04-05"
                const [year, month, day] = dateOnly.split('-').map(Number);
                // Create date in local timezone to avoid UTC conversion
                const localDate = new Date(year, month - 1, day);
                return format(localDate, 'MMMM d, yyyy');
              })()
            : null
        }
        Icon={Calendar}
      />
      <AboutItem field="Gender" value={gender && capitalize(gender)} Icon={Other} />
      <AboutItem
        field="Relationship Status"
        value={relationshipStatus && capitalize(lowerCase(relationshipStatus))}
        Icon={Heart}
      />
      <AboutItem field="Bio" value={bio} Icon={Bullhorn} />
      <AboutItem field="Phone Number" value={phoneNumber} Icon={Phone} />
      <AboutItem field="Website" value={website} Icon={WorldNet} />
      <AboutItem field="Address" value={address} Icon={BuildingBusinessOffice} />
    </div>
  );
}
