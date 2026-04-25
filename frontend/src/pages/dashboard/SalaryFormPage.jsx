import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, User, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import salaryService from '../../services/salaryService';
import adminAuthService from '../../services/adminAuthService';
import useAdminAuth from '../../context/AdminAuthContext';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

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
    const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

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

    const inputStyle = {
        background: bg3,
        border: '1px solid ' + border,
        color: textC,
        borderRadius: 4,
        outline: 'none',
        padding: '10px 12px',
        width: '100%',
        ...ba(14, 400, {}),
    };

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
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: bg }}
            >
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="w-10 h-10 border-4 rounded-full animate-spin"
                        style={{ borderColor: border, borderTopColor: ORG }}
                    />
                    <p style={{ ...ba(13, 600, { color: text2 }) }}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: bg }}>
            {/* Header */}
            <div style={{ background: bg2, borderBottom: '1px solid ' + border, position: 'relative', overflow: 'hidden' }}>
                <div className="mx-auto px-4 sm:px-6 py-6 relative">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/admin/dashboard/salary')}
                            className="flex items-center gap-2 px-4 py-2 transition-opacity hover:opacity-80"
                            style={{
                                ...ba(13, 500, { color: textC }),
                                background: bg3,
                                border: '1px solid ' + border,
                                borderRadius: 4,
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </motion.button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                                >
                                    <Sparkles className="w-5 h-5" style={{ color: ORG }} />
                                </motion.div>
                                <h1 style={{ ...bb('clamp(22px,3vw,36px)', { color: ORG, letterSpacing: 2 }) }}>
                                    {isEditMode ? 'Edit Salary Request' : isSuperAdmin ? 'Record Salary' : 'Request Salary'}
                                </h1>
                            </div>
                            <p style={{ ...ba(13, 400, { color: text2 }) }}>
                                {isEditMode
                                    ? 'Update the salary request details below.'
                                    : isSuperAdmin
                                        ? 'Record a salary entry for an employee.'
                                        : 'Fill in your salary request details.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-4 sm:px-6 py-10 max-w-2xl">
                <motion.form
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4, overflow: 'hidden' }}
                >
                    <div className="p-8 space-y-6">
                        {/* Employee selector — SuperAdmin only, create mode */}
                        {isSuperAdmin && !isEditMode && (
                            <div>
                                <label
                                    className="flex items-center gap-2 mb-2"
                                    style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, display: 'flex' }) }}
                                >
                                    <User className="w-4 h-4" style={{ color: ORG }} />
                                    Employee *
                                </label>
                                <select
                                    required
                                    value={formData.targetAdminId}
                                    onChange={e => handleChange('targetAdminId', e.target.value)}
                                    style={inputStyle}
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
                            <label
                                className="flex items-center gap-2 mb-2"
                                style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, display: 'flex' }) }}
                            >
                                <Calendar className="w-4 h-4" style={{ color: ORG }} />
                                Pay Period *
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    required
                                    value={formData.month}
                                    onChange={e => handleChange('month', e.target.value)}
                                    style={inputStyle}
                                >
                                    {MONTHS.slice(1).map((m, i) => (
                                        <option key={i + 1} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <input
                                    required
                                    type="number"
                                    placeholder="Year"
                                    value={formData.year}
                                    onChange={e => handleChange('year', e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label
                                className="flex items-center gap-2 mb-2"
                                style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, display: 'flex' }) }}
                            >
                                <DollarSign className="w-4 h-4" style={{ color: ORG }} />
                                Amount (RWF) *
                            </label>
                            <input
                                required
                                type="number"
                                min="0"
                                placeholder="e.g. 500000"
                                value={formData.amount}
                                onChange={e => handleChange('amount', e.target.value)}
                                style={inputStyle}
                            />
                        </div>

                        {/* Reason */}
                        <div>
                            <label
                                className="flex items-center gap-2 mb-2"
                                style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2, display: 'flex' }) }}
                            >
                                <FileText className="w-4 h-4" style={{ color: ORG }} />
                                Reason
                            </label>
                            <textarea
                                rows={4}
                                placeholder="My pay date has arrived..."
                                value={formData.reason}
                                onChange={e => handleChange('reason', e.target.value)}
                                style={{ ...inputStyle, resize: 'none' }}
                            />
                        </div>

                        {/* Info note */}
                        <div
                            className="p-4"
                            style={{
                                ...ba(13, 400, { color: ORG }),
                                background: 'rgba(232,98,26,.08)',
                                border: '1px solid rgba(232,98,26,.2)',
                                borderRadius: 4,
                            }}
                        >
                            Note: Bonus and deductions will be set by the manager when approving the request.
                        </div>

                        {/* Salary breakdown / amount preview */}
                        <div
                            className="flex items-center justify-between p-4"
                            style={{ background: bg2, border: '1px solid ' + border, borderRadius: 4 }}
                        >
                            <span style={{ ...ba(13, 500, { color: text2 }) }}>Requested Amount</span>
                            <span style={{ ...ba(18, 700, { color: textC }) }}>{formatCurrency(netPreview)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        className="px-8 py-5 flex justify-end gap-4"
                        style={{ background: bg3, borderTop: '1px solid ' + border }}
                    >
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/admin/dashboard/salary')}
                            className="px-6 py-3 transition-opacity hover:opacity-80"
                            style={{
                                ...ba(13, 600, { color: textC }),
                                background: bg3,
                                border: '1px solid ' + border,
                                borderRadius: 4,
                                cursor: 'pointer',
                            }}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={isSubmitting || !formData.amount || (isSuperAdmin && !isEditMode && !formData.targetAdminId)}
                            className="flex items-center gap-2 px-7 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                            style={{
                                ...ba(13, 600, { color: '#fff' }),
                                background: ORG,
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer',
                            }}
                        >
                            {isSubmitting ? (
                                <div
                                    className="w-4 h-4 border-2 rounded-full animate-spin"
                                    style={{ borderColor: 'rgba(255,255,255,.3)', borderTopColor: '#fff' }}
                                />
                            ) : (
                                <DollarSign className="w-4 h-4" />
                            )}
                            {isEditMode ? 'Save Changes' : isSuperAdmin ? 'Record Salary' : 'Submit Request'}
                        </motion.button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default SalaryFormPage;
