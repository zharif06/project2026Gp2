"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, Trash2, Globe, Mail, Phone } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/register_page" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Registration
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-white" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Privacy Policy</h1>
                <p className="text-blue-100 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8 space-y-8">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-blue-800 text-sm">
                At MakanBajet, we take your privacy seriously. This policy describes how we collect, use, 
                and protect your personal information when you use our platform.
              </p>
            </div>

            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">1. Information We Collect</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p><strong>Account Information:</strong> When you register, we collect your email address, name, and profile picture (if provided).</p>
                <p><strong>Usage Data:</strong> We collect information about how you use our platform, including restaurants you view, save, or love.</p>
                <p><strong>Reviews & Interactions:</strong> Any reviews, ratings, comments, or suggestions you submit are stored and visible to other users.</p>
                <p><strong>Location Data:</strong> If you allow location access, we use it to show nearby restaurants. You can disable this anytime.</p>
                <p><strong>Device Information:</strong> We collect browser type, IP address, and device information for security and analytics.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">2. How We Use Your Information</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p><strong>Provide Services:</strong> To operate and maintain our restaurant discovery platform.</p>
                <p><strong>Personalization:</strong> To recommend restaurants based on your preferences and activity.</p>
                <p><strong>Communication:</strong> To send you important updates about your account or platform changes.</p>
                <p><strong>Improvement:</strong> To analyze usage patterns and improve our features.</p>
                <p><strong>Security:</strong> To detect and prevent fraudulent activity.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">3. Information Sharing</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p><strong>Public Information:</strong> Your reviews, ratings, and comments are visible to all users of the platform.</p>
                <p><strong>Restaurant Owners:</strong> Your reviews and suggestions are shared with restaurant owners to help them improve.</p>
                <p><strong>Service Providers:</strong> We use third-party services (Firebase, Cloudinary) to host and process your data.</p>
                <p><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights.</p>
                <p className="text-sm text-gray-500 mt-2">⚠️ We do NOT sell your personal information to third parties.</p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">4. Data Security</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p>We implement industry-standard security measures to protect your data:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Encrypted data transmission (SSL/TLS)</li>
                  <li>Secure Firebase Authentication</li>
                  <li>Regular security updates and monitoring</li>
                  <li>Access controls and authentication requirements</li>
                </ul>
                <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg mt-2">
                  ⚠️ While we strive to protect your data, no method of transmission over the internet is 100% secure.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">5. Your Rights</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p>You have the right to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Access</strong> - Request a copy of your personal data</li>
                  <li><strong>Correct</strong> - Update or fix inaccurate information</li>
                  <li><strong>Delete</strong> - Request deletion of your account and data</li>
                  <li><strong>Opt-out</strong> - Disable location tracking or marketing communications</li>
                </ul>
                <p>To exercise these rights, contact us at <strong>privacy@makanbajet.com</strong></p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">6. Cookies & Tracking</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Keep you logged in</li>
                  <li>Remember your preferences</li>
                  <li>Analyze platform usage</li>
                  <li>Improve user experience</li>
                </ul>
                <p>You can control cookie settings through your browser preferences.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">7. Contact Us</h2>
              </div>
              <div className="space-y-2 text-gray-700 ml-9">
                <p>If you have questions about this Privacy Policy, please contact us:</p>
                <p>📧 Email: <strong>rookierank@gmail.com</strong></p>
                <p>📞 Phone: <strong>+60 11-3414 1354</strong></p>
                <p>📍 Address: Jalan Sultan Yahya Petra, Universiti Teknologi Malaysia, 54100 Kuala Lumpur</p>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-sm text-gray-500 text-center">
                By using MakanBajet, you agree to this Privacy Policy. We may update this policy from time to time.
                Continued use of the platform constitutes acceptance of any changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}