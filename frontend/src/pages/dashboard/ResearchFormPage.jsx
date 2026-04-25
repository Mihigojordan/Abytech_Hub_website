import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ResearchForm from '../../components/dashboard/research/ResearchForm';
import researchService from '../../services/researchService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const ResearchFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

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
            confirmButtonColor: ORG,
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
          confirmButtonColor: ORG,
        });
      } else {
        await researchService.createResearch(submitData);
        await Swal.fire({
          icon: 'success',
          title: 'Research Created!',
          text: 'Your research has been successfully created',
          confirmButtonColor: ORG,
        });
      }

      navigate('/admin/dashboard/research');
    } catch (error) {
      console.error('Submit error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to save research',
        confirmButtonColor: ORG,
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: bg }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin"
            style={{ borderColor: border, borderTopColor: ORG }}
          />
          <p style={{ ...ba(13, 600, { color: text2 }) }}>Loading research...</p>
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
