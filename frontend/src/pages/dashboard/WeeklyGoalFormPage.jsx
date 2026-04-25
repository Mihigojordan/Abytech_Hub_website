import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import WeeklyGoalForm from '../../components/dashboard/weeklyGoal/WeeklyGoalForm';
import weeklyGoalService from '../../services/weeklyGoalService';
import  useAuth  from '../../context/AdminAuthContext';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const WeeklyGoalFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch goal data when editing
  useEffect(() => {
    if (isEditMode) {
      const fetchGoal = async () => {
        try {
          setIsLoading(true);
          const data = await weeklyGoalService.getWeeklyGoalById(id);
          setGoal(data);
        } catch (error) {
          console.error('Failed to fetch goal:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load goal data',
            confirmButtonColor: '#f97316',
          });
          navigate('/admin/dashboard/weekly-goals');
        } finally {
          setIsLoading(false);
        }
      };
      fetchGoal();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      // Prepare submit data
      const submitData = {
        title: formData.title,
        description: formData.description || '',
        weekStart: new Date(formData.weekStart).toISOString(),
        weekEnd: new Date(formData.weekEnd).toISOString(),
        status: formData.status,
        progress: formData.progress || 0,
        tasks: formData.tasks?.map(t => ({
          title: t.title || '',
          description: t.description || '',
          done: t.done || false,
        })) || [],
        reviewNotes: JSON.stringify(formData.reviewNotes?.map(r => ({
          adminId: r.adminId || '',
          name: r.name || '',
          notes: r.notes || '',
        })) || []),
      };

      if (isEditMode) {
        await weeklyGoalService.updateWeeklyGoal(id, submitData);
        await Swal.fire({
          icon: 'success',
          title: 'Goal Updated!',
          text: 'Your weekly goal has been successfully updated',
          confirmButtonColor: '#f97316',
        });
      } else {
        await weeklyGoalService.createWeeklyGoal(submitData);
        await Swal.fire({
          icon: 'success',
          title: 'Goal Created!',
          text: 'Your weekly goal has been successfully created',
          confirmButtonColor: '#f97316',
        });
      }

      navigate('/admin/dashboard/weekly-goals');
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to save goal',
        confirmButtonColor: '#f97316',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/dashboard/weekly-goals');
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: bg, fontFamily: "'Barlow',sans-serif" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full animate-spin"
            style={{
              border: `4px solid ${border}`,
              borderTopColor: ORG,
            }}
          />
          <p style={{ ...ba(13, 600, { color: text2 }) }}>Loading goal...</p>
        </div>
      </div>
    );
  }

  return (
    <WeeklyGoalForm
      goal={goal}
      currentAdmin={user}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
    />
  );
};

export default WeeklyGoalFormPage;
