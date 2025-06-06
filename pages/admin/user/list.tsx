import React from "react";
import DashboardPage from "components/DashboardPage";
import Link from "next/link";
import { User } from "lib/types";
import { roles } from "lib/helpers";
import Button from "components/Button";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import useToast from "hooks/useToast";
import Badge from "components/Badge";
import { useModal } from "providers/modals";

export default function Users() {
  const [query, setQuery] = React.useState("");
  const { send } = useToast();
  const { open } = useModal();
  const [users, setUsers] = React.useState<User[]>([]);

  const fetchUsers = React.useCallback(async () => {
    const response = await fetch("/api/admin/users");
    const json = await response.json();
    setUsers(json.users);
  }, []);

  const filterUsers = query
    ? users.filter(
        ({ displayName, regions }) =>
          displayName?.toLowerCase().includes(query.toLowerCase()) ||
          regions?.some(({ name }) => name?.toLowerCase().includes(query.toLowerCase()))
      )
    : users;

  const handleResend = async (email: string) => {
    await send({
      url: "/api/admin/user/resend-invite",
      method: "POST",
      data: { email },
      success: "Invitation sent!",
    });
  };

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <DashboardPage title="Users">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
        <input
          type="search"
          placeholder="Search by name/region"
          className="form-input w-full max-w-xs !mt-0 pl-4"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          onClick={() => open("inviteEditor", { onSuccess: fetchUsers })}
          color="green"
          className="font-medium whitespace-nowrap"
        >
          Invite Editor
        </Button>
      </div>
      <div className="overflow-hidden shadow md:rounded-lg mb-4">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                User
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[8rem] hidden md:table-cell"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[8rem] hidden md:table-cell"
              >
                Region(s)
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[8rem] hidden md:table-cell"
              >
                eBird ID
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[8rem] hidden md:table-cell"
              >
                Status
              </th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-gray-700 p-4 text-center">
                  Loading...
                </td>
              </tr>
            )}
            {filterUsers.map(({ displayName, email, uid, role, regions, status, ebirdId }) => (
              <tr key={uid}>
                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {displayName}
                  <br />
                  <span className="text-gray-500">{email}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden md:table-cell">
                  {roles.find(({ id }) => id === role)?.name || "User"}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 hidden md:table-cell">
                  {regions?.map(({ name, code }, i) => (
                    <>
                      <Link key={code} href={`/region/${code}`} className="text-gray-500 hover:underline">
                        {name}
                      </Link>
                      {i < regions.length - 1 && ", "}
                    </>
                  ))}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden md:table-cell">{ebirdId}</td>
                <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500 hidden md:table-cell">
                  <Badge color={status === "Deactivated" ? "default" : status === "Invited" ? "default" : "green"}>
                    {status}
                  </Badge>
                </td>
                <td className="text-sm py-4 pl-3 pr-6 font-medium text-gray-500 flex gap-4 justify-end whitespace-nowrap">
                  {status === "Invited" && (
                    <button type="button" className="text-orange-700" onClick={() => handleResend(email || "")}>
                      Resend Invite
                    </button>
                  )}
                  <Link href={`/admin/user/edit/${uid}`} className="font-medium text-orange-700 hover:text-orange-900">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-gray-600">
        {filterUsers.length === users.length
          ? `Showing all ${users.length} results`
          : `Showing ${filterUsers.length} of ${users.length} results`}
      </div>
    </DashboardPage>
  );
}

export const getServerSideProps = getSecureServerSideProps(() => ({ props: {} }), true);
