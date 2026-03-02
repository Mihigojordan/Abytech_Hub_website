import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import meetingService from '../../services/meetingService';
import MeetingView from '../../components/dashboard/meeting/MeetingView';

const MeetingViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch meeting data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/admin/dashboard/meetings');
        return;
      }

      try {
        const meetingData = await meetingService.getMeetingById(id);
        setMeeting(meetingData);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to load meeting',
          confirmButtonColor: '#f97316',
        }).then(() => {
          navigate('/admin/dashboard/meetings');
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  // Handle edit navigation
  const handleEdit = () => {
    navigate(`/admin/dashboard/meetings/edit/${id}`);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/admin/dashboard/meetings');
  };

  // Loading state with matching design
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff7ed 100%)',
        }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
          <p className="mt-4 text-stone-600 font-medium">Loading meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <MeetingView
      meeting={meeting}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  );
};

export default MeetingViewPage;
