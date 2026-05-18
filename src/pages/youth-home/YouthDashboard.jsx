import { useState, useEffect } from 'react';
import { cafeteriaService } from '../../services/cafeteriaService';
import { expenseService } from '../../services/expenseService';

export default function YouthDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    income: 0,
    expenses: 0,
    netProfit: 0,
    recentTransactions: []
  });

  useEffect(() => {
    calculateFinancials();
  }, []);

  const calculateFinancials = async () => {
    setLoading(true);
    try {
      // 1. جلب البيانات من الخدمات المستقلة
      const [invoices, expenses] = await Promise.all([
        cafeteriaService.getDailyInvoices(),
        expenseService.getExpenses()
      ]);

      // 2. تحديد النطاق الزمني (آخر 30 يوماً)
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      // 3. فلترة وحساب الدخل (الفواتير المغلقة فقط في آخر 30 يوماً)
      const validInvoices = invoices.filter(
        inv => inv.status === 'closed' && inv.date >= thirtyDaysAgoStr
      );
      const totalIncome = validInvoices.reduce((sum, inv) => sum + inv.totalSales, 0);

      // 4. فلترة وحساب المصاريف (في آخر 30 يوماً)
      const validExpenses = expenses.filter(
        exp => exp.date >= thirtyDaysAgoStr
      );
      const totalExpenses = validExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      // 5. دمج أحدث العمليات لعرضها في السجل (آخر 5 عمليات إجمالاً)
      // تحويل الفواتير والمصاريف إلى شكل موحد للفرز
      const combinedTransactions = [
        ...validInvoices.map(inv => ({ ...inv, type: 'income', label: 'إيرادات كافيتيريا', amount: inv.totalSales })),
        ...validExpenses.map(exp => ({ ...exp, type: 'expense', label: exp.title, amount: exp.amount }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      // 6. تحديث الحالة النهائية
      setStats({
        income: totalIncome,
        expenses: totalExpenses,
        netProfit: totalIncome - totalExpenses,
        recentTransactions: combinedTransactions
      });

    } catch (error) {
      console.error("فشل في معالجة البيانات المالية:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-brand-blue font-bold p-6">جاري معالجة البيانات والحسابات المالية...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-blue">اللوحة المالية والإحصائيات</h1>
        <span className="bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-sm font-bold">
          تقرير آخر 30 يوماً
        </span>
      </div>

      {/* المؤشرات الرئيسية (KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* بطاقة الدخل */}
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
          <span className="text-slate-500 font-bold text-sm mb-2">إجمالي الإيرادات (الكافيتيريا)</span>
          <span className="text-3xl font-bold text-green-600">
            {stats.income.toLocaleString()} <span className="text-sm">ل.س</span>
          </span>
        </div>

        {/* بطاقة المصاريف */}
        <div className="bg-surface rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
          <span className="text-slate-500 font-bold text-sm mb-2">إجمالي المصروفات والتشغيل</span>
          <span className="text-3xl font-bold text-absent-text">
            {stats.expenses.toLocaleString()} <span className="text-sm">ل.س</span>
          </span>
        </div>

        {/* بطاقة صافي الربح/الخسارة */}
        <div className={`rounded-xl p-6 shadow-sm border flex flex-col justify-center ${stats.netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <span className={`font-bold text-sm mb-2 ${stats.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            صافي {stats.netProfit >= 0 ? 'الربح' : 'الخسارة'}
          </span>
          <span className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {Math.abs(stats.netProfit).toLocaleString()} <span className="text-sm">ل.س</span>
          </span>
        </div>
      </div>

      {/* سجل أحدث الحركات (Recent Transactions) */}
      <div className="bg-surface rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-700">أحدث الحركات المالية</h2>
        </div>
        <div className="p-0">
          {stats.recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-slate-500">لا توجد حركات مالية في آخر 30 يوماً.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {stats.recentTransactions.map((trx, index) => (
                <li key={index} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{trx.label}</span>
                    <span className="text-xs text-slate-400 mt-1" dir="ltr">{trx.date}</span>
                  </div>
                  <div className={`font-bold ${trx.type === 'income' ? 'text-green-600' : 'text-absent-text'}`}>
                    {trx.type === 'income' ? '+' : '-'}{trx.amount.toLocaleString()} ل.س
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}