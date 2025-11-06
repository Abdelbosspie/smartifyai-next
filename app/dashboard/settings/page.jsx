"use client";

import { useEffect, useMemo, useState } from "react";

export default function SettingsPage() {
  const [tab, setTab] = useState("general");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile (General)
  const [profile, setProfile] = useState({
    workspaceName: "",
    name: "",
    email: "",
  });

  // Members
  const [members, setMembers] = useState([]);
  const [inviting, setInviting] = useState(false);
  const [invite, setInvite] = useState({ email: "", role: "Member" });

  // API Keys
  const [keys, setKeys] = useState([]);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");

useEffect(() => {
  let alive = true;
  (async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch user data directly from NextAuth session
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = res.ok ? await res.json() : null;
      const user = data?.user;

      if (alive && user) {
        setProfile({
          workspaceName: user.workspaceName || "",
          name: user.name || "",
          email: user.email || "",
        });
      }
    } catch (e) {
      if (alive) setError(e?.message || "Failed to load settings.");
    } finally {
      if (alive) setLoading(false);
    }
  })();

  return () => {
    alive = false;
  };
}, []);

  // Load members & keys when their tabs are opened
  useEffect(() => {
    let alive = true;
    (async () => {
      if (tab === "members") {
        try {
          const r = await fetch("/api/workspace/members", { cache: "no-store" });
          if (alive && r.ok) setMembers(await r.json());
          else if (alive) setMembers([]);
        } catch {
          if (alive) setMembers([]);
        }
      }
      if (tab === "keys") {
        try {
          const r = await fetch("/api/apikeys", { cache: "no-store" });
          if (alive && r.ok) setKeys(await r.json());
          else if (alive) setKeys([]);
        } catch {
          if (alive) setKeys([]);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab]);

  async function saveProfile(e) {
    e?.preventDefault?.();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email, name: profile.name }),
      });
      if (!res.ok) {
        let msg = "Failed to save profile.";
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }

      // Notify success
      setSuccess("Profile saved");
      setError("");
      setTimeout(() => setSuccess(""), 3000);

      // Broadcast the change so Sidebar updates immediately
      try {
        localStorage.setItem(
          "smartify:user",
          JSON.stringify({ name: profile.name, email: profile.email, image: null })
        );
        window.dispatchEvent(
          new CustomEvent("user:updated", { detail: { name: profile.name, email: profile.email } })
        );
      } catch {}
    } catch (e) {
      setSuccess("");
      setError(e?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function sendInvite(e) {
    e?.preventDefault?.();
    if (!invite.email) return;
    setInviting(true);
    setError("");
    try {
      const r = await fetch("/api/workspace/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invite),
      });
      if (!r.ok) throw new Error(await r.text());
      setInvite({ email: "", role: "Member" });
      const m = await fetch("/api/workspace/members", { cache: "no-store" });
      setMembers(m.ok ? await m.json() : []);
    } catch (e) {
      setError(e?.message || "Failed to invite member.");
    } finally {
      setInviting(false);
    }
  }

  async function createKey(e) {
    e?.preventDefault?.();
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    setError("");
    try {
      const r = await fetch("/api/apikeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      if (!r.ok) throw new Error(await r.text());
      setNewKeyName("");
      const list = await fetch("/api/apikeys", { cache: "no-store" });
      setKeys(list.ok ? await list.json() : []);
    } catch (e) {
      setError(e?.message || "Failed to create API key.");
    } finally {
      setCreatingKey(false);
    }
  }

  async function revokeKey(id) {
    try {
      await fetch(`/api/apikeys/${id}`, { method: "DELETE" });
      const list = await fetch("/api/apikeys", { cache: "no-store" });
      setKeys(list.ok ? await list.json() : []);
    } catch {}
  }

  const tabs = useMemo(
    () => [
      { id: "general", label: "General" },
      { id: "members", label: "Members" },
      { id: "keys", label: "API keys" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Profile & workspace configuration.</p>
      </header>

      {success && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* Left nav */}
        <aside className="w-56 shrink-0">
          <div className="text-xs font-medium text-gray-500 mb-2">Workspace settings</div>
          <div className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  "block w-full rounded-lg px-3 py-2 text-left text-sm",
                  tab === t.id ? "bg-indigo-50 font-medium text-indigo-700" : "text-gray-600 hover:bg-gray-50",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <section className="flex-1">
          {tab === "general" && (
            <form onSubmit={saveProfile} className="rounded-xl border border-gray-200 bg-white p-6 space-y-4 max-w-xl">
              <div>
                <label className="text-sm text-gray-600">Workspace name</label>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400"
                  placeholder="e.g., Acme"
                  value={profile.workspaceName}
                  onChange={(e) => setProfile((p) => ({ ...p, workspaceName: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Your name</label>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400"
                  placeholder="Your name"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm bg-gray-50 text-gray-500"
                  value={profile.email}
                  disabled
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          )}

          {tab === "members" && (
            <div className="space-y-6">
              <form onSubmit={sendInvite} className="rounded-xl border border-gray-200 bg-white p-6 max-w-xl">
                <div className="text-sm font-medium mb-3">Invite a member</div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    type="email"
                    required
                    placeholder="teammate@email.com"
                    className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400"
                    value={invite.email}
                    onChange={(e) => setInvite((v) => ({ ...v, email: e.target.value }))}
                  />
                  <select
                    className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400"
                    value={invite.role}
                    onChange={(e) => setInvite((v) => ({ ...v, role: e.target.value }))}
                  >
                    <option>Admin</option>
                    <option>Member</option>
                    <option>Viewer</option>
                  </select>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {inviting ? "Sending…" : "Send invite"}
                  </button>
                </div>
              </form>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="text-sm font-medium mb-3">Members</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Role</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.id} className="border-b last:border-0">
                          <td className="px-3 py-2">{m.name || "—"}</td>
                          <td className="px-3 py-2">{m.email}</td>
                          <td className="px-3 py-2">{m.role || "Member"}</td>
                          <td className="px-3 py-2">{m.status || "active"}</td>
                          <td className="px-3 py-2 text-right">
                            <button className="rounded border border-gray-200 px-2 py-1 text-xs hover:border-gray-300">Remove</button>
                          </td>
                        </tr>
                      ))}
                      {members.length === 0 && (
                        <tr>
                          <td className="px-3 py-6 text-sm text-gray-500" colSpan={5}>
                            No members yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === "keys" && (
            <div className="space-y-6">
              <form onSubmit={createKey} className="rounded-xl border border-gray-200 bg-white p-6 max-w-xl">
                <div className="text-sm font-medium mb-3">Create API key</div>
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Key name (e.g., server-prod)"
                    className="h-10 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-400"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={creatingKey}
                    className="rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {creatingKey ? "Creating…" : "Create"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">Keys are shown only once when created. Store them securely.</p>
              </form>

              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <div className="text-sm font-medium mb-3">Your API keys</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Created</th>
                        <th className="px-3 py-2 text-left">Last used</th>
                        <th className="px-3 py-2 text-left">Key</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map((k) => (
                        <tr key={k.id} className="border-b last:border-0">
                          <td className="px-3 py-2">{k.name}</td>
                          <td className="px-3 py-2">{k.createdAt ? new Date(k.createdAt).toLocaleString() : "—"}</td>
                          <td className="px-3 py-2">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "—"}</td>
                          <td className="px-3 py-2 font-mono text-xs">{k.preview || k.keyPreview || "••••-••••"}</td>
                          <td className="px-3 py-2 text-right">
                            <button onClick={() => revokeKey(k.id)} className="rounded border border-gray-200 px-2 py-1 text-xs hover:border-gray-300">
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                      {keys.length === 0 && (
                        <tr>
                          <td className="px-3 py-6 text-sm text-gray-500" colSpan={5}>
                            No API keys yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}