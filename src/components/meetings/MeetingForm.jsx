import { useState, useEffect } from 'react';
import { meetingService } from '../../services/meetingService';

export default function MeetingForm({ activeMembers, onCancel, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0], // تاريخ اليوم افتراضياً
    notes: ''
  });

  // كائن لتخزين حالة الحضور لكل عضو { memberId: 'absent' | 'present' }
  const [attendance, setAttendance] = useState({});

  // تعيين الحالة الافتراضية (غائب) لجميع الأعضاء عند تحميل المكون
  useEffect(() => {
    const initialAttendance = {};
    activeMembers.forEach(member => {
      initialAttendance[member.id] = 'absent';
    });
    setAttendance(initialAttendance);
  }, [activeMembers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAttendanceChange = (memberId, status) => {
    setAttendance(prev => ({ ...prev, [memberId]: status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const meetingPayload = {
        ...formData,
        attendance: attendance // حفظ مصفوفة الحضور كاملة
      };
      
      await meetingService.addMeeting(meetingPayload);
      onSuccess();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء حفظ الاجتماع. تحقق من الاتصال.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-brand-blue">تسجيل اجتماع جديد</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-absent-text transition-colors cursor-pointer">
          ✕ إغلاق
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-absent-bg text-absent-text rounded-md text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* معلومات الاجتماع */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">عنوان الاجتماع *</label>
            <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all" placeholder="مثال: اجتماع الإثنين الدوري" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">التاريخ *</label>
            <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all" dir="ltr" />
          </div>
          <div className="space-y-1 lg:col-span-2">
            <label className="text-sm font-medium text-slate-700">ملاحظات (اختياري)</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="2" className="w-full p-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-blue outline-none transition-all resize-none"></textarea>
          </div>
        </div>

        {/* قائمة الحضور */}
        <div>
          <h3 className="text-lg font-bold text-brand-blue mb-4">سجل الحضور ({activeMembers.length} أعضاء)</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full text-right text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-brand-blue text-white">
                  <th className="px-6 py-3 font-semibold">الاسم</th>
                  <th className="px-6 py-3 font-semibold text-center">حاضر</th>
                  <th className="px-6 py-3 font-semibold text-center">غائب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activeMembers.map(member => {
                  const status = attendance[member.id];
                  const isPresent = status === 'present';
                  
                  return (
                    <tr 
                      key={member.id} 
                      className={`transition-colors duration-200 ${isPresent ? 'bg-present-bg' : 'bg-absent-bg'}`}
                    >
                      <td className={`px-6 py-4 font-medium ${isPresent ? 'text-present-text' : 'text-absent-text'}`}>
                        {member.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="radio" 
                          name={`attendance-${member.id}`} 
                          checked={isPresent}
                          onChange={() => handleAttendanceChange(member.id, 'present')}
                          className="w-5 h-5 accent-green-600 cursor-pointer hover:scale-110 transition-transform"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="radio" 
                          name={`attendance-${member.id}`} 
                          checked={!isPresent}
                          onChange={() => handleAttendanceChange(member.id, 'absent')}
                          className="w-5 h-5 accent-red-600 cursor-pointer hover:scale-110 transition-transform"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer">
            إلغاء
          </button>
          <button type="submit" disabled={loading || activeMembers.length === 0} className="px-8 py-2 bg-brand-blue text-white font-bold rounded-md hover:bg-brand-blue-dark hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:hover:scale-100">
            {loading ? 'جاري الحفظ...' : 'حفظ الاجتماع'}
          </button>
        </div>
      </form>
    </div>
  );
}