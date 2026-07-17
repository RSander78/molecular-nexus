export default function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      {message}
    </div>
  );
}
