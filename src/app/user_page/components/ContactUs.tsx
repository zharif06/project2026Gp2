import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="text-gray-900">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h1>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900 font-medium">rookierank@makanbajet.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-gray-900 font-medium">+60 11-3414 1354</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-gray-900 font-medium">Jalan Sultan Yahya Petra, Universiti Teknologi Malaysia, 54100 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Business Hours</p>
              <p className="text-gray-900 font-medium">Mon - Sun: 9AM - 9PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}