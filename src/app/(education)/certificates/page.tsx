'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessVertical } from '../../../shared/context/BusinessVerticalContext';
import { Navbar } from '../../../shared/components/layout/Navbar';
import { Footer } from '../../../shared/components/layout/Footer';
import { SectionHeading } from '../../../shared/components/common/SectionHeading';
import { Button } from '../../../shared/components/ui/Button';
import { Award, Download, Share, Calendar, User, GraduationCap, ExternalLink } from 'lucide-react';

interface Certificate {
  id: string;
  certificateNumber: string;
  issuedAt: string;
  verificationUrl?: string;
  course: {
    id: string;
    title: string;
    description: string;
    instructor: {
      name: string;
      title?: string;
    };
    duration: number;
    level: string;
  };
}

export default function CertificatesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { setVertical } = useBusinessVertical();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Set business vertical context
  useEffect(() => {
    setVertical('education');
  }, [setVertical]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [user, isLoaded, router]);

  useEffect(() => {
    if (!user) return;

    const fetchCertificates = async () => {
      try {
        const response = await fetch('/api/certificates');
        if (response.ok) {
          const data = await response.json();
          setCertificates(data.certificates);
        }
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  const handleDownloadCertificate = (certificate: Certificate) => {
    // This would generate and download the certificate PDF
    console.log('Downloading certificate:', certificate.id);
    alert('Certificate download feature coming soon!');
  };

  const handleShareCertificate = (certificate: Certificate) => {
    // This would open share modal or copy link to clipboard
    const shareText = `I've earned a certificate in "${certificate.course.title}" from TechGetAfrica! 🎓`;
    if (navigator.share) {
      navigator.share({
        title: 'My Certificate',
        text: shareText,
        url: certificate.verificationUrl || window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText + ' ' + (certificate.verificationUrl || window.location.href));
      alert('Certificate link copied to clipboard!');
    }
  };

  const handleVerifyCertificate = (certificate: Certificate) => {
    if (certificate.verificationUrl) {
      window.open(certificate.verificationUrl, '_blank');
    } else {
      alert('Verification URL not available');
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar vertical="education" />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar vertical="education" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <SectionHeading
            eyebrow="Your Achievements"
            title="Course Completion Certificates"
            description="Digital certificates for all courses you've successfully completed"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{certificates.length}</div>
            <div className="text-sm text-gray-600">Certificates Earned</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {certificates.reduce((total, cert) => total + cert.course.duration, 0)}h
            </div>
            <div className="text-sm text-gray-600">Total Learning Hours</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {certificates.length > 0 
                ? new Date(certificates[certificates.length - 1].issuedAt).getFullYear()
                : new Date().getFullYear()
              }
            </div>
            <div className="text-sm text-gray-600">Latest Certificate</div>
          </div>
        </div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <Award className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">No certificates yet</h3>
            <p className="text-gray-600 mb-6">
              Complete courses to earn your first certificate!
            </p>
            <Button onClick={() => router.push('/courses')}>
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8" />
                    <span className="text-sm opacity-90">Certificate</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{certificate.course.title}</h3>
                  <p className="text-sm opacity-90">
                    Completed on {new Date(certificate.issuedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Certificate Body */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Recipient */}
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Awarded to</p>
                        <p className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Instructor</p>
                        <p className="font-semibold text-gray-900">
                          {certificate.course.instructor.name}
                        </p>
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {certificate.course.duration}h
                        </p>
                        <p className="text-xs text-gray-600">Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {certificate.course.level}
                        </p>
                        <p className="text-xs text-gray-600">Level</p>
                      </div>
                    </div>

                    {/* Certificate Number */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Certificate ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {certificate.certificateNumber}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 mt-6">
                    <Button
                      size="sm"
                      onClick={() => handleDownloadCertificate(certificate)}
                      className="flex-1 flex items-center justify-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareCertificate(certificate)}
                      className="flex items-center justify-center"
                    >
                      <Share className="w-4 h-4" />
                    </Button>

                    {certificate.verificationUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyCertificate(certificate)}
                        className="flex items-center justify-center"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certificate Verification Info */}
        {certificates.length > 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Certificate Verification
                </h3>
                <p className="text-blue-800 mb-3">
                  All certificates issued by TechGetAfrica are digitally signed and can be 
                  verified for authenticity. Each certificate contains a unique verification 
                  code that can be used to confirm its validity.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    Learn About Verification
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    Verify a Certificate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
