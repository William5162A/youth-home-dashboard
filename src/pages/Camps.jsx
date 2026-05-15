import { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import EventForm from '../components/shared/EventForm';

export default function Camps() {
  const [camps, setCamps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLLECTION_NAME = 'camps';
  const EVENT_LABEL = 'مخيم';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await eventService.getEvents(COLLECTION_NAME);
      setCamps(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingCamp(null);
    loadData();
  };

  if (loading) return <div className="text-brand-blue font-bold">جاري تحميل السجلات...</div>;

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-blue">إدارة المخيمات</h1>
        {!showForm && (
          <button onClick={() => { setEditingCamp(null); setShowForm(true); }} className="rounded-md bg-brand-gold px-4 py-2 text-brand-blue-dark font-bold hover:bg-brand-gold-light hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm">
            + إضافة مخيم جديد
          </button>
        )}
      </div>

      {showForm ? (
        <EventForm collectionName={COLLECTION_NAME} eventTypeLabel={EVENT_LABEL} onCancel={() => setShowForm(false)} onSuccess={handleSuccess} initialData={editingCamp} />
      ) : (
        <section className="rounded-xl bg-surface shadow-sm overflow-hidden border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                  <th className="px-6 py-4">العنوان</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4 text-center">المشاركين</th>
                  <th className="px-6 py-4 text-center">التقييم</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {camps.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">لا توجد مخيمات مسجلة.</td></tr>
                ) : (
                  camps.map(camp => (
                    <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{camp.title}</td>
                      <td className="px-6 py-4 text-slate-500" dir="ltr" style={{ textAlign: 'right' }}>{camp.date}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-700">{camp.participantsCount}</td>
                      <td className="px-6 py-4 text-center text-brand-gold">{'⭐'.repeat(camp.rating)}</td>
                      <td className="px-6 py-4 flex justify-center gap-3">
                        <button onClick={() => { setEditingCamp(camp); setShowForm(true); }} className="text-brand-blue font-medium hover:text-brand-blue-dark hover:scale-110 transition-transform cursor-pointer">تعديل</button>
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