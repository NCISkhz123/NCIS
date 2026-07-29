"use client";

import { useActionState } from "react";
import { User, Lock, UserPlus, LogOut } from "lucide-react";

import type { SettingsActionState } from "@/app/(protected)/setting/actions";
import type { CurrentProfile } from "@/lib/auth/profile";
import { getCreatableRolesForAdmin } from "@/lib/auth/settings";
import { FeedbackBanner } from "@/components/feedback/feedback-banner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type SettingsViewProps = {
  profile: CurrentProfile;
  updateNameAction: (
    state: SettingsActionState | null,
    formData: FormData
  ) => Promise<SettingsActionState>;
  updatePasswordAction: (
    state: SettingsActionState | null,
    formData: FormData
  ) => Promise<SettingsActionState>;
  createAccountAction: (
    state: SettingsActionState | null,
    formData: FormData
  ) => Promise<SettingsActionState>;
  logoutAction: () => Promise<void>;
};

const roleLabels = {
  ADMIN_CSSD: "Admin CSSD",
  PETUGAS_CSSD: "Petugas CSSD",
  ADMIN_LAUNDRY: "Admin Laundry",
  PETUGAS_LAUNDRY: "Petugas Laundry",
} as const;

function ActionFeedback({ state }: { state: SettingsActionState | null }) {
  if (!state) {
    return null;
  }

  return (
    <FeedbackBanner
      tone={state.ok ? "success" : "error"}
      label={state.ok ? "Berhasil" : "Perlu dicek"}
    >
      {state.message}
    </FeedbackBanner>
  );
}

export function SettingsView({
  profile,
  updateNameAction,
  updatePasswordAction,
  createAccountAction,
  logoutAction,
}: SettingsViewProps) {
  const [nameState, nameFormAction, namePending] = useActionState(
    updateNameAction,
    null
  );
  const [passwordState, passwordFormAction, passwordPending] = useActionState(
    updatePasswordAction,
    null
  );
  const [accountState, accountFormAction, accountPending] = useActionState(
    createAccountAction,
    null
  );
  const creatableRoles = getCreatableRolesForAdmin(profile.role);

  return (
    <div className="grid w-full gap-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="info">PENGATURAN AKUN</Badge>
            <span className="text-xs font-mono font-semibold text-slate-600">ID: {profile.userId.slice(0, 8)}...</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Setting
          </h2>
          <p className="text-xs md:text-sm font-medium text-slate-600">
            Kelola nama, password, dan sesi akun NCIS Anda.
          </p>
        </div>
        <Badge variant="success" dot className="self-start md:self-auto">
          Role: {roleLabels[profile.role as keyof typeof roleLabels] ?? profile.role}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Name Form */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <User className="h-4 w-4 text-sky-600" />
                <span>Nama</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Nama ini dipakai sebagai identitas pengguna di aplikasi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={nameFormAction} className="grid gap-4">
                <div className="grid gap-1.5">
                  <label
                    htmlFor="fullName-input"
                    className="text-xs font-semibold uppercase tracking-wider text-slate-800"
                  >
                    Nama
                  </label>
                  <Input
                    id="fullName-input"
                    name="fullName"
                    defaultValue={profile.fullName ?? ""}
                    disabled={namePending}
                    placeholder="Nama pengguna"
                  />
                </div>

                <ActionFeedback state={nameState} />

                <Button
                  type="submit"
                  disabled={namePending}
                  variant="primary"
                  size="default"
                >
                  <span>{namePending ? "Menyimpan..." : "Simpan nama"}</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Session Card */}
        <div className="lg:col-span-5">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <LogOut className="h-4 w-4 text-rose-600" />
                <span>Sesi</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Keluar dari perangkat ini setelah pekerjaan selesai.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="destructive"
                  size="default"
                  className="w-full"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Lock className="h-4 w-4 text-sky-600" />
            <span>Ubah Password</span>
          </CardTitle>
          <CardDescription className="text-xs text-slate-600">
            Gunakan password baru minimal 8 karakter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordFormAction} className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label
                htmlFor="password-new"
                className="text-xs font-semibold uppercase tracking-wider text-slate-800"
              >
                Password baru
              </label>
              <Input
                id="password-new"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Password baru"
                disabled={passwordPending}
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="password-confirm"
                className="text-xs font-semibold uppercase tracking-wider text-slate-800"
              >
                Konfirmasi password
              </label>
              <Input
                id="password-confirm"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                placeholder="Ulangi password"
                disabled={passwordPending}
              />
            </div>

            <div className="sm:col-span-2">
              <ActionFeedback state={passwordState} />
            </div>

            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={passwordPending}
                variant="primary"
                size="default"
              >
                <span>{passwordPending ? "Menyimpan..." : "Simpan password"}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Creation for Admin */}
      {creatableRoles.length > 0 ? (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <UserPlus className="h-4 w-4 text-sky-600" />
              <span>Pembuatan Akun</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Admin hanya dapat membuat akun untuk modulnya sendiri.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={accountFormAction} className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label
                  htmlFor="new-user-fullname"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-800"
                >
                  Nama
                </label>
                <Input
                  id="new-user-fullname"
                  name="fullName"
                  placeholder="Nama pengguna baru"
                  disabled={accountPending}
                />
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="new-user-email"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-800"
                >
                  Email
                </label>
                <Input
                  id="new-user-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@ncis.local"
                  disabled={accountPending}
                />
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="new-user-role"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-800"
                >
                  Role
                </label>
                <Select id="new-user-role" name="role" disabled={accountPending}>
                  {creatableRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-1.5">
                <label
                  htmlFor="new-user-password"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-800"
                >
                  Password awal
                </label>
                <Input
                  id="new-user-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                  disabled={accountPending}
                />
              </div>

              <div className="sm:col-span-2">
                <ActionFeedback state={accountState} />
              </div>

              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  disabled={accountPending}
                  variant="primary"
                  size="lg"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{accountPending ? "Membuat..." : "Buat akun"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
