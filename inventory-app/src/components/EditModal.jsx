// EditModal.jsx
export default function EditModal({
  editForm,
  setEditForm,
  onCancel,
  onDelete,
  onSave,
  message,
}) {
  if (!editForm) return null; // Only show when editing

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-96 transform transition-all duration-300 scale-95 animate-fadeIn">
        <h3 className="text-xl font-bold mb-4 text-gray-800">✏️ Edit Item</h3>

        {/* Item Name */}
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          placeholder="Item Name"
          className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Stock */}
        <input
          type="number"
          min="0"
          value={editForm.stock}
          onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
          placeholder="Stock"
          className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Buttons */}
        <div className="flex justify-between gap-2 mt-4">
          <button
            onClick={() => {
              onCancel();
              message("Edit cancelled ❌");
            }}
            className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onDelete();
              message("Item deleted 🗑️");
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Delete
          </button>
          <button
            onClick={() => {
              onSave();
              message("Item updated ✅");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
