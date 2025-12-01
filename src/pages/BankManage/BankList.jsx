import React, { useEffect, useState } from "react";
import bankApi from "../../api/bankApi";

function BankList() {
  const [banks, setBanks] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchBanks = async (page, size) => {
    setLoading(true);
    try {
      const response = await bankApi.getBankList(page, size);

      // Lấy danh sách ngân hàng
      setBanks(response?.data || []);

      // Tính tổng số trang dựa vào totalItems
      const total = response?.totalItems ? Math.ceil(response.totalItems / size) : 1;
      setTotalPages(total);

      // Cập nhật pageNumber từ API nếu cần
      setPageNumber(response?.pageNumber || page);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ngân hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks(pageNumber, pageSize);
  }, [pageNumber, pageSize]);

  const handlePrev = () => {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  };

  const handleNext = () => {
    if (pageNumber < totalPages) setPageNumber(pageNumber + 1);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPageNumber(1); // reset về trang 1 khi thay đổi pageSize
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách ngân hàng</h1>

      <div className="mb-4 flex items-center gap-2">
        <span>Số bản ghi mỗi trang:</span>
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
        </select>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
<thead className="bg-gray-100">
  <tr>
    <th className="py-2 px-4 border-b text-left">STT</th>
    <th className="py-2 px-4 border-b text-left">Tên ngân hàng</th>
    <th className="py-2 px-4 border-b text-left">Mã ngân hàng</th>
  </tr>
</thead>

<tbody>
  {banks.map((bank, index) => (
    <tr key={bank.id} className="hover:bg-gray-50">
      <td className="py-2 px-4 border-b">
        {(pageNumber - 1) * pageSize + index + 1} {/* Tính STT */}
      </td>
      <td className="py-2 px-4 border-b">{bank.name}</td>
      <td className="py-2 px-4 border-b">{bank.codeBank}</td>
    </tr>
  ))}
</tbody>

        </table>
      )}

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrev}
          disabled={pageNumber === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Prev
        </button>

        <span>
          Page {pageNumber} / {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={pageNumber === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default BankList;
