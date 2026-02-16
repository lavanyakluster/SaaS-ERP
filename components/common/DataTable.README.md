# DataTable Component

A powerful, reusable table component with built-in filtering, sorting, and pagination.

## Features

✅ **Global Search** - Search across all columns at once  
✅ **Column-Specific Filters** - Filter individual columns  
✅ **Column Sorting** - Sort by any column (ascending/descending)  
✅ **Pagination** - Built-in pagination with configurable page size  
✅ **Custom Rendering** - Custom cell renderers for complex content  
✅ **Theme Support** - Light and dark mode support  
✅ **Responsive** - Mobile-friendly design  
✅ **TypeScript** - Fully typed with generics  

---

## Basic Usage

```tsx
import { DataTable, ColumnDef } from '@/components/common';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

export function UsersTable() {
  const columns: ColumnDef<User>[] = [
    {
      key: 'id',
      header: 'ID',
      accessor: (row) => row.id,
      sortable: true,
      filterable: true,
    },
    {
      key: 'name',
      header: 'Name',
      accessor: (row) => row.name,
      sortable: true,
      filterable: true,
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (row) => row.email,
      sortable: true,
      filterable: true,
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (row) => row.role,
      sortable: true,
      filterable: true,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (row) => row.status,
      sortable: true,
      filterable: true,
    },
  ];

  const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active' },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      theme="light"
    />
  );
}
```

---

## Advanced Usage

### Custom Cell Rendering

```tsx
const columns: ColumnDef<User>[] = [
  {
    key: 'status',
    header: 'Status',
    accessor: (row) => row.status,
    sortable: true,
    filterable: true,
    render: (value: 'active' | 'inactive') => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'active' 
          ? 'bg-emerald-100 text-emerald-700' 
          : 'bg-gray-100 text-gray-700'
      }`}>
        {value}
      </span>
    ),
  },
];
```

### Actions Column

```tsx
const columns: ColumnDef<User>[] = [
  // ... other columns
  {
    key: 'actions',
    header: 'Actions',
    accessor: (row) => row.id,
    sortable: false,
    filterable: false,
    align: 'right',
    render: (id, row) => (
      <div className="flex gap-2 justify-end">
        <button onClick={() => handleEdit(row)}>Edit</button>
        <button onClick={() => handleDelete(id)}>Delete</button>
      </div>
    ),
  },
];
```

### Row Click Handler

```tsx
<DataTable
  data={users}
  columns={columns}
  onRowClick={(user) => {
    console.log('Clicked user:', user);
    navigate(`/users/${user.id}`);
  }}
/>
```

### Custom Row Styling

```tsx
<DataTable
  data={users}
  columns={columns}
  rowClassName={(user, index) => 
    user.status === 'inactive' ? 'opacity-50' : ''
  }
/>
```

### Default Sorting

```tsx
<DataTable
  data={users}
  columns={columns}
  defaultSortKey="name"
  defaultSortOrder="asc"
/>
```

### Custom Page Size

```tsx
<DataTable
  data={users}
  columns={columns}
  pageSize={50}
  enablePagination={true}
/>
```

### Disable Global Filter

```tsx
<DataTable
  data={users}
  columns={columns}
  enableGlobalFilter={false}
/>
```

---

## Column Definition API

```tsx
interface ColumnDef<T> {
  key: string;              // Unique column identifier
  header: string;           // Column header text
  accessor: (row: T) => any; // Function to extract cell value
  sortable?: boolean;       // Enable sorting (default: false)
  filterable?: boolean;     // Enable column filter (default: false)
  render?: (value: any, row: T) => React.ReactNode; // Custom cell renderer
  align?: 'left' | 'center' | 'right'; // Text alignment (default: 'left')
  width?: string;          // Column width (e.g., '200px', '20%')
}
```

---

## DataTable Props API

```tsx
interface DataTableProps<T> {
  data: T[];                // Array of data rows
  columns: ColumnDef<T>[];  // Column definitions
  theme?: 'light' | 'dark'; // Theme (default: 'light')
  emptyMessage?: string;    // Message when no data (default: 'No data available')
  className?: string;       // Additional CSS classes
  rowClassName?: string | ((row: T, index: number) => string); // Row CSS classes
  onRowClick?: (row: T) => void; // Row click handler
  defaultSortKey?: string;  // Initial sort column
  defaultSortOrder?: 'asc' | 'desc'; // Initial sort order (default: 'asc')
  enableGlobalFilter?: boolean; // Enable global search (default: true)
  pageSize?: number;        // Rows per page (default: 20)
  enablePagination?: boolean; // Enable pagination (default: true)
}
```

---

## Real-World Examples

### Billing History Table

See `/components/billing/BillingHistoryTable.tsx` for a complete example with:
- Custom status badges
- Download action buttons
- Date formatting
- Amount formatting
- Default sorting by date

### Usage in Reports

```tsx
// Sales Report Table
const columns: ColumnDef<SalesTransaction>[] = [
  {
    key: 'invoiceNo',
    header: 'Invoice No.',
    accessor: (row) => row.invoiceNo,
    sortable: true,
    filterable: true,
    render: (value) => (
      <span className="text-blue-600 font-semibold">{value}</span>
    ),
  },
  {
    key: 'date',
    header: 'Date',
    accessor: (row) => row.date,
    sortable: true,
    filterable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
  {
    key: 'customer',
    header: 'Customer',
    accessor: (row) => row.customerName,
    sortable: true,
    filterable: true,
  },
  {
    key: 'amount',
    header: 'Amount',
    accessor: (row) => row.amount,
    sortable: true,
    filterable: false,
    align: 'right',
    render: (value) => `AED ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (row) => row.status,
    sortable: true,
    filterable: true,
    align: 'center',
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        value === 'Paid' 
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
      }`}>
        {value}
      </span>
    ),
  },
];
```

---

## Migration Guide

### From Old Table to DataTable

**Before:**
```tsx
<table className="w-full">
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {users.map(user => (
      <tr key={user.id}>
        <td>{user.name}</td>
        <td>{user.email}</td>
        <td>{user.status}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**After:**
```tsx
const columns: ColumnDef<User>[] = [
  {
    key: 'name',
    header: 'Name',
    accessor: (row) => row.name,
    sortable: true,
    filterable: true,
  },
  {
    key: 'email',
    header: 'Email',
    accessor: (row) => row.email,
    sortable: true,
    filterable: true,
  },
  {
    key: 'status',
    header: 'Status',
    accessor: (row) => row.status,
    sortable: true,
    filterable: true,
  },
];

<DataTable data={users} columns={columns} />
```

---

## Best Practices

### 1. Always Make Columns Sortable and Filterable

Unless there's a specific reason not to, enable sorting and filtering:

```tsx
{
  key: 'name',
  header: 'Name',
  accessor: (row) => row.name,
  sortable: true,    // ✅ Enable sorting
  filterable: true,  // ✅ Enable filtering
}
```

### 2. Use Proper Data Types in Accessor

The accessor should return the raw value, not formatted:

```tsx
// ✅ CORRECT
{
  key: 'amount',
  header: 'Amount',
  accessor: (row) => row.amount, // Return number
  render: (value) => `AED ${value.toLocaleString()}`, // Format in render
}

// ❌ WRONG
{
  key: 'amount',
  header: 'Amount',
  accessor: (row) => `AED ${row.amount.toLocaleString()}`, // Don't format here
}
```

### 3. Set Appropriate Default Sort

```tsx
<DataTable
  data={transactions}
  columns={columns}
  defaultSortKey="date"
  defaultSortOrder="desc" // Most recent first
/>
```

### 4. Use Custom Rendering for Complex Content

```tsx
{
  key: 'user',
  header: 'User',
  accessor: (row) => row.userId,
  render: (userId, row) => (
    <div className="flex items-center gap-2">
      <img src={row.avatar} className="w-8 h-8 rounded-full" />
      <div>
        <div className="font-semibold">{row.name}</div>
        <div className="text-xs text-gray-500">{row.email}</div>
      </div>
    </div>
  ),
}
```

### 5. Disable Pagination for Small Datasets

```tsx
<DataTable
  data={items}
  columns={columns}
  enablePagination={items.length > 20} // Only paginate if needed
  pageSize={20}
/>
```

---

## Performance Tips

- Use `useMemo` for column definitions if they depend on props
- Keep `data` array reference stable (use React Query or state)
- Disable pagination for datasets < 50 rows
- Use virtual scrolling for very large datasets (>1000 rows)

```tsx
const columns = useMemo(() => [
  // ... column definitions
], [dependency]);
```

---

## Accessibility

The DataTable component includes:
- Proper semantic HTML (`<table>`, `<thead>`, `<tbody>`)
- Keyboard navigation support
- Screen reader friendly labels
- Focus indicators

---

## Troubleshooting

### Columns not sorting correctly

Make sure the `accessor` returns the raw value, not a formatted string:

```tsx
// ❌ WRONG
accessor: (row) => `$${row.amount}` // Returns string

// ✅ CORRECT
accessor: (row) => row.amount // Returns number
```

### Custom rendering not showing

Make sure you're using the `render` prop, not formatting in `accessor`:

```tsx
{
  accessor: (row) => row.status, // Raw value
  render: (value) => <Badge>{value}</Badge>, // Custom render
}
```

---

## Future Enhancements

Planned features:
- [ ] Column visibility toggle
- [ ] Export to CSV/Excel
- [ ] Column resizing
- [ ] Multi-column sorting
- [ ] Saved filter presets
- [ ] Virtual scrolling for large datasets

---

## Support

For issues or questions:
1. Check this README
2. See example implementations in `/components/billing/BillingHistoryTable.tsx`
3. Contact the development team
