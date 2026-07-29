import { logoutAction } from "@/app/(protected)/actions";
import {
  createAccountAction,
  updateNameAction,
  updatePasswordAction,
} from "@/app/(protected)/setting/actions";
import { SettingsView } from "@/components/settings/settings-view";
import { requireCssdAccess } from "@/lib/auth/guards";

export default async function CssdSettingPage() {
  const profile = await requireCssdAccess("/cssd/setting");

  return (
    <SettingsView
      profile={profile}
      updateNameAction={updateNameAction}
      updatePasswordAction={updatePasswordAction}
      createAccountAction={createAccountAction}
      logoutAction={logoutAction}
    />
  );
}
