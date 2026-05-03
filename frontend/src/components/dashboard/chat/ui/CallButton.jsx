import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG } from '../../../../utils/homeConstants';

/**
 * Phone icon button shown in ChatHeader.
 * Disabled when a call is already active.
 */
const CallButton = ({ onCallStart, callState }) => {
  const { bg2, text3, border } = useDashboardTheme();
  const isDisabled = callState !== 'idle';

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.05, background: bg2 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      onClick={!isDisabled ? onCallStart : undefined}
      title={isDisabled ? 'Already in a call' : 'Voice Call'}
      style={{
        background: 'none',
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: 10,
        color: isDisabled ? text3 : ORG,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.2s',
      }}
    >
      <Phone style={{ width: 18, height: 18 }} />
    </motion.button>
  );
};

export default CallButton;
