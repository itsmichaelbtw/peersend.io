interface Props {
  title: string;
  stat: string | number | React.ReactNode;
}

export function InfoStatistic({ title, stat }: Props) {
  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-200 pb-2 text-sm">
      <p className="text-gray-500">{title}</p>
      {typeof stat === "string" || typeof stat === "number" ? (
        <p className="text-gray-900">{stat}</p>
      ) : (
        stat
      )}
    </div>
  );
}
