import { logoutAction } from "@/app/(protected)/actions";
import {
  createAccountAction,
  updateNameAction,
  updatePasswordAction,
} from "@/app/(protected)/setting/actions";
import { SettingsView } from "@/components/settings/settings-view";
import { requireLaundryAccess } from "@/lib/auth/guards";

export default async function LaundrySettingPage() {
  const profile = await requireLaundryAccess("/laundry/setting");

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
