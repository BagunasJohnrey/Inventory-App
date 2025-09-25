export default function Table({ items, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border text-left">ID</th>
            <th className="px-4 py-2 border text-left">Name</th>
            <th className="px-4 py-2 border text-center">Stock</th>
            <th className="px-4 py-2 border text-left">Barcode</th>
            <th className="px-4 py-2 border text-left">Format</th>
            <th className="px-4 py-2 border text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{item.id}</td>
              <td className="px-4 py-2 border">{item.name}</td>
              <td className="px-4 py-2 border text-center">{item.stock}</td>
              <td className="px-4 py-2 border">{item.barcode}</td>
              <td className="px-4 py-2 border">{item.format}</td>
              <td className="px-4 py-2 border text-center space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
