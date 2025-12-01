export default function UserInfoSkeleton() {
  return (
    <div className="bg-primary-lightest min-h-screen px-4 pt-20 pb-10 animate-pulse">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Title */}
        <div className="h-7 w-60 bg-gray-300 rounded"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center space-y-4">
            <div className="w-28 h-28 bg-gray-300 rounded-full"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-28 bg-gray-200 rounded"></div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl space-y-3">
              <div className="h-5 w-32 bg-gray-300 rounded"></div>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl space-y-2">
              <div className="h-5 w-40 bg-gray-300 rounded"></div>
              <div className="h-4 w-60 bg-gray-200 rounded"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
