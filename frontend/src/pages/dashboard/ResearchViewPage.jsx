import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ResearchView from '../../components/dashboard/research/ResearchView';
import researchService from '../../services/researchService';

const ResearchViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
          confirmButtonColor: '#f97316',
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-stone-500">Loading research...</p>
        </div>
      </div>
    );
  }

  if (!research) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/20 to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-stone-600">Research not found</p>
          <button
            onClick={handleBack}
            className="mt-4 text-orange-500 hover:text-orange-600 font-semibold"
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
