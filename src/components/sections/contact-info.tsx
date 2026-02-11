import { Mail, Phone, MapPin, Clock } from "lucide-react";

interface BusinessHour {
  days: string;
  hours: string;
}

interface ContactInfoSectionProps {
  content?: {
    phone?: string;
    email?: string;
    address?: string;
    businessHours?: BusinessHour[];
  };
}

export default function ContactInfoSection({ content }: ContactInfoSectionProps) {
  const phone = content?.phone || "(555) 555-5555";
  const email = content?.email || "info@example.com";
  const address = content?.address || "123 Main Street, City, State 12345";
  const businessHours = content?.businessHours || [
    { days: "Mon - Fri", hours: "9:00 am - 5:00 pm" },
    { days: "Sat - Sun", hours: "Closed" }
  ];

  return (
    <section id="contact-info" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Phone</h3>
              <p className="text-gray-600">{phone}</p>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="text-gray-600">{email}</p>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Address</h3>
              <p className="text-gray-600">{address}</p>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
              <div className="text-gray-600 space-y-1">
                {businessHours.map((schedule, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{schedule.days}:</span> {schedule.hours}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
