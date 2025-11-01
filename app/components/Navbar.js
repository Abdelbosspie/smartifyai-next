export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-6 px-10 text-sm text-gray-300">
      <div className="font-bold text-lg">SmartifyAI</div>
      <ul className="flex gap-8">
        <li><a href="#">Services</a></li>
        <li><a href="#">Examples</a></li>
        <li><a href="#">Why Us</a></li>
        <li><a href="#">Free AI Audit</a></li>
      </ul>
    </nav>
  );
}
