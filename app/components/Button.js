export default function Button({ text, href, primary }) {
  const base = "px-6 py-3 rounded-lg font-medium transition";
  const style = primary
    ? "bg-indigo-500 hover:bg-indigo-600 text-white"
    : "border border-gray-400 text-gray-200 hover:bg-gray-800";

  return (
    <a href={href} className={`${base} ${style}`}>
      {text}
    </a>
  );
}
