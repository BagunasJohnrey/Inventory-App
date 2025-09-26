export default function Table({ items, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md bg-white">
      <table className="min-w-full border-collapse">
        {/* Table Head */}
        <thead className="bg-blue-600 text-white text-sm uppercase tracking-wider">
          <tr className="divide-x divide-blue-500">
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-center">Category</th>
            <th className="px-4 py-3 text-center">Stock</th>
            <th className="px-4 py-3 text-center">Cost Price</th>
            <th className="px-4 py-3 text-center">Selling Price</th>
            <th className="px-4 py-3 text-center">Barcode</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:bg-blue-50 transition-colors divide-x divide-gray-200 ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="px-4 py-3">{item.id}</td>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-center">{item.category}</td>
                <td
                  className={`px-4 py-3 text-center font-semibold ${
                    item.stock <= 5 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {item.stock}
                </td>
                <td className="px-4 py-3 text-center">₱ {item.costprice}</td>
                <td className="px-4 py-3 text-center">₱ {item.sellingprice}</td>
                <td className="px-4 py-3 text-center">{item.barcode}</td>
                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg shadow-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg shadow-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="8"
                className="text-center py-6 text-gray-500 italic"
              >
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
