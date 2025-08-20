interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

export default function JsonEditor({
  value,
  onChange,
  error,
}: JsonEditorProps) {
  return (
    <div className="h-full flex flex-col p-4 gap-2">
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          <span>
            <span className="font-semibold">JSON Error:</span> {error}
          </span>
        </div>
      )}
      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full p-4 border rounded-lg font-json text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Edit JSON here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}
