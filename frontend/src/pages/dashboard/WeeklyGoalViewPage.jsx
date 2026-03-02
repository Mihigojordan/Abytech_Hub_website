import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import WeeklyGoalView from '../../components/dashboard/weeklyGoal/WeeklyGoalView';
import weeklyGoalService from '../../services/weeklyGoalService';

const WeeklyGoalViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-stone-500">Loading goal...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-stone-600">Goal not found</p>
          <button
            onClick={handleBack}
            className="mt-4 text-orange-500 hover:text-orange-600 font-semibold"
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
