import * as React from "react";
import Link from "next/link";
import { getLogs } from "lib/mongo";
import Title from "components/Title";
import DashboardPage from "components/DashboardPage";
import "photoswipe/dist/photoswipe.css";
import { Log } from "lib/types";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import dayjs from "dayjs";

type Props = {
  logs: Log[];
};

export default function Logs({ logs }: Props) {
  return (
    <DashboardPage title="Logs">
      <div className="container pb-16">
        <Title>Logs</Title>
        <div className="p-4 overflow-hidden shadow md:rounded-lg bg-white mb-4">
          {logs.map(({ _id, message, createdAt, hotspotId, user, groupId }) => (
            <div key={_id} className="flex gap-3">
              <span className="text-gray-400">{dayjs(createdAt).format("YYYY-MM-DD HH:mm")}</span>
              <span>
                {user} {message}
              </span>
              {hotspotId && <Link href={`/admin/hotspot/${hotspotId}`}>view hotspot</Link>}
              {groupId && <Link href={`/admin/group/${groupId}`}>view group</Link>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">Showing {logs.length} most recent logs</p>
      </div>
    </DashboardPage>
  );
}
export const getServerSideProps = getSecureServerSideProps(async (context, token) => {
  const logs = await getLogs();

  return {
    props: { logs },
  };
});