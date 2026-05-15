import { useState, useEffect } from 'react';
import { memberService } from '../../services/memberService';

export default function MemberForm({ onCancel, onSuccess, initialData = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', fatherName: '', motherName: '', birthDate: '',
    whatsappNumber: '', landlineNumber: '', patronSaint: '',
    address: '', familyBookId: '', nationalId: '', studyField: ''
  });

  // تعبئة البيانات إذا كنا في وضع التعديل
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
        // تحديث عضو موجود
        await memberService.updateMember(initialData.id, formData);
      } else {
        // إضافة عضو جديد
        await memberService.addMember(formData);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-brand-blue">
          {initialData ? 'تعديل بيانات العضو' : 'إضافة عضو جديد'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-absent-text transition-colors cursor-pointer">
          ✕ إغلاق
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-absent-bg text-absent-text rounded-md text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">الاسم الثلاثي *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">اسم الأب</label>
            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">اسم الأم</label>
            <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">تاريخ الولادة *</label>
            <input type="date" name="birthDate" required value={formData.birthDate} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all" dir="ltr" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">رقم واتساب *</label>
            <input type="number" name="whatsappNumber" required value={formData.whatsappNumber} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none text-left transition-all" dir="ltr" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">رقم أرضي</label>
            <input type="number" name="landlineNumber" value={formData.landlineNumber} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none text-left transition-all" dir="ltr" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">الشفيع</label>
            <input type="text" name="patronSaint" value={formData.patronSaint} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">السكن</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">رقم دفتر العائلة</label>
            <input type="number" name="familyBookId" value={formData.familyBookId} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none text-left transition-all" dir="ltr" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">الرقم الوطني *</label>
            <input type="number" name="nationalId" required value={formData.nationalId} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none text-left transition-all" dir="ltr" />
          </div>
          <div className="space-y-1 lg:col-span-2">
            <label className="text-sm font-medium text-slate-700">الدراسة</label>
            <input type="text" name="studyField" value={formData.studyField} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">
            إلغاء
          </button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-md hover:bg-brand-blue-dark hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:hover:scale-100">
            {loading ? 'جاري الحفظ...' : (initialData ? 'حفظ' : 'حفظ العضو')}
          </button>
        </div>
      </form>
    </div>
  );
}