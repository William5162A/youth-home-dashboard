import { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import EventForm from '../components/shared/EventForm';

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLLECTION_NAME = 'activities';
  const EVENT_LABEL = 'نشاط';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await eventService.getEvents(COLLECTION_NAME);
      setActivities(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingActivity(null);
    loadData();
  };

  if (loading) return <div className="text-brand-blue font-bold">جاري تحميل السجلات...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-blue">إدارة النشاطات</h1>
        {!showForm && (
          <button onClick={() => { setEditingActivity(null); setShowForm(true); }} className="rounded-md bg-brand-gold px-4 py-2 text-brand-blue-dark font-bold hover:bg-brand-gold-light hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm">
            + إضافة نشاط جديد
          </button>
        )}
      </div>

      {showForm ? (
        <EventForm collectionName={COLLECTION_NAME} eventTypeLabel={EVENT_LABEL} onCancel={() => setShowForm(false)} onSuccess={handleSuccess} initialData={editingActivity} />
      ) : (
        <section className="rounded-xl bg-surface shadow-sm overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
          <table className="w-full block lg:table text-right text-sm">
  {/* رأس الجدول يختفي في الجوال ويظهر كـ table-header-group في الشاشات الكبيرة */}
              <thead className="hidden lg:table-header-group">
                <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                  <th className="px-6 py-4">العنوان</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4 text-center">المشاركين</th>
                  <th className="px-6 py-4 text-center">التقييم</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              
              {/* جسم الجدول يصبح block في الجوال ليعرض كل صف كبطاقة */}
              <tbody className="block lg:table-row-group">
                {activities.length === 0 ? (
                  <tr className="block lg:table-row">
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 block lg:table-cell">لا توجد نشاطات مسجلة.</td>
                  </tr>
                ) : (
                  activities.map(activity => (
                    <tr key={activity.id} className="block lg:table-row bg-surface border border-slate-200 lg:border-none rounded-xl lg:rounded-none mb-4 lg:mb-0 p-4 lg:p-0 shadow-sm lg:shadow-none hover:bg-slate-50 transition-colors">
                      
                      <td className="flex lg:table-cell justify-between items-center py-3 lg:px-6 lg:py-4 border-b border-slate-100 lg:border-none font-medium">
                        {/* هذا هو الـ Label المخفي الذي يظهر فقط في الجوال */}
                        <span className="lg:hidden text-xs font-bold text-slate-400 uppercase">العنوان</span>
                        <span>{activity.title}</span>
                      </td>
                      
                      <td className="flex lg:table-cell justify-between items-center py-3 lg:px-6 lg:py-4 border-b border-slate-100 lg:border-none text-slate-500">
                        <span className="lg:hidden text-xs font-bold text-slate-400 uppercase">التاريخ</span>
                        <span dir="ltr">{activity.date}</span>
                      </td>
                      
                      <td className="flex lg:table-cell justify-between items-center py-3 lg:px-6 lg:py-4 border-b border-slate-100 lg:border-none font-bold text-slate-700">
                        <span className="lg:hidden text-xs font-bold text-slate-400 uppercase">المشاركين</span>
                        <span className="lg:mx-auto">{activity.participantsCount}</span>
                      </td>
                      
                      <td className="flex lg:table-cell justify-between items-center py-3 lg:px-6 lg:py-4 border-b border-slate-100 lg:border-none text-brand-gold">
                        <span className="lg:hidden text-xs font-bold text-slate-400 uppercase">التقييم</span>
                        <span className="lg:mx-auto">{'⭐'.repeat(activity.rating)}</span>
                      </td>
                      
                      <td className="flex lg:table-cell justify-center items-center py-4 lg:px-6 lg:py-4">
                        <button onClick={() => { setEditingActivity(activity); setShowForm(true); }} className="text-brand-blue font-medium hover:text-brand-blue-dark hover:scale-110 transition-transform cursor-pointer">
                          تعديل
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}