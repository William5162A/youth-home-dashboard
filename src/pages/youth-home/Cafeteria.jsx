import { useState, useEffect } from 'react';
import { cafeteriaService } from '../../services/cafeteriaService';

export default function Cafeteria() {
  // حالة النظام الأساسية
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'menu'
  const [loading, setLoading] = useState(true);
  
  // بيانات قاعدة البيانات
  const [menuItems, setMenuItems] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  // حالات الإدخال والتحكم بالنوافذ (Forms & Modals State)
  const [menuForm, setMenuForm] = useState({ name: '', price: '' });
  const [orderForm, setOrderForm] = useState({ itemId: '', qty: 1 });
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false); // حالة نافذة تأكيد إغلاق الفاتورة

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [menuData, invoicesData] = await Promise.all([
        cafeteriaService.getMenuItems(),
        cafeteriaService.getDailyInvoices()
      ]);
      setMenuItems(menuData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error("فشل في تحميل بيانات الكافيتيريا:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // منطق إدارة القائمة (Menu Logic)
  // ==========================================
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.price) return;
    try {
      if (editingMenuId) {
        await cafeteriaService.updateMenuItem(editingMenuId, {
          name: menuForm.name,
          price: Number(menuForm.price)
        });
        setEditingMenuId(null);
      } else {
        await cafeteriaService.addMenuItem({
          name: menuForm.name,
          price: Number(menuForm.price)
        });
      }
      setMenuForm({ name: '', price: '' });
      loadData();
    } catch (error) {
      console.error("خطأ في حفظ الصنف:", error);
    }
  };

  const handleEditMenuClick = (item) => {
    setEditingMenuId(item.id);
    setMenuForm({ name: item.name, price: item.price });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelMenuEdit = () => {
    setEditingMenuId(null);
    setMenuForm({ name: '', price: '' });
  };

  const handleDeleteMenu = async () => {
    if (!itemToDelete) return;
    try {
      await cafeteriaService.deleteMenuItem(itemToDelete.id);
      setItemToDelete(null);
      loadData();
    } catch (error) {
      console.error("خطأ في الحذف:", error);
    }
  };

  // ==========================================
  // منطق نقطة البيع (POS Logic)
  // ==========================================
  const activeInvoice = invoices.find(inv => inv.status === 'open');

  const handleCreateInvoice = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await cafeteriaService.createInvoice(today);
      loadData();
    } catch (error) {
      console.error("خطأ في فتح الفاتورة:", error);
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    if (!activeInvoice || !orderForm.itemId || orderForm.qty < 1) return;

    const selectedItem = menuItems.find(item => item.id === orderForm.itemId);
    if (!selectedItem) return;

    const newOrder = {
      id: Date.now().toString(),
      itemName: selectedItem.name,
      priceAtTime: selectedItem.price,
      qty: Number(orderForm.qty),
      total: selectedItem.price * Number(orderForm.qty)
    };

    const updatedOrders = [...activeInvoice.orders, newOrder];
    const newTotal = updatedOrders.reduce((sum, order) => sum + order.total, 0);

    try {
      await cafeteriaService.updateInvoiceOrders(activeInvoice.id, updatedOrders, newTotal);
      setOrderForm({ itemId: '', qty: 1 });
      loadData();
    } catch (error) {
      console.error("خطأ في إضافة الطلب:", error);
    }
  };

  // فتح نافذة التأكيد بدلاً من window.confirm
  const handleOpenCloseConfirm = () => {
    setShowCloseConfirm(true);
  };

  // التنفيذ الفعلي للإغلاق
  const confirmCloseInvoice = async () => {
    if (!activeInvoice) return;
    try {
      await cafeteriaService.closeInvoice(activeInvoice.id, activeInvoice.totalSales);
      setShowCloseConfirm(false);
      loadData();
    } catch (error) {
      console.error("خطأ في إغلاق الفاتورة:", error);
    }
  };

  if (loading) return <div className="text-brand-blue font-bold p-6">جاري مزامنة السجلات المالية...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-2xl font-bold text-brand-blue">إدارة الكافيتيريا</h1>
        
        <div className="flex bg-slate-100 p-1 rounded-lg w-full lg:w-auto">
          <button 
            onClick={() => setActiveTab('pos')} 
            className={`flex-1 lg:flex-none px-6 py-2 rounded-md font-bold text-sm transition-colors cursor-pointer ${activeTab === 'pos' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-brand-blue'}`}
          >
            المبيعات اليومية
          </button>
          <button 
            onClick={() => setActiveTab('menu')} 
            className={`flex-1 lg:flex-none px-6 py-2 rounded-md font-bold text-sm transition-colors cursor-pointer ${activeTab === 'menu' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-brand-blue'}`}
          >
            قائمة الأسعار
          </button>
        </div>
      </div>

      {activeTab === 'pos' && (
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-slate-100">
            {!activeInvoice ? (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">لا توجد فاتورة مفتوحة لهذا اليوم.</p>
                <button onClick={handleCreateInvoice} className="bg-brand-blue text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-blue-dark hover:scale-105 transition-all cursor-pointer">
                  + فتح فاتورة يومية جديدة
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-lg text-brand-blue">فاتورة اليوم <span className="text-sm font-normal text-slate-500 mr-2">({activeInvoice.date})</span></h3>
                  <div className="text-left">
                    <span className="block text-xs text-slate-400">الإجمالي الحالي</span>
                    <span className="text-2xl font-bold text-green-600">{activeInvoice.totalSales.toLocaleString()} ل.س</span>
                  </div>
                </div>

                <form onSubmit={handleAddOrder} className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <select 
                      value={orderForm.itemId} 
                      onChange={(e) => setOrderForm({...orderForm, itemId: e.target.value})}
                      className="w-full p-3 rounded-lg border border-slate-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                      required
                    >
                      <option value="">-- اختر المشروب --</option>
                      {menuItems.map(item => (
                        <option key={item.id} value={item.id}>{item.name} - {item.price.toLocaleString()} ل.س</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full lg:w-32">
                    <input 
                      type="number" 
                      min="1" 
                      value={orderForm.qty} 
                      onChange={(e) => setOrderForm({...orderForm, qty: e.target.value})}
                      className="w-full p-3 rounded-lg border border-slate-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                      placeholder="العدد"
                      required
                    />
                  </div>
                  <button type="submit" className="bg-brand-gold text-brand-blue-dark font-bold px-6 py-3 rounded-lg hover:bg-brand-gold-light cursor-pointer">
                    إضافة الطلب
                  </button>
                </form>

                {activeInvoice.orders?.length > 0 && (
                  <div className="mt-6 bg-slate-50 rounded-lg p-4">
                    <h4 className="font-bold text-sm text-slate-500 mb-3">الطلبات المسجلة:</h4>
                    <ul className="space-y-2">
                      {activeInvoice.orders.map((order) => (
                        <li key={order.id} className="flex justify-between items-center bg-white p-3 rounded border border-slate-100 shadow-sm">
                          <span className="font-medium">{order.itemName} <span className="text-xs text-slate-400 mx-2">x{order.qty}</span></span>
                          <span className="font-bold text-slate-700">{order.total.toLocaleString()} ل.س</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 text-left">
                      <button onClick={handleOpenCloseConfirm} className="bg-absent-text text-white px-6 py-2 rounded-lg font-bold hover:bg-red-800 transition-colors cursor-pointer">
                        إنهاء فاتورة اليوم
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <h3 className="font-bold text-xl text-brand-blue mt-8 mb-4">أرشيف الفواتير المغلقة</h3>
          <div className="overflow-x-auto bg-surface rounded-xl shadow-sm border border-slate-100">
            <table className="w-full block lg:table text-right text-sm">
              <thead className="hidden lg:table-header-group">
                <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-left">إجمالي الإيرادات</th>
                </tr>
              </thead>
              <tbody className="block lg:table-row-group">
                {invoices.filter(inv => inv.status === 'closed').length === 0 ? (
                   <tr className="block lg:table-row">
                     <td colSpan="3" className="px-6 py-8 text-center text-slate-400 block lg:table-cell">لا توجد فواتير سابقة.</td>
                   </tr>
                ) : (
                  invoices.filter(inv => inv.status === 'closed').map(invoice => (
                    <tr key={invoice.id} className="block lg:table-row border-b border-slate-100 hover:bg-slate-50">
                      <td className="flex lg:table-cell justify-between items-center py-3 px-4 lg:py-4 border-b border-slate-100 lg:border-none">
                        <span className="lg:hidden font-bold text-slate-400">التاريخ</span>
                        <span dir="ltr" className="font-medium text-slate-700">{invoice.date}</span>
                      </td>
                      <td className="flex lg:table-cell justify-between items-center py-3 px-4 lg:py-4 border-b border-slate-100 lg:border-none">
                        <span className="lg:hidden font-bold text-slate-400">الحالة</span>
                        <span className="text-xs font-bold px-2 py-1 bg-slate-200 text-slate-600 rounded">مغلقة</span>
                      </td>
                      <td className="flex lg:table-cell justify-between items-center py-3 px-4 lg:py-4 text-left">
                        <span className="lg:hidden font-bold text-slate-400">الإجمالي</span>
                        <span className="font-bold text-green-600">{invoice.totalSales.toLocaleString()} ل.س</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="space-y-6">
          <form onSubmit={handleMenuSubmit} className="bg-surface p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 items-end transition-all">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-slate-700 mb-2">اسم المشروب/الصنف</label>
              <input 
                type="text" 
                value={menuForm.name} 
                onChange={(e) => setMenuForm({...menuForm, name: e.target.value})}
                className="w-full p-3 rounded-lg border border-slate-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                placeholder="مثال: متة"
                required
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-slate-700 mb-2">السعر (ليرة سورية)</label>
              <input 
                type="number" 
                min="0"
                value={menuForm.price} 
                onChange={(e) => setMenuForm({...menuForm, price: e.target.value})}
                className="w-full p-3 rounded-lg border border-slate-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none"
                placeholder="مثال: 5000"
                required
              />
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto">
              {editingMenuId && (
                <button type="button" onClick={cancelMenuEdit} className="flex-1 lg:flex-none bg-slate-200 text-slate-600 font-bold px-6 py-3 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer">
                  إلغاء
                </button>
              )}
              <button type="submit" className={`flex-1 lg:flex-none text-white font-bold px-8 py-3 rounded-lg transition-colors cursor-pointer ${editingMenuId ? 'bg-brand-gold text-brand-blue-dark hover:bg-brand-gold-light' : 'bg-brand-blue hover:bg-brand-blue-dark'}`}>
                {editingMenuId ? 'حفظ التعديلات' : 'إضافة للقائمة'}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto bg-surface rounded-xl shadow-sm border border-slate-100">
            <table className="w-full block lg:table text-right text-sm">
              <thead className="hidden lg:table-header-group">
                <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                  <th className="px-6 py-4">الصنف</th>
                  <th className="px-6 py-4">السعر المعتمد</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="block lg:table-row-group">
                {menuItems.length === 0 ? (
                   <tr className="block lg:table-row">
                     <td colSpan="3" className="px-6 py-8 text-center text-slate-400 block lg:table-cell">القائمة فارغة. أضف أصنافاً للبدء.</td>
                   </tr>
                ) : (
                  menuItems.map(item => (
                    <tr key={item.id} className="block lg:table-row border-b border-slate-100 hover:bg-slate-50">
                      <td className="flex lg:table-cell justify-between items-center py-3 px-4 lg:py-4 border-b border-slate-100 lg:border-none font-bold text-slate-700">
                        <span className="lg:hidden font-bold text-slate-400">الصنف</span>
                        {item.name}
                      </td>
                      <td className="flex lg:table-cell justify-between items-center py-3 px-4 lg:py-4 border-b border-slate-100 lg:border-none text-brand-gold font-bold">
                        <span className="lg:hidden font-bold text-slate-400">السعر</span>
                        {item.price.toLocaleString()} ل.س
                      </td>
                      <td className="flex lg:table-cell justify-center items-center py-4 lg:py-4">
                        <div className="flex items-center justify-center gap-4 lg:gap-6">
                          <button onClick={() => handleEditMenuClick(item)} className="text-brand-blue font-medium hover:text-brand-blue-dark hover:scale-110 transition-transform cursor-pointer">
                            تعديل
                          </button>
                          <button onClick={() => setItemToDelete(item)} className="text-absent-text font-medium hover:text-red-800 hover:scale-110 transition-transform cursor-pointer">
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة تأكيد حذف الصنف */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">تأكيد الحذف</h3>
            <p className="text-sm text-slate-600 mb-6">
              هل أنت متأكد من حذف الصنف <span className="font-bold text-absent-text">{itemToDelete.name}</span>؟ لن يظهر هذا الصنف في فواتير اليوم الجديدة، لكنه سيبقى محفوظاً في أرشيف الفواتير السابقة.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setItemToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer">إلغاء</button>
              <button onClick={handleDeleteMenu} className="px-4 py-2 bg-absent-text text-white font-semibold rounded-md hover:bg-red-800 cursor-pointer">حذف الصنف</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد إغلاق الفاتورة (الجديدة) */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-surface rounded-xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">تأكيد إنهاء الفاتورة</h3>
            <p className="text-sm text-slate-600 mb-6">
              هل أنت متأكد من إنهاء فاتورة اليوم؟ <span className="block mt-2 font-bold text-absent-text">تحذير: لن تتمكن من إضافة أي طلبات جديدة لهذه الفاتورة بعد الإغلاق.</span>
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCloseConfirm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer">تراجع</button>
              <button onClick={confirmCloseInvoice} className="px-4 py-2 bg-absent-text text-white font-semibold rounded-md hover:bg-red-800 cursor-pointer">نعم، أنهِ الفاتورة</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}