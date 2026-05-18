import { useState, useEffect } from 'react';
import { expenseService } from '../../services/expenseService';

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);

  // إعداد تاريخ اليوم كقيمة افتراضية
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'مشتريات كافيتيريا',
    date: today
  });

  const categories = ['مشتريات كافيتيريا', 'فواتير (كهرباء، ماء، إنترنت)', 'صيانة وإصلاح', 'نثريات وأخرى'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error("خطأ في جلب المصاريف:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) return;

    try {
      await expenseService.addExpense({
        title: formData.title,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date
      });
      
      // تفريغ الحقول مع الاحتفاظ بالتاريخ الافتراضي والتصنيف
      setFormData({ ...formData, title: '', amount: '' });
      loadData();
    } catch (error) {
      console.error("خطأ في تسجيل المصروف:", error);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await expenseService.deleteExpense(itemToDelete.id);
      setItemToDelete(null);
      loadData();
    } catch (error) {
      console.error("خطأ في الحذف:", error);
    }
  };

  // حساب إجمالي المصاريف المعروضة
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  if (loading) return <div className="text-brand-blue font-bold p-6">جاري تحميل سجل المصاريف...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-2xl font-bold text-brand-blue">المصاريف والتشغيل</h1>
        <div className="bg-surface px-6 py-3 rounded-lg shadow-sm border border-slate-100 flex items-center gap-4">
          <span className="text-sm font-bold text-slate-500">إجمالي المصروفات:</span>
          <span className="text-xl font-bold text-absent-text">{totalExpenses.toLocaleString()} ل.س</span>
        </div>
      </div>

      {/* نموذج إدخال مصروف جديد */}
      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl shadow-sm border border-slate-100 space-y-4 lg:space-y-0 lg:flex lg:gap-4 lg:items-end transition-all">
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-700 mb-2">وصف المصروف</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
            placeholder="مثال: شراء 5 كيلو سكر للكافيتيريا"
            required
          />
        </div>
        
        <div className="w-full lg:w-48">
          <label className="block text-sm font-bold text-slate-700 mb-2">المبلغ (ل.س)</label>
          <input 
            type="number" 
            min="1"
            value={formData.amount} 
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
            placeholder="القيمة"
            required
          />
        </div>

        <div className="w-full lg:w-56">
          <label className="block text-sm font-bold text-slate-700 mb-2">التصنيف</label>
          <select 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="w-full lg:w-40">
          <label className="block text-sm font-bold text-slate-700 mb-2">التاريخ</label>
          <input 
            type="date" 
            value={formData.date} 
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="w-full p-3 rounded-lg border border-slate-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none text-left"
            dir="ltr"
            required
          />
        </div>

        <button type="submit" className="w-full lg:w-auto bg-brand-blue text-white font-bold px-8 py-3 rounded-lg hover:bg-brand-blue-dark transition-colors cursor-pointer">
          تسجيل الدفع
        </button>
      </form>

      {/* جدول المصاريف */}
      <div className="overflow-x-auto bg-surface rounded-xl shadow-sm border border-slate-100">
        <table className="w-full block lg:table text-right text-sm">
          <thead className="hidden lg:table-header-group">
            <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
              <th className="px-6 py-4">التاريخ</th>
              <th className="px-6 py-4">البيان / الوصف</th>
              <th className="px-6 py-4">التصنيف</th>
              <th className="px-6 py-4">المبلغ</th>
              <th className="px-6 py-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="block lg:table-row-group">
            {expenses.length === 0 ? (
               <tr className="block lg:table-row">
                 <td colSpan="5" className="px-6 py-8 text-center text-slate-400 block lg:table-cell">لم يتم تسجيل أي مصاريف حتى الآن.</td>
               </tr>
            ) : (
              expenses.map(item => (
                <tr key={item.id} className="block lg:table-row border-b border-slate-100 hover:bg-slate-50 mb-4 lg:mb-0 p-4 lg:p-0">
                  <td className="flex lg:table-cell justify-between items-center py-3 px-4 lg:py-4 border-b border-slate-100 lg:border-none text-slate-500">
                    <span className="lg:hidden font-bold text-slate-400">التاريخ</span>
                    <span dir="ltr">{item.date}</span>
                  </td>
                  <td className="flex lg:table-cell justify-between items-center py-3 px-4 lg:py-4 border-b border-slate-100 lg:border-none font-medium text-slate-800">
                    <span className="lg:hidden font-bold text-slate-400">البيان</span>
                    {item.title}
                  </td>
                  <td className="flex lg:table-cell justify-between items-center py-3 px-4 lg:py-4 border-b border-slate-100 lg:border-none">
                    <span className="lg:hidden font-bold text-slate-400">التصنيف</span>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">{item.category}</span>
                  </td>
                  <td className="flex lg:table-cell justify-between items-center py-3 px-4 lg:py-4 border-b border-slate-100 lg:border-none font-bold text-absent-text">
                    <span className="lg:hidden font-bold text-slate-400">المبلغ</span>
                    {item.amount.toLocaleString()} ل.س
                  </td>
                  <td className="flex lg:table-cell justify-center items-center py-4 lg:py-4">
                    <button onClick={() => setItemToDelete(item)} className="text-absent-text font-medium hover:text-red-800 hover:scale-110 transition-transform cursor-pointer">
                      حذف
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة تأكيد الحذف */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">تأكيد الحذف</h3>
            <p className="text-sm text-slate-600 mb-6">
              هل أنت متأكد من حذف هذا المصروف <span className="font-bold text-absent-text">({itemToDelete.title})</span>؟ سيتم تحديث الجرد المالي فوراً ولن تتمكن من التراجع.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setItemToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer">إلغاء</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-absent-text text-white font-semibold rounded-md hover:bg-red-800 cursor-pointer">نعم، احذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}