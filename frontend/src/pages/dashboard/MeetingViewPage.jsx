import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import meetingService from '../../services/meetingService';
import MeetingView from '../../components/dashboard/meeting/MeetingView';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const MeetingViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

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
        style={{ background: bg, fontFamily: "'Barlow',sans-serif" }}
      >
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12"
            style={{
              border: `4px solid ${border}`,
              borderTopColor: ORG,
            }}
          />
          <p
            className="mt-4 font-medium"
            style={{ ...ba(14, 500, { color: text2 }) }}
          >
            Loading meeting...
          </p>
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
