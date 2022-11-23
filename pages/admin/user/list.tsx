import * as React from "react";
import DashboardPage from "components/DashboardPage";
import Link from "next/link";
import { User } from "lib/types";
import { roles } from "lib/helpers";
import Input from "components/Input";
import Form from "components/Form";
import Submit from "components/Submit";
import { useForm, SubmitHandler } from "react-hook-form";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import useToast from "hooks/useToast";
import StateSelect from "components/StateSelect";
import Badge from "components/Badge";

type Inputs = {
  email: string;
  name: string;
  regions: string[];
};

export default function Users() {
  const { send, loading } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);

  const fetchUsers = React.useCallback(async () => {
    const response = await fetch("/api/admin/users");
    const json = await response.json();
    setUsers(json.users);
  }, []);

  const form = useForm<Inputs>({ mode: "onChange" });
  const {
    formState: { isValid },
  } = form;

  const handleSubmit: SubmitHandler<Inputs> = async ({ name, email, regions }) => {
    const response = await send({
      url: "/api/admin/user/invite",
      method: "POST",
      data: { name, email, regions },
    });
    if (response.success) {
      fetchUsers();
      form.reset();
    }
  };

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
      <Form form={form} onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input type="text" name="name" placeholder="Name" style={{ marginTop: 0 }} required />
          <Input type="email" name="email" placeholder="Email Address" style={{ marginTop: 0 }} required />
          <StateSelect name="regions" className="min-w-[200px]" placeholder="Select regions..." required isMulti />
          <Submit disabled={!isValid || loading} color="green" className="font-medium">
            Invite
          </Submit>
        </div>
      </Form>
      <div className="overflow-hidden shadow md:rounded-lg mb-12">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Name
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 min-w-[8rem] hidden md:table-cell"
              >
                Email
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
                Status
              </th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-gray-700 p-4 text-center">
                  Loading...
                </td>
              </tr>
            )}
            {users.map(({ displayName, email, uid, role, regions, status }) => (
              <tr key={uid}>
                <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{displayName}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden md:table-cell">{email}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden md:table-cell">
                  {roles.find(({ id }) => id === role)?.name || "User"}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden md:table-cell">
                  {regions?.join(", ") || "None"}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                  <Badge color={status === "Invited" ? "default" : "green"}>{status}</Badge>
                </td>
                <td className="text-sm py-4 pl-3 pr-6 font-medium text-gray-500 flex gap-4 justify-end whitespace-nowrap">
                  {status === "Invited" && (
                    <button type="button" className="text-orange-700" onClick={() => handleResend(email || "")}>
                      Resend Invite
                    </button>
                  )}
                  <Link href={`/admin/user/edit/${uid}`}>
                    <a className="font-medium text-orange-700 hover:text-orange-900">Edit</a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPage>
  );
}

export const getServerSideProps = getSecureServerSideProps(() => ({ props: {} }), true);
