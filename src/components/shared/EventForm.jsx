import { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';

export default function EventForm({ collectionName, eventTypeLabel, onCancel, onSuccess, initialData = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    participantsCount: '',
    rating: '5',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (initialData?.id) {
        await eventService.updateEvent(collectionName, initialData.id, formData);
      } else {
        await eventService.addEvent(collectionName, formData);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(`حدث خطأ أثناء حفظ ${eventTypeLabel}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-brand-blue">
          {initialData ? `تعديل ${eventTypeLabel}` : `إضافة ${eventTypeLabel} جديد`}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-absent-text transition-colors cursor-pointer">
          ✕ إغلاق
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-absent-bg text-absent-text rounded-md text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">عنوان {eventTypeLabel} *</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all" />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">التاريخ *</label>
            <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all" dir="ltr" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">عدد المشاركين *</label>
            <input type="number" name="participantsCount" required min="0" value={formData.participantsCount} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all text-left" dir="ltr" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">التقييم (من 5) *</label>
            <select name="rating" required value={formData.rating} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all cursor-pointer">
              <option value="5">⭐⭐⭐⭐⭐ ممتاز (5)</option>
              <option value="4">⭐⭐⭐⭐ جيد جداً (4)</option>
              <option value="3">⭐⭐⭐ جيد (3)</option>
              <option value="2">⭐⭐ مقبول (2)</option>
              <option value="1">⭐ ضعيف (1)</option>
            </select>
          </div>

          <div className="space-y-1 lg:col-span-2">
            <label className="text-sm font-medium text-slate-700">ملاحظات والتفاصيل</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all resize-none"></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">
            إلغاء
          </button>
          <button type="submit" disabled={loading} className="px-8 py-2 bg-brand-blue text-white font-bold rounded-md hover:bg-brand-blue-dark hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:hover:scale-100">
            {loading ? 'جاري الحفظ...' : `حفظ ال${eventTypeLabel}`}
          </button>
        </div>
      </form>
    </div>
  );
}