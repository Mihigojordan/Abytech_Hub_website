import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ResearchView from '../../components/dashboard/research/ResearchView';
import researchService from '../../services/researchService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

const ResearchViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark, bg, bg2, bg3, textC, text2, text3, border } = useDashboardTheme();

  const [research, setResearch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/admin/dashboard/research/edit/${id}`);
  };

  const handleBack = () => {
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

  if (!research) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: bg }}
      >
        <div className="text-center">
          <p style={{ ...ba(16, 600, { color: textC }) }}>Research not found</p>
          <button
            onClick={handleBack}
            className="mt-4 font-semibold transition-opacity hover:opacity-80"
            style={{ color: ORG, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Back to Research List
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResearchView
      research={research}
      onEdit={handleEdit}
      onBack={handleBack}
    />
  );
};

export default ResearchViewPage;
