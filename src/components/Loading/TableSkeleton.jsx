import { SquarePen, Trash   } from 'lucide-react';

export default function TableSkeleton() {
  const rows = 5; // <-- thêm dòng này

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4 whitespace-nowrap w-1/12">
        <div className="h-4 bg-gray-200 rounded w-6"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap flex items-center w-1/12">
        <div className="mr-3">
          <SquarePen className="h-5 w-5 text-gray-300 flex-shrink-0" />
        </div>
        <div>
          <Trash className="h-5 w-5 text-gray-300 flex-shrink-0" />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="overflow-x-auto shadow-lg rounded-xl bg-white p-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-md font-medium text-primary-darkest uppercase tracking-wider w-1/12">#</th>
            <th scope="col" className="px-6 py-3 text-left text-md font-medium text-primary-darkest tracking-wider w-1/4">Tên ngân hàng</th>
            <th scope="col" className="px-6 py-3 text-left text-md font-medium text-primary-darkest tracking-wider w-1/4">Mã ngân hàng</th>
            <th scope="col" className="px-6 py-3 text-left text-md font-medium text-primary-darkest tracking-wider w-1/12">Tùy chọn</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(rows)].map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
        <tfoot className="bg-white">
          <tr>
            <td colSpan="4" className="px-6 py-3">
              <div className="flex justify-end items-center text-sm animate-pulse">
                <div className="flex items-center gap-2 mr-6">
                  <span className="text-gray-400">Hiển thị:</span>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-40 bg-gray-200 rounded mr-6"></div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full h-8 w-8 bg-gray-200"></div>
                  <div className="p-2 rounded-full h-8 w-8 bg-gray-200"></div>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
