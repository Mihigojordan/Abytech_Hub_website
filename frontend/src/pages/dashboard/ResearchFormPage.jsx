import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ResearchForm from '../../components/dashboard/research/ResearchForm';
import researchService from '../../services/researchService';

const ResearchFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [research, setResearch] = useState(null);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch research data when editing
  useEffect(() => {
    if (isEditMode) {
      const fetchResearch = async () => {
        try {
          setIsLoading(true);
          const data = await researchService.getResearchById(id);
          setResearch(data);
        } catch (error) {
          console.error('Failed to fetch research:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'Failed to load research data',
            confirmButtonColor: '#f97316',
          });
          navigate('/admin/dashboard/research');
        } finally {
          setIsLoading(false);
        }
      };
      fetchResearch();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);

      // Prepare submit data
      const submitData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || '',
        summary: formData.summary || '',
        type: formData.type,
        status: formData.status,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        problem: formData.problem?.map(p => ({
          title: p.title || '',
          description: p.description || '',
        })) || [],
        objective: formData.objective?.map(o => ({
          title: o.title || '',
          description: o.description || '',
        })) || [],
        methodology: formData.methodology?.map(m => ({
          title: m.title || '',
          description: m.description || '',
        })) || [],
        findings: formData.findings?.map(f => ({
          title: f.title || '',
          description: f.description || '',
        })) || [],
        conclusion: formData.conclusion?.map(c => ({
          title: c.title || '',
          description: c.description || '',
        })) || [],
        recommendations: formData.recommendations?.map(r => ({
          title: r.title || '',
          description: r.description || '',
        })) || [],
        attachments: formData.attachments || [],
      };

      // If editing, include existing attachments that weren't removed
      if (isEditMode && formData.existingAttachments) {
        submitData.existingAttachments = formData.existingAttachments;
      }

      if (isEditMode) {
        await researchService.updateResearch(id, submitData);
        await Swal.fire({
          icon: 'success',
          title: 'Research Updated!',
          text: 'Your research has been successfully updated',
          confirmButtonColor: '#f97316',
        });
      } else {
        await researchService.createResearch(submitData);
        await Swal.fire({
          icon: 'success',
          title: 'Research Created!',
          text: 'Your research has been successfully created',
          confirmButtonColor: '#f97316',
        });
      }

      navigate('/admin/dashboard/research');
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to save research',
        confirmButtonColor: '#f97316',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/dashboard/research');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-stone-500">Loading research...</p>
        </div>
      </div>
    );
  }

  return (
    <ResearchForm
      research={research}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
    />
  );
};

export default ResearchFormPage;
