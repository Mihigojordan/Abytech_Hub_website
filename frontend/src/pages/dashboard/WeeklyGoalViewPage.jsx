import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import WeeklyGoalView from '../../components/dashboard/weeklyGoal/WeeklyGoalView';
import weeklyGoalService from '../../services/weeklyGoalService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const WeeklyGoalViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/admin/dashboard/weekly-goals/edit/${id}`);
  };

  const handleBack = () => {
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

  if (!goal) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: bg, fontFamily: "'Barlow',sans-serif" }}
      >
        <div className="text-center">
          <p style={{ ...ba(16, 600, { color: textC }) }}>Goal not found</p>
          <button
            onClick={handleBack}
            className="mt-4 font-semibold"
            style={{
              ...ba(14, 600, { color: ORG }),
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ← Back to Goals
          </button>
        </div>
      </div>
    );
  }

  return (
    <WeeklyGoalView
      goal={goal}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  );
};

export default WeeklyGoalViewPage;
