import { Phone, PhoneIncoming, PhoneMissed, PhoneOff } from 'lucide-react';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG } from '../../../../utils/homeConstants';

/**
 * Single row in the call history list (shown in InfoPanel).
 *
 * call: { id, callerId, callerType, callType, status, startedAt, endedAt, createdAt }
 * currentUserId: the logged-in admin's id
 */
const CallHistoryItem = ({ call, currentUserId }) => {
  const { bg2, textC, text2, text3, border } = useDashboardTheme();

  const isOutgoing = call.callerId === currentUserId;
  const isMissed   = call.status === 'missed';
  const isDeclined = call.status === 'declined';

  const iconColor = isMissed || isDeclined ? '#ef4444' : ORG;

  const Icon = isMissed || isDeclined
    ? PhoneMissed
    : isOutgoing
      ? Phone
      : PhoneIncoming;

  const label = isMissed
    ? 'Missed'
    : isDeclined
      ? 'Declined'
      : isOutgoing
        ? 'Outgoing'
        : 'Incoming';

  const duration = (() => {
    if (!call.startedAt || !call.endedAt) return null;
    const secs = Math.floor((new Date(call.endedAt) - new Date(call.startedAt)) / 1000);
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  })();

  const timeAgo = (() => {
    const diff = (Date.now() - new Date(call.createdAt)) / 60000;
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  })();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px',
      background: bg2,
      border: `1px solid ${border}`,
      borderRadius: 10,
    }}>
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: `${iconColor}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={16} color={iconColor} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: textC }}>{label} call</p>
        <p style={{ margin: 0, fontSize: 11, color: text3 }}>
          {duration ? `${duration} · ` : ''}{timeAgo}
        </p>
      </div>

      {/* Call type badge */}
      <span style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1,
        textTransform: 'uppercase', color: text2,
        padding: '2px 8px', borderRadius: 100,
        border: `1px solid ${border}`,
      }}>
        {call.callType}
      </span>
    </div>
  );
};

export default CallHistoryItem;
