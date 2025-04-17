import { format } from "date-fns";

export const columns = [
  {
    accessorKey: "customerEmail",
    header: "Email",
  },
  {
    accessorKey: "_id",
    header: "Order ID",
    cell: ({ row }) => <span className="font-medium">#{row.original._id.slice(-6)}</span>,
  },
  {
    accessorKey: "customerName",
    header: "Customer Name",
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => <span>${parseFloat(row.original.totalAmount).toFixed(2)}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        row.original.status === 'completed' ? 'bg-green-100 text-green-800' :
        row.original.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM d, yyyy'),
  },
];