import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen, setIsOpen }) {
  const navItems = [
    { name: 'الرئيسية', path: '/' },
    { name: 'الأعضاء', path: '/members' },
    { name: 'الاجتماعات', path: '/meetings' },
    { name: 'النشاطات', path: '/activities' },
    { name: 'المخيمات', path: '/camps' },
  ];

  return (
    <>
      {/* خلفية معتمة للموبايل (تختفي في شاشات 1024px فأكثر) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* القائمة الجانبية */}
      <aside 
        className={`fixed inset-y-0 right-0 z-50 w-64 transform bg-brand-blue text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
          <span className="text-xl font-bold text-brand-gold">بيت الشباب</span>
          <button 
            className="lg:hidden text-white hover:text-brand-gold transition-colors"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-brand-gold text-brand-blue-dark' 
                    : 'text-slate-300 hover:bg-brand-blue-dark hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}