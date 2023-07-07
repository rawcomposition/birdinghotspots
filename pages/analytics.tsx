import * as React from "react";
import connect from "lib/mongo";
import Pageview from "models/Pageview";
import PageHeading from "components/PageHeading";
import { GetServerSideProps } from "next";
import { State } from "lib/types";
import dayjs from "dayjs";
import Title from "components/Title";
import { useRouter } from "next/router";
import Form from "components/Form";
import Select from "components/Select";
import { useForm } from "react-hook-form";

interface StateViews extends State {
  count: number;
}

type Props = {
  data: StateViews[];
  year: number;
  month: number;
};

export default function Analytics({ data, year, month }: Props) {
  const router = useRouter();
  const form = useForm({ defaultValues: { year: year.toString(), month: month.toString() } });
  const startYear = 2023;

  const yearOptions = Array.from({ length: dayjs().year() - startYear + 1 }, (_, i) => ({
    value: (startYear + i).toString(),
    label: (startYear + i).toString(),
  }));

  const isCurrentYear = year === dayjs().year();
  const currentMonth = dayjs().month() + 1;
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const filteredMonths = isCurrentYear ? months.filter((it) => it <= currentMonth) : months;

  const monthOptions = filteredMonths.map((month) => ({
    value: month.toString(),
    label: dayjs()
      .month(month - 1)
      .format("MMMM"),
  }));

  const handleYearChange = (value: string) => {
    router.push(`/analytics?year=${value}&month=${month}`);
  };

  const handleMonthChange = (value: string) => {
    router.push(`/analytics?year=${year}&month=${value}`);
  };

  return (
    <div className="container pb-16 mt-12">
      <Title>Pageview Analytics</Title>
      <PageHeading>Pageview Analytics</PageHeading>

      <Form form={form} className="grid gap-4 max-w-xs grid-cols-2 -mt-8 mb-8" onSubmit={() => {}}>
        <Select name="year" label="Year" options={yearOptions} onChange={handleYearChange} />
        <Select name="month" label="Month" options={monthOptions} onChange={handleMonthChange} />
      </Form>

      <div className="max-w-md">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Region</th>
              <th className="px-4 py-2 text-left">Views</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ label, count, code }) => (
              <tr key={code}>
                <td className="border px-4 py-2">{label}</td>
                <td className="border px-4 py-2">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 mt-8">
        • The pageview count for states and counties only includes visits region&apos;s homepage.
      </p>
      <p className="text-sm text-gray-500">• Editors and bots are not included in the pageview count.</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  await connect();
  const entity = "state";
  const year = query.year ? Number(query.year as string) : dayjs().year();
  const month = query.month ? Number(query.month as string) : dayjs().month() + 1;

  const regionStats = await Pageview.find({ entity, year, month });
  const data = States.filter(({ active }) => active).map((region) => {
    const stats = regionStats.find((view) => view.stateCode === region.code);
    return {
      count: stats?.count || 0,
      label: region.label,
      code: region.code,
    };
  });

  const sortedData = data.sort((a, b) => b.count - a.count);

  return {
    props: { data: sortedData, year, month },
  };
};
