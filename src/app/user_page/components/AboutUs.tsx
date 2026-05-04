export default function AboutUs() {
  return (
    <div className="text-gray-900">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">About Us</h1>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl font-bold">MB</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">MakanBajet</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          MakanBajet is your ultimate food companion, helping you discover delicious 
          meals that fit your budget. We connect food lovers with affordable restaurants 
          in their area, making dining out accessible to everyone.
        </p>
      </div>
    </div>
  );
}