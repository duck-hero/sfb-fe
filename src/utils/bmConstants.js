// BM Working mapping - dễ dàng mở rộng thêm
export const BM_WORKING_MAP = {
  1: 'KIENHUNG',
  2: 'NQL005',
  // Dành chỗ cho các giá trị khác trong tương lai
  // 3: 'VALUE_3',
  // 4: 'VALUE_4',
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
