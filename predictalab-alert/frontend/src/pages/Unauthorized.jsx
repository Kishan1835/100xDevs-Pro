export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-semibold text-red-600">
        You are not authorized to access this page.
      </h1>
    </div>
  );
}