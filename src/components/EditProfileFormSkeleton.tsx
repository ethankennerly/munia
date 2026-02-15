/**
 * Shimmer skeleton for the EditProfileForm.
 * Sized to match the form: 9 fields (TextInput/Textarea/Select/DatePicker each ~h-12
 * with label ~h-5 + gap-4) + 2 action buttons at bottom.
 * Each field group: label(h-5) + input(h-12) + gap-4 ≈ 68px.
 */

function FieldSkeleton({ labelWidth = 'w-20', inputHeight = 'h-12' }: { labelWidth?: string; inputHeight?: string }) {
  return (
    <div className="space-y-1">
      <div className={`animate-shimmer h-5 ${labelWidth} rounded`} />
      <div className={`animate-shimmer ${inputHeight} w-full rounded-lg`} />
    </div>
  );
}

export function EditProfileFormSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true" aria-busy="true">
      {/* Username */}
      <FieldSkeleton labelWidth="w-24" />
      {/* Name */}
      <FieldSkeleton labelWidth="w-16" />
      {/* Phone Number */}
      <FieldSkeleton labelWidth="w-32" />
      {/* Bio (textarea is taller) */}
      <FieldSkeleton labelWidth="w-12" inputHeight="h-24" />
      {/* Website */}
      <FieldSkeleton labelWidth="w-20" />
      {/* Address */}
      <FieldSkeleton labelWidth="w-20" />
      {/* Gender (select) */}
      <FieldSkeleton labelWidth="w-16" />
      {/* Relationship Status (select) */}
      <FieldSkeleton labelWidth="w-40" />
      {/* Birth Date */}
      <FieldSkeleton labelWidth="w-24" />

      {/* Action buttons: Reset + Submit */}
      <div className="flex justify-end gap-4">
        <div className="animate-shimmer h-10 w-20 rounded-lg" />
        <div className="animate-shimmer h-10 w-20 rounded-lg" />
      </div>
    </div>
  );
}
