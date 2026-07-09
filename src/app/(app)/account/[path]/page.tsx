import { AccountView } from "@neondatabase/auth-ui";
import { accountViewPaths } from "@neondatabase/auth-ui/server";

import { PageHeader } from "@/components/page-header";

// Prebuilt Neon Auth account views inside the workspace chrome — this is
// where the sidebar UserButton menu links. Teams/orgs/API keys don't apply
// to a single-person workspace, so only settings and security are exposed.
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { path: accountViewPaths.SETTINGS },
    { path: accountViewPaths.SECURITY },
  ];
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Account"
        description="Your sign-in details — profile, email, password, and sessions."
      />
      <div className="max-w-3xl p-6">
        <AccountView path={path} />
      </div>
    </div>
  );
}
