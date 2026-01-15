import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ClipLoader } from "react-spinners";
import { Upload } from "lucide-react";
import { getBmWorkingOptions } from "../../utils/bmConstants";

export default function CreateAdsAccountModal({
  open,
  onClose,
  onSave,
  formData,
  onChange,
  saving,
  bmList = [], // Danh sách BM Account để chọn
  onImportClick,
}) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>

        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-xl transition-all"
              >

                {/* Title */}
                <Dialog.Title className="text-2xl font-semibold text-center mb-5">
                  Thêm tài khoản quảng cáo
                </Dialog.Title>

                {/* Form */}
                <div className="flex flex-col gap-4">

                  {/* Input 1: Tên Tài Khoản (adAccountName) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên tài khoản quảng cáo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="adAccountName" // Map API: adAccountName
                      value={formData.adAccountName}
                      onChange={onChange}
                      disabled={saving}
                      placeholder="Nhập tên tài khoản..."
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Input 2: ID Tài Khoản (adAccountIdNumber) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ID tài khoản FB <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="adAccountIdNumber" // Map API: adAccountIdNumber
                      value={formData.adAccountIdNumber}
                      onChange={onChange}
                      disabled={saving}
                      placeholder="Nhập ID tài khoản FB..."
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Input 3: Chọn BM (bmAccountId) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Chọn nguồn BM <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bmAccountId" // Map API: bmAccountId
                      value={formData.bmAccountId}
                      onChange={onChange}
                      disabled={saving}
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- BM Gốc --</option>
                      {bmList.map((bm) => (
                        <option key={bm.id} value={bm.id}>
                          {/* Hiển thị Tên BM hoặc ID BM */}
                          {bm.name || bm.bmId || `BM #${bm.id}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input 4: BM Working (bmWorking) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      BM Cầm
                    </label>
                    <select
                      name="bmWorking" // Map API: bmWorking
                      value={formData.bmWorking}
                      onChange={onChange}
                      disabled={saving}
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">-- BM Cầm --</option>
                      {getBmWorkingOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input 5: Account Status (status) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Trạng thái tài khoản
                    </label>
                    <select
                      name="status"
                      value={formData.status || "LIVE"}
                      onChange={onChange}
                      disabled={saving}
                      className="w-full h-12 border border-gray-300 rounded-xl px-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="LIVE">LIVE</option>
                      <option value="HOLD">HOLD</option>
                      <option value="BACK">BACK</option>
                      <option value="DIE">DIE</option>
                    </select>
                  </div>

                </div>

                {/* Import Button (Separate Row) */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={onImportClick}
                    disabled={saving}
                    className="w-full py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center text-sm font-semibold shadow-sm"
                  >
                    <Upload className="h-4 w-4 mr-2" /> Import TK (Excel)
                  </button>
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>

                  <button
                    onClick={onSave}
                    disabled={saving}
                    className={`w-32 py-2 rounded-xl font-semibold transition flex justify-center items-center ${saving
                        ? "bg-primary-darkest opacity-50 cursor-not-allowed"
                        : "bg-primary-dark text-white hover:bg-primary-darkest"
                      }`}
                  >
                    {saving ? (
                      <>
                        <ClipLoader size={18} color="#fff" />
                        <span className="ml-2 text-sm">Đang lưu...</span>
                      </>
                    ) : (
                      "Thêm mới"
                    )}
                  </button>
                </div>

              </Dialog.Panel>
            </Transition.Child>

          </div>
        </div>
      </Dialog>
    </Transition>
  );
}