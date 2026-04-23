import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, User, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import salaryService from '../../services/salaryService';
import adminAuthService from '../../services/adminAuthService';
import useAdminAuth from '../../context/AdminAuthContext';

const PRIMARY = 'rgb(249, 115, 22)';
const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatCurrency = (value) => {
    const amount = Number(value);
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(Number.isFinite(amount) ? amount : 0);
};

const SalaryFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isSuperAdmin } = useAdminAuth();
    const isEditMode = Boolean(id);

    const [adminList, setAdminList] = useState([]);
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        targetAdminId: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        reason: '',
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                if (isSuperAdmin) {
                    const res = await adminAuthService.getAllAdmins();
                    setAdminList(res.admins || res || []);
                }
                if (isEditMode) {
                    const salary = await salaryService.getSalaryById(id);
                    setFormData({
                        targetAdminId: salary.adminId || '',
                        amount: salary.amount,
                        month: salary.month,
                        year: salary.year,
                        reason: salary.reason || '',
                    });
                }
            } catch (err) {
                alert(err.message || 'Failed to load data');
                navigate('/admin/dashboard/salary');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id, isEditMode, isSuperAdmin, navigate]);

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.month || !formData.year) return;
        if (isSuperAdmin && !isEditMode && !formData.targetAdminId) return;

        setIsSubmitting(true);
        try {
            const payload = {
                amount: parseFloat(formData.amount),
                month: parseInt(formData.month),
                year: parseInt(formData.year),
                reason: formData.reason,
            };

            if (isEditMode) {
                await salaryService.updateSalary(id, payload);
            } else {
                if (isSuperAdmin && formData.targetAdminId) {
                    payload.targetAdminId = formData.targetAdminId;
                }
                await salaryService.createSalary(payload);
            }

            navigate('/admin/dashboard/salary');
        } catch (err) {
            alert(err.message || 'Failed to save salary');
        } finally {
            setIsSubmitting(false);
        }
    };

    const netPreview = (parseFloat(formData.amount) || 0);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-amber-50/20">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/40 to-amber-100/40 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="mx-auto px-4 sm:px-6 py-6 relative">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/admin/dashboard/salary')}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </motion.button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}>
                                    <Sparkles className="w-5 h-5" style={{ color: PRIMARY }} />
                                </motion.div>
                                <h1 className="text-2xl font-bold text-orange-500">
                                    {isEditMode ? 'Edit Salary Request' : isSuperAdmin ? 'Record Salary' : 'Request Salary'}
                                </h1>
                            </div>
                            <p className="text-sm text-gray-500">
                                {isEditMode ? 'Update the salary request details below.' : isSuperAdmin ? 'Record a salary entry for an employee.' : 'Fill in your salary request details.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-4 sm:px-6 py-10 max-w-2xl">
                <motion.form
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="p-8 space-y-6">
                        {/* Employee selector — SuperAdmin only, create mode */}
                        {isSuperAdmin && !isEditMode && (
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <User className="w-4 h-4 text-orange-400" /> Employee *
                                </label>
                                <select
                                    required
                                    value={formData.targetAdminId}
                                    onChange={e => handleChange('targetAdminId', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                                >
                                    <option value="">— Select employee —</option>
                                    {adminList.map(a => (
                                        <option key={a.id} value={a.id}>{a.adminName} ({a.adminEmail})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Period */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 text-orange-400" /> Pay Period *
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    required
                                    value={formData.month}
                                    onChange={e => handleChange('month', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                                >
                                    {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                                </select>
                                <input
                                    required
                                    type="number"
                                    placeholder="Year"
                                    value={formData.year}
                                    onChange={e => handleChange('year', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                                />
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <DollarSign className="w-4 h-4 text-orange-400" /> Amount (RWF) *
                            </label>
                            <input
                                required
                                type="number"
                                min="0"
                                placeholder="e.g. 500000"
                                value={formData.amount}
                                onChange={e => handleChange('amount', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none"
                            />
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <FileText className="w-4 h-4 text-orange-400" /> Reason
                            </label>
                            <textarea
                                rows={4}
                                placeholder="My pay date has arrived..."
                                value={formData.reason}
                                onChange={e => handleChange('reason', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none"
                            />
                        </div>

                        {/* Info note */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                            Note: Bonus and deductions will be set by the manager when approving the request.
                        </div>

                        {/* Amount preview */}
                        <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-sm text-gray-500 font-medium">Requested Amount</span>
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(netPreview)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-4">
                        <motion.button
                            type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/admin/dashboard/salary')}
                            className="px-6 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-white"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            disabled={isSubmitting || !formData.amount || (isSuperAdmin && !isEditMode && !formData.targetAdminId)}
                            className="flex items-center gap-2 px-7 py-3 text-sm font-medium text-white bg-orange-500 rounded-xl shadow-md hover:bg-orange-600 disabled:opacity-50"
                        >
                            {isSubmitting
                                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <DollarSign className="w-4 h-4" />
                            }
                            {isEditMode ? 'Save Changes' : isSuperAdmin ? 'Record Salary' : 'Submit Request'}
                        </motion.button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default SalaryFormPage;
