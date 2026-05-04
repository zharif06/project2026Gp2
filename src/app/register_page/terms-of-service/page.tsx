"use client";

import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  Scale, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  Star, 
  MessageSquare, 
  Clock, 
  DollarSign,
  Mail,
  Phone
} from "lucide-react";

export default function TermsOfService() {
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
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-8">
            <div className="flex items-center gap-3">
              <FileText className="w-10 h-10 text-white" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Terms of Service</h1>
                <p className="text-gray-300 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8 space-y-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 text-sm">
                Welcome to MakanBajet! By accessing or using our platform, you agree to be bound by these Terms of Service. 
                Please read them carefully before using our services.
              </p>
            </div>

            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p>By registering for or using the MakanBajet platform, you agree to these Terms of Service and our Privacy Policy.</p>
                <p>If you do not agree to these terms, please do not use our platform.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">2. User Accounts</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p><strong>Eligibility:</strong> You must be at least 13 years old to use MakanBajet. By registering, you confirm you meet this requirement.</p>
                <p><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your login credentials.</p>
                <p><strong>Account Types:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Regular Users:</strong> Can discover restaurants, write reviews, and save favorites.</li>
                  <li><strong>Staff Members:</strong> Can manage restaurant listings submitted by their organization.</li>
                  <li><strong>Administrators:</strong> Have full platform management capabilities.</li>
                </ul>
                <p><strong>Account Termination:</strong> We reserve the right to suspend or terminate accounts that violate these terms.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">3. User Conduct & Content Guidelines</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p><strong>You agree NOT to:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Post false, misleading, or fraudulent reviews</li>
                  <li>Submit offensive, harassing, or discriminatory content</li>
                  <li>Impersonate another person or entity</li>
                  <li>Use automated bots or scripts to interact with the platform</li>
                  <li>Attempt to bypass security measures</li>
                  <li>Upload malicious code or viruses</li>
                </ul>
                <p><strong>Content Ownership:</strong> You retain ownership of your reviews and content, but grant MakanBajet a license to display and use them on our platform.</p>
                <div className="bg-yellow-50 p-3 rounded-lg mt-2">
                  <p className="text-sm text-yellow-800">⚠️ Inappropriate content may be removed without notice.</p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">4. Restaurant Information</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p><strong>Accuracy:</strong> Restaurant information is provided by the restaurant owners and users. We do not guarantee the accuracy of all listings.</p>
                <p><strong>Pricing:</strong> Estimated costs are approximate and may vary. Always confirm prices with the restaurant directly.</p>
                <p><strong>Hours of Operation:</strong> Operating hours may change. We recommend calling ahead to confirm.</p>
                <p><strong>Third-Party Links:</strong> We may link to external websites (Google Maps, restaurant websites). We are not responsible for their content.</p>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">5. Reviews & Ratings</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p><strong>Authenticity:</strong> You must have actually visited the restaurant before writing a review.</p>
                <p><strong>Honesty:</strong> Reviews should reflect your genuine experience.</p>
                <p><strong>Prohibited Reviews:</strong> Reviews posted in exchange for compensation, by competitors, or with malicious intent are prohibited.</p>
                <p><strong>Review Removal:</strong> We reserve the right to remove reviews that violate our guidelines.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">6. Payments & Transactions</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p>MakanBajet is currently a <strong>free platform</strong>. We do not process payments or handle transactions between users and restaurants.</p>
                <p>Any payments made directly to restaurants are between you and the establishment.</p>
                <p>We may introduce paid features in the future, and you will be notified before any charges apply.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">7. Service Availability</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p>We strive to keep MakanBajet available 24/7, but we do not guarantee uninterrupted access.</p>
                <p>We may perform maintenance, updates, or experience technical issues that temporarily affect service.</p>
                <p>We reserve the right to modify or discontinue any feature without prior notice.</p>
              </div>
            </section>

            {/* Section 8 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">8. Limitation of Liability</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p>To the maximum extent permitted by law:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>MakanBajet is provided "as is" without warranties of any kind</li>
                  <li>We are not liable for any damages arising from your use of the platform</li>
                  <li>We are not responsible for restaurant experiences, food quality, or service</li>
                  <li>We do not guarantee the accuracy of user-generated content</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">9. Indemnification</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p>You agree to indemnify and hold MakanBajet harmless from any claims, damages, or expenses arising from:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your violation of these Terms of Service</li>
                  <li>Your use of the platform</li>
                  <li>Your content or conduct</li>
                </ul>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">10. Governing Law</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p>These Terms of Service are governed by the laws of Malaysia. Any disputes shall be resolved in the courts of Kuala Lumpur, Malaysia.</p>
              </div>
            </section>

            {/* Section 11 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">11. Changes to Terms</h2>
              </div>
              <div className="space-y-3 text-gray-700 ml-9">
                <p>We may update these Terms of Service periodically. We will notify you of material changes via email or platform notification.</p>
                <p>Continued use of the platform after changes constitutes acceptance of the new terms.</p>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-gray-800" />
                <h2 className="text-xl font-bold text-gray-900">12. Contact Information</h2>
              </div>
              <div className="space-y-2 text-gray-700 ml-9">
                <p>For questions about these Terms of Service, please contact us:</p>
                <p>📧 Email: <strong>rookierank@gmail.com</strong></p>
                <p>📞 Phone: <strong>+60 11-3414 1354</strong></p>
                <p>📍 Address: Jalan Sultan Yahya Petra, Universiti Teknologi Malaysia, 54100 Kuala Lumpur</p>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-sm text-gray-500 text-center">
                By registering for MakanBajet, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}