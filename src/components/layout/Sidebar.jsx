import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen, setIsOpen }) {
  // كلاسات مشتركة للروابط لتقليل التكرار (DRY Principle)
  const navLinkClass = ({ isActive }) => 
    `flex items-center px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
      isActive 
        ? 'bg-brand-gold text-brand-blue-dark shadow-sm' 
        : 'text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1'
    }`;

  return (
    <>
      {/* خلفية معتمة للموبايل */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* القائمة الجانبية (نمط داكن) */}
      <aside 
        className={`fixed inset-y-0 right-0 z-50 w-64 transform bg-brand-blue text-white shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* الشعار والعنوان */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-brand-gold">لوحة التحكم الإدارية</h2>
        </div>

        <nav className="flex-1 p-4 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* المجموعة الأولى: فرقة العاملين */}
          <div className="space-y-2">
            <p className="px-3 mb-4 text-xs font-bold text-white/50 uppercase tracking-wider">
              فرقة العاملين
            </p>
            <NavLink to="/dashboard" className={navLinkClass}>اللوحة العامة</NavLink>
            <NavLink to="/members" className={navLinkClass}>إدارة الأعضاء</NavLink>
            <NavLink to="/meetings" className={navLinkClass}>الاجتماعات</NavLink>
            <NavLink to="/activities" className={navLinkClass}>النشاطات</NavLink>
            <NavLink to="/camps" className={navLinkClass}>المخيمات</NavLink>
          </div>

          {/* خط فاصل أنيق بين المجموعتين */}
          <div className="border-t border-white/10 mx-3 my-4"></div>

          {/* المجموعة الثانية: إدارة بيت الشباب */}
          <div className="space-y-2">
            <p className="px-3 mb-4 text-xs font-bold text-white/50 uppercase tracking-wider">
              إدارة بيت الشباب
            </p>
            <NavLink to="/youth-home/dashboard" className={navLinkClass}>اللوحة المالية والإحصائيات</NavLink>
            <NavLink to="/youth-home/cafeteria" className={navLinkClass}>مبيعات الكافيتيريا اليومية</NavLink>
            <NavLink to="/youth-home/expenses" className={navLinkClass}>المصاريف والتشغيل العام</NavLink>
            <NavLink to="/youth-home/activities" className={navLinkClass}>نشاطات بيت الشباب</NavLink>
          </div>

        </nav>
      </aside>
    </>
  );
}