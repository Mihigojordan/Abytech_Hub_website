import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import meetingService from '../../services/meetingService';
import adminAuthService from '../../services/adminAuthService';
import MeetingForm from '../../components/dashboard/meeting/MeetingForm';

const MeetingFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [admins, setAdmins] = useState([]);
  const [meeting, setMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch admins and meeting data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Always fetch admins
        const adminsResponse = await adminAuthService.getAllAdmins();
        // Handle both { admins: [...] } and direct array response
        setAdmins(adminsResponse.admins || adminsResponse || []);

        // Fetch meeting if editing
        if (id) {
          const meetingData = await meetingService.getMeetingById(id);
          setMeeting(meetingData);
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to load data',
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

  // Handle form submission
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      // DEBUG: Log the raw form data
      console.log('=== RAW FORM DATA ===');
      console.log('participants:', formData.participants);

      // Prepare data for the service
      // The meetingService handles FormData creation internally
      const submitData = {
        title: formData.title,
        description: formData.description || '',
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        status: formData.status,
        location: formData.location || '',
        meetingLink: formData.meetingLink || '',
        participants: formData.participants?.map(p => ({
          adminId: p.adminId || '',
          adminName: p.name || '',
          adminEmail: p.email || '',
          role: p.role || 'ATTENDEE',
          attended: p.attended || false,
        })) || [],
        keyPoints: formData.keyPoints?.map(k => ({
          content: k.title || k.content || '',
          notes: k.notes || '',
          important: k.important || false,
        })) || [],
        actionItems: formData.actionItems?.map(a => ({
          title: a.task || a.title || '',
          assignedTo: a.assignedTo?.name || a.assignedTo || '',
          dueDate: a.dueDate ? new Date(a.dueDate).toISOString() : null,
          completed: a.completed || false,
        })) || [],
        // For file attachments - filter to only include File objects (new uploads)
        attachments: formData.attachments?.filter(a => a.file instanceof File).map(a => a.file) || [],
      };

      // DEBUG: Log the mapped submit data
      console.log('=== MAPPED SUBMIT DATA ===');
      console.log('participants:', submitData.participants);

      if (isEditMode) {
        await meetingService.updateMeeting(id, submitData);
        await Swal.fire({
          icon: 'success',
          title: 'Meeting Updated!',
          text: 'Your meeting has been successfully updated',
          confirmButtonColor: '#f97316',
        });
      } else {
        await meetingService.createMeeting(submitData);
        await Swal.fire({
          icon: 'success',
          title: 'Meeting Created!',
          text: 'Your meeting has been successfully created',
          confirmButtonColor: '#f97316',
        });
      }
      navigate('/admin/dashboard/meetings');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || `Failed to ${isEditMode ? 'update' : 'create'} meeting`,
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
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
          <p className="mt-4 text-stone-600 font-medium">
            {isEditMode ? 'Loading meeting...' : 'Preparing form...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <MeetingForm
      meeting={meeting}
      admins={admins}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
    />
  );
};

export default MeetingFormPage;
