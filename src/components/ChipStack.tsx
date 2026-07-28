interface ChipStackProps {
  amount: number;
  className?: string;
}

const chipColors = [
  {
    threshold: 1000,
    color: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    label: "1K",
  },
  {
    threshold: 500,
    color: "bg-gradient-to-br from-purple-500 to-purple-700",
    label: "500",
  },
  {
    threshold: 100,
    color: "bg-gradient-to-br from-gray-800 to-gray-950",
    label: "100",
  },
  {
    threshold: 50,
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
    label: "50",
  },
  {
    threshold: 25,
    color: "bg-gradient-to-br from-green-500 to-green-700",
    label: "25",
  },
  {
    threshold: 10,
    color: "bg-gradient-to-br from-red-500 to-red-700",
    label: "10",
  },
];

export function ChipStack({ amount, className = "" }: ChipStackProps) {
  const getChipForAmount = (value: number) => {
    return (
      chipColors.find((chip) => value >= chip.threshold) ||
      chipColors[chipColors.length - 1]
    );
  };

  const chip = getChipForAmount(amount);

  return (
    <div
      className={`relative h-12 w-12 rounded-full border-4 border-white shadow-xl ${chip.color} ${className}`}
    >
      <div className="absolute inset-1 flex items-center justify-center rounded-full border-2 border-white/30">
        <span className="text-xs font-bold text-white drop-shadow-md">
          {chip.label}
        </span>
      </div>
    </div>
  );
}
