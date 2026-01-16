// BM Working mapping - dễ dàng mở rộng thêm
export const BM_WORKING_MAP = {
  1: 'KIENHUNG',
  2: 'NQL-005',
  3: 'NQL-006',
  4: 'LUCKY5',
  5: 'PHÚ XUÂN ',
  6: 'VN',
};

// Helper function để lấy display text từ value
export const getBmWorkingDisplayText = (value) => {
  if (!value) return '-';
  return BM_WORKING_MAP[value] || `Unknown (${value})`;
};

// Helper function để lấy tất cả options cho dropdown
export const getBmWorkingOptions = () => {
  return Object.entries(BM_WORKING_MAP).map(([value, label]) => ({
    value: value,
    label: label,
  }));
};
