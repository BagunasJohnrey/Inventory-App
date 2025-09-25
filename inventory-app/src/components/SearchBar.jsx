export default function SearchBar({ search, setSearch }) {
  return (
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search items by name or barcode..."
      className="border rounded-lg p-2 w-full mb-4"
    />
  );
}
