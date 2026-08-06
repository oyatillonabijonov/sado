import { requireUser } from '@/panel/auth';
import { PageHeader } from '@/panel/ui';
import { PasswordForm } from './PasswordForm';

export const dynamic = 'force-dynamic';

/** Your own account. Payload's `/admin` used to be where this happened. */
export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Hisob" lead={user.email} />
      <PasswordForm />
    </div>
  );
}
